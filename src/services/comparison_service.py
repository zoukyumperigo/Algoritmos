"""
Serviço de comparação entre pedido e fatura
"""
from typing import Dict
from ..models.order import Order
from ..models.invoice import Invoice
from ..models.comparison import (
    ComparisonResult, Divergence, DivergenceType, Severity
)
from .normalization_service import NormalizationService


class ComparisonService:
    """Serviço responsável por comparar pedidos com faturas"""

    def __init__(self):
        self.normalization = NormalizationService()

    def compare(self, order: Order, invoice: Invoice, operator_name: str = "") -> ComparisonResult:
        """
        Compara pedido com fatura e retorna resultado detalhado.

        Args:
            order: Pedido do WhatsApp
            invoice: Fatura do SAGE
            operator_name: Nome do operador realizando a comparação

        Returns:
            ComparisonResult com todas as divergências encontradas
        """
        result = ComparisonResult(
            operator_name=operator_name,
            order_reference=order,
            invoice_reference=invoice
        )

        # 1. VALIDAR CLIENTE (CRÍTICO)
        if order.normalized_customer != invoice.normalized_customer:
            # Tentar fuzzy match
            similarity = self.normalization.similarity(
                order.normalized_customer,
                invoice.normalized_customer
            )

            if similarity < 0.90:  # Menos de 90% de similaridade = erro
                result.add_divergence(Divergence(
                    divergence_type=DivergenceType.CUSTOMER_MISMATCH,
                    severity=Severity.CRITICAL,
                    description="Cliente da fatura diferente do pedido",
                    expected_value=order.customer,
                    actual_value=invoice.customer,
                    confidence=1.0 - similarity
                ))
                # Erro crítico - cliente errado é muito grave
                # Mas continuamos a análise para detectar outros problemas

        # 2. VALIDAR DISTRIBUIDOR
        if order.normalized_distributor != invoice.normalized_distributor:
            similarity = self.normalization.similarity(
                order.normalized_distributor,
                invoice.normalized_distributor
            )

            if similarity < 0.90:
                result.add_divergence(Divergence(
                    divergence_type=DivergenceType.DISTRIBUTOR_MISMATCH,
                    severity=Severity.CRITICAL,
                    description="Distribuidor da fatura diferente do pedido",
                    expected_value=order.distributor,
                    actual_value=invoice.distributor,
                    confidence=1.0 - similarity
                ))

        # 3. CRIAR MAPAS DE PRODUTOS
        order_products = self._create_product_map(order)
        invoice_products = self._create_product_map(invoice)

        # 4. VERIFICAR PRODUTOS DO PEDIDO NA FATURA
        for normalized_name, order_item in order_products.items():
            if normalized_name in invoice_products:
                # Produto encontrado - verificar quantidade
                invoice_item = invoice_products[normalized_name]

                if order_item.quantity != invoice_item.quantity:
                    # Calcular diferença
                    diff = invoice_item.quantity - order_item.quantity
                    diff_pct = abs(diff) / order_item.quantity * 100

                    # Se diferença for muito grande, é erro
                    severity = Severity.ERROR if diff_pct > 50 else Severity.WARNING

                    result.add_divergence(Divergence(
                        divergence_type=DivergenceType.QUANTITY_MISMATCH,
                        severity=severity,
                        description=f"Quantidade diferente ({diff:+d})",
                        product_name=order_item.product_name,
                        expected_value=order_item.quantity,
                        actual_value=invoice_item.quantity,
                        confidence=1.0
                    ))
            else:
                # Produto não encontrado - tentar fuzzy match
                match_result = self.normalization.find_similar(
                    normalized_name,
                    list(invoice_products.keys()),
                    threshold=0.85
                )

                if match_result:
                    matched_name, similarity = match_result
                    invoice_item = invoice_products[matched_name]

                    # Produto encontrado com nome similar
                    if order_item.quantity != invoice_item.quantity:
                        result.add_divergence(Divergence(
                            divergence_type=DivergenceType.QUANTITY_MISMATCH,
                            severity=Severity.WARNING,
                            description=f"Quantidade diferente (nome similar: {similarity:.0%})",
                            product_name=order_item.product_name,
                            expected_value=order_item.quantity,
                            actual_value=invoice_item.quantity,
                            confidence=similarity
                        ))
                else:
                    # Produto totalmente ausente
                    result.add_divergence(Divergence(
                        divergence_type=DivergenceType.PRODUCT_MISSING,
                        severity=Severity.ERROR,
                        description="Produto pedido não está na fatura",
                        product_name=order_item.product_name,
                        expected_value=order_item.quantity,
                        actual_value=0,
                        confidence=1.0
                    ))

        # 5. VERIFICAR PRODUTOS NA FATURA QUE NÃO FORAM PEDIDOS
        for normalized_name, invoice_item in invoice_products.items():
            if normalized_name not in order_products:
                # Verificar se não foi já detectado no fuzzy match
                match_result = self.normalization.find_similar(
                    normalized_name,
                    list(order_products.keys()),
                    threshold=0.85
                )

                if not match_result:
                    # Produto extra não pedido
                    result.add_divergence(Divergence(
                        divergence_type=DivergenceType.PRODUCT_EXTRA,
                        severity=Severity.ERROR,
                        description="Produto faturado mas não foi pedido",
                        product_name=invoice_item.product_name,
                        expected_value=0,
                        actual_value=invoice_item.quantity,
                        confidence=1.0
                    ))

        return result

    def _create_product_map(self, order_or_invoice) -> Dict:
        """
        Cria mapa de produtos normalizados.

        Args:
            order_or_invoice: Order ou Invoice object

        Returns:
            Dict com {normalized_name: item}
        """
        product_map = {}
        for item in order_or_invoice.items:
            product_map[item.normalized_name] = item
        return product_map

    def quick_validation(self, order: Order, invoice: Invoice) -> bool:
        """
        Validação rápida (apenas cliente e total de itens).

        Args:
            order: Pedido
            invoice: Fatura

        Returns:
            True se validação básica passou
        """
        # Cliente deve ser o mesmo
        if order.normalized_customer != invoice.normalized_customer:
            return False

        # Total de produtos deve ser similar (±20%)
        order_total = order.total_items
        invoice_total = invoice.total_items

        if invoice_total == 0:
            return False

        diff_pct = abs(order_total - invoice_total) / invoice_total * 100

        return diff_pct <= 20
