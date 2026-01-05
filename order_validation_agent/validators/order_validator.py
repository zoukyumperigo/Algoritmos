"""
Order Validator - Validador principal de encomendas vs faturas
"""
from decimal import Decimal
from typing import Dict, Optional
from ..models.order import Order, OrderItem
from ..models.invoice import Invoice, InvoiceItem
from ..models.validation_result import (
    ValidationResult, ValidationError, ErrorLevel, ErrorType
)


class OrderValidator:
    """
    Validador de encomendas vs faturas
    Compara dados do WhatsApp com dados do Sage
    """

    def __init__(self,
                 quantity_tolerance: float = 0.01,  # Tolerância de 1% para quantidades
                 price_variance_threshold: Decimal = Decimal("0.15")):  # 15% variação de preço
        """
        Inicializa o validador

        Args:
            quantity_tolerance: Tolerância percentual para diferenças de quantidade
            price_variance_threshold: Limite de variação de preço aceitável
        """
        self.quantity_tolerance = quantity_tolerance
        self.price_variance_threshold = price_variance_threshold
        self.price_reference: Dict[str, Decimal] = {}  # Preços de referência por produto

    def set_price_reference(self, product_code: str, reference_price: Decimal):
        """Define preço de referência para um produto"""
        self.price_reference[product_code] = reference_price

    def load_price_references(self, price_dict: Dict[str, Decimal]):
        """Carrega múltiplos preços de referência"""
        self.price_reference.update(price_dict)

    def validate(self, order: Order, invoice: Invoice) -> ValidationResult:
        """
        Valida uma encomenda contra sua fatura

        Args:
            order: Encomenda recebida via WhatsApp
            invoice: Fatura gerada no Sage

        Returns:
            ValidationResult com todos os erros detectados
        """
        result = ValidationResult(
            order_id=order.order_id,
            invoice_number=invoice.invoice_number,
            client_name=order.client_name
        )

        # Validação 1: Cliente corresponde
        self._validate_client(order, invoice, result)

        # Validação 2: Produtos da encomenda estão na fatura
        self._validate_order_products(order, invoice, result)

        # Validação 3: Produtos extras na fatura que não estão na encomenda
        self._validate_extra_products(order, invoice, result)

        # Validação 4: Preços anômalos
        self._validate_prices(invoice, result)

        return result

    def _validate_client(self, order: Order, invoice: Invoice, result: ValidationResult):
        """Valida se o cliente corresponde"""
        if order.client_code != invoice.client_code:
            error = ValidationError(
                error_type=ErrorType.CLIENT_MISMATCH,
                level=ErrorLevel.CRITICO,
                product_code="N/A",
                product_name="Cliente",
                description=f"Cliente não corresponde",
                expected_value=f"{order.client_name} ({order.client_code})",
                actual_value=f"{invoice.client_name} ({invoice.client_code})",
                financial_impact=Decimal("0.0")
            )
            result.add_error(error)

    def _validate_order_products(self, order: Order, invoice: Invoice, result: ValidationResult):
        """Valida produtos da encomenda contra a fatura"""
        for order_item in order.items:
            invoice_item = invoice.get_item_by_code(order_item.product_code)

            if invoice_item is None:
                # Produto está na encomenda mas não na fatura
                error = ValidationError(
                    error_type=ErrorType.PRODUCT_MISSING,
                    level=ErrorLevel.CRITICO,
                    product_code=order_item.product_code,
                    product_name=order_item.product_name,
                    description=f"Produto pedido mas não faturado",
                    expected_value=f"{order_item.quantity} {order_item.unit}",
                    actual_value="0",
                    financial_impact=Decimal("0.0")  # Não podemos calcular sem preço
                )
                result.add_error(error)
            else:
                # Produto existe, validar quantidade
                self._validate_quantity(order_item, invoice_item, result)

    def _validate_extra_products(self, order: Order, invoice: Invoice, result: ValidationResult):
        """Detecta produtos na fatura que não estão na encomenda"""
        for invoice_item in invoice.items:
            order_item = order.get_item_by_code(invoice_item.product_code)

            if order_item is None:
                # Produto na fatura mas não na encomenda
                impact = invoice_item.total
                error = ValidationError(
                    error_type=ErrorType.PRODUCT_EXTRA,
                    level=ErrorLevel.CRITICO,
                    product_code=invoice_item.product_code,
                    product_name=invoice_item.product_name,
                    description=f"Produto faturado sem ter sido pedido",
                    expected_value="0",
                    actual_value=f"{invoice_item.quantity} {invoice_item.unit}",
                    financial_impact=impact
                )
                result.add_error(error)

    def _validate_quantity(self, order_item: OrderItem, invoice_item: InvoiceItem,
                          result: ValidationResult):
        """Valida quantidade encomendada vs faturada"""
        expected = order_item.quantity
        actual = invoice_item.quantity

        # Calcula diferença percentual
        if expected > 0:
            diff_percentage = abs(actual - expected) / expected
        else:
            diff_percentage = 1.0 if actual > 0 else 0.0

        if diff_percentage > self.quantity_tolerance:
            # Determina nível de criticidade baseado na diferença
            if diff_percentage > 0.20:  # Mais de 20% de diferença
                level = ErrorLevel.CRITICO
            elif diff_percentage > 0.05:  # Entre 5% e 20%
                level = ErrorLevel.MEDIO
            else:  # Entre 1% e 5%
                level = ErrorLevel.BAIXO

            # Calcula impacto financeiro
            quantity_diff = abs(actual - expected)
            impact = Decimal(str(quantity_diff)) * invoice_item.unit_price

            error = ValidationError(
                error_type=ErrorType.QUANTITY_MISMATCH,
                level=level,
                product_code=order_item.product_code,
                product_name=order_item.product_name,
                description=f"Quantidade divergente ({diff_percentage*100:.1f}% diferença)",
                expected_value=f"{expected} {order_item.unit}",
                actual_value=f"{actual} {invoice_item.unit}",
                financial_impact=impact
            )
            result.add_error(error)

    def _validate_prices(self, invoice: Invoice, result: ValidationResult):
        """Valida se os preços estão dentro do esperado"""
        for invoice_item in invoice.items:
            if invoice_item.product_code in self.price_reference:
                reference_price = self.price_reference[invoice_item.product_code]
                actual_price = invoice_item.unit_price

                # Calcula variação percentual
                if reference_price > 0:
                    variance = abs(actual_price - reference_price) / reference_price
                else:
                    variance = Decimal("1.0") if actual_price > 0 else Decimal("0.0")

                if variance > self.price_variance_threshold:
                    # Preço muito diferente do esperado
                    level = ErrorLevel.MEDIO if variance < Decimal("0.30") else ErrorLevel.CRITICO

                    # Impacto é a diferença de preço multiplicada pela quantidade
                    price_diff = abs(actual_price - reference_price)
                    impact = price_diff * Decimal(str(invoice_item.quantity))

                    error = ValidationError(
                        error_type=ErrorType.PRICE_ANOMALY,
                        level=level,
                        product_code=invoice_item.product_code,
                        product_name=invoice_item.product_name,
                        description=f"Preço anômalo ({variance*100:.1f}% variação)",
                        expected_value=f"€{reference_price}",
                        actual_value=f"€{actual_price}",
                        financial_impact=impact
                    )
                    result.add_error(error)

    def quick_validate(self, order: Order, invoice: Invoice) -> str:
        """
        Validação rápida retornando apenas o resumo

        Args:
            order: Encomenda
            invoice: Fatura

        Returns:
            String com resumo da validação
        """
        result = self.validate(order, invoice)
        return str(result)
