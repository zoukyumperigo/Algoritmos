"""
Parser para mensagens de WhatsApp
"""
import re
from typing import List, Optional
from ..models.order import Order, OrderItem
from ..services.normalization_service import NormalizationService


class WhatsAppParser:
    """
    Parser para extrair pedidos de mensagens WhatsApp.

    Formato esperado:
        DISTRIBUIDOR LDA
        Restaurante Nome do Cliente
        5 PRODUTO A
        2 PRODUTO B
        1 PRODUTO C
    """

    def __init__(self):
        self.normalization = NormalizationService()

    def parse_text(self, text: str) -> Optional[Order]:
        """
        Faz parse de texto do WhatsApp.

        Args:
            text: Texto da mensagem WhatsApp

        Returns:
            Order object ou None se falhar
        """
        if not text or not text.strip():
            return None

        lines = [line.strip() for line in text.strip().split('\n') if line.strip()]

        if len(lines) < 3:
            raise ValueError("Mensagem muito curta. Mínimo: Distribuidor, Cliente e 1 produto")

        # Linha 1: Distribuidor
        distributor = lines[0].strip()

        # Linha 2: Cliente (pode começar com "Restaurante" ou não)
        customer_line = lines[1].strip()
        customer = re.sub(r'^(Restaurante|Restaurant|Rest\.?)\s*:?\s*', '', customer_line, flags=re.IGNORECASE)

        # Linhas restantes: Produtos
        items = []
        for line in lines[2:]:
            # Ignorar linhas vazias ou muito curtas
            if len(line) < 3:
                continue

            # Tentar extrair quantidade e produto
            item = self._parse_product_line(line)
            if item:
                items.append(item)

        if not items:
            raise ValueError("Nenhum produto encontrado na mensagem")

        order = Order(
            distributor=distributor,
            customer=customer,
            items=items,
            raw_text=text
        )

        return order

    def parse_file(self, file_path: str) -> Optional[Order]:
        """
        Lê ficheiro TXT e faz parse.

        Args:
            file_path: Caminho do ficheiro

        Returns:
            Order object
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            return self.parse_text(text)
        except Exception as e:
            raise ValueError(f"Erro ao ler ficheiro: {e}")

    def _parse_product_line(self, line: str) -> Optional[OrderItem]:
        """
        Extrai quantidade e produto de uma linha.

        Formatos aceites:
            "5 CAMARÃO 20/30"
            "2 kg POTA LIMPA"
            "1x LULA INTEIRA"

        Args:
            line: Linha de texto

        Returns:
            OrderItem ou None
        """
        # Regex para capturar quantidade e produto
        # Aceita: "5 PRODUTO", "5kg PRODUTO", "5x PRODUTO", "5 un PRODUTO"
        pattern = r'^(\d+(?:[.,]\d+)?)\s*(?:kg|kgs|kg\.?|un|und|unidade|unidades|x)?\s*(.+)$'

        match = re.match(pattern, line.strip(), re.IGNORECASE)

        if match:
            qty_str = match.group(1).replace(',', '.')
            quantity = int(float(qty_str))
            product_name = match.group(2).strip()

            # Validar nome do produto
            if self.normalization.is_valid_product_name(product_name):
                return OrderItem(
                    product_name=product_name,
                    quantity=quantity
                )

        return None

    def validate_format(self, text: str) -> tuple[bool, str]:
        """
        Valida se o texto está no formato esperado.

        Args:
            text: Texto a validar

        Returns:
            (válido: bool, mensagem_erro: str)
        """
        if not text or not text.strip():
            return (False, "Texto vazio")

        lines = [line.strip() for line in text.strip().split('\n') if line.strip()]

        if len(lines) < 3:
            return (False, "Mínimo de 3 linhas (Distribuidor, Cliente, Produtos)")

        # Verificar se tem pelo menos 1 linha de produto válida
        has_valid_product = False
        for line in lines[2:]:
            if self._parse_product_line(line):
                has_valid_product = True
                break

        if not has_valid_product:
            return (False, "Nenhum produto válido encontrado")

        return (True, "OK")
