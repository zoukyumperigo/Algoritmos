"""
Testes para comparação
"""
import pytest
from src.models.order import Order, OrderItem
from src.models.invoice import Invoice, InvoiceItem
from src.services.comparison_service import ComparisonService
from src.models.comparison import Severity


class TestComparisonService:
    """Testes do serviço de comparação"""

    def test_perfect_match(self):
        """Testa comparação perfeita (sem erros)"""
        # Criar pedido
        order = Order(
            distributor="MAR AZUL LDA",
            customer="Sol Nascente",
            items=[
                OrderItem("CAMARÃO 20/30", 5),
                OrderItem("POTA LIMPA", 2)
            ]
        )

        # Criar fatura idêntica
        invoice = Invoice(
            distributor="MAR AZUL LDA",
            customer="Sol Nascente",
            items=[
                InvoiceItem("CAMARÃO 20/30", 5),
                InvoiceItem("POTA LIMPA", 2)
            ]
        )

        # Comparar
        service = ComparisonService()
        result = service.compare(order, invoice)

        assert result.status == "OK"
        assert len(result.divergences) == 0
        assert result.confidence_score == 100.0

    def test_wrong_customer(self):
        """Testa cliente errado (erro crítico)"""
        order = Order(
            distributor="MAR AZUL LDA",
            customer="Sol Nascente",
            items=[OrderItem("CAMARÃO", 5)]
        )

        invoice = Invoice(
            distributor="MAR AZUL LDA",
            customer="Lua Cheia",  # Cliente diferente
            items=[InvoiceItem("CAMARÃO", 5)]
        )

        service = ComparisonService()
        result = service.compare(order, invoice)

        assert result.status in ["ERRO_CRITICO", "ERRO"]
        assert result.critical_count >= 1

    def test_quantity_mismatch(self):
        """Testa quantidade diferente"""
        order = Order(
            distributor="MAR AZUL LDA",
            customer="Sol Nascente",
            items=[OrderItem("CAMARÃO", 5)]
        )

        invoice = Invoice(
            distributor="MAR AZUL LDA",
            customer="Sol Nascente",
            items=[InvoiceItem("CAMARÃO", 3)]  # Quantidade diferente
        )

        service = ComparisonService()
        result = service.compare(order, invoice)

        assert len(result.divergences) > 0
        assert result.warning_count >= 1 or result.error_count >= 1

    def test_missing_product(self):
        """Testa produto em falta"""
        order = Order(
            distributor="MAR AZUL LDA",
            customer="Sol Nascente",
            items=[
                OrderItem("CAMARÃO", 5),
                OrderItem("LULA", 1)  # Este vai faltar
            ]
        )

        invoice = Invoice(
            distributor="MAR AZUL LDA",
            customer="Sol Nascente",
            items=[InvoiceItem("CAMARÃO", 5)]  # Sem LULA
        )

        service = ComparisonService()
        result = service.compare(order, invoice)

        assert len(result.divergences) > 0
        assert result.error_count >= 1

    def test_extra_product(self):
        """Testa produto não pedido"""
        order = Order(
            distributor="MAR AZUL LDA",
            customer="Sol Nascente",
            items=[OrderItem("CAMARÃO", 5)]
        )

        invoice = Invoice(
            distributor="MAR AZUL LDA",
            customer="Sol Nascente",
            items=[
                InvoiceItem("CAMARÃO", 5),
                InvoiceItem("POLVO", 2)  # Não foi pedido
            ]
        )

        service = ComparisonService()
        result = service.compare(order, invoice)

        assert len(result.divergences) > 0
        assert result.error_count >= 1
