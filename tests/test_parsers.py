"""
Testes para parsers
"""
import pytest
from src.parsers.whatsapp_parser import WhatsAppParser
from src.models.order import Order


class TestWhatsAppParser:
    """Testes do parser de WhatsApp"""

    def test_parse_valid_text(self):
        """Testa parse de texto válido"""
        text = """MAR AZUL LDA
Restaurante Sol Nascente
5 CAMARÃO 20/30
2 POTA LIMPA
1 LULA INTEIRA"""

        parser = WhatsAppParser()
        order = parser.parse_text(text)

        assert order is not None
        assert order.distributor == "MAR AZUL LDA"
        assert order.customer == "Sol Nascente"
        assert len(order.items) == 3
        assert order.items[0].quantity == 5
        assert order.items[0].product_name == "CAMARÃO 20/30"

    def test_parse_empty_text(self):
        """Testa parse de texto vazio"""
        parser = WhatsAppParser()
        order = parser.parse_text("")

        assert order is None

    def test_parse_missing_products(self):
        """Testa parse sem produtos"""
        text = """MAR AZUL LDA
Restaurante Sol Nascente"""

        parser = WhatsAppParser()

        with pytest.raises(ValueError, match="Nenhum produto encontrado"):
            parser.parse_text(text)

    def test_validate_format_valid(self):
        """Testa validação de formato válido"""
        text = """MAR AZUL LDA
Restaurante Sol Nascente
5 CAMARÃO"""

        parser = WhatsAppParser()
        valid, msg = parser.validate_format(text)

        assert valid is True
        assert msg == "OK"

    def test_validate_format_invalid(self):
        """Testa validação de formato inválido"""
        parser = WhatsAppParser()
        valid, msg = parser.validate_format("texto curto")

        assert valid is False
        assert "Mínimo" in msg
