"""
Parser para faturas do SAGE em formato PDF
"""
import os
import re
from typing import Optional, List
from ..models.invoice import Invoice, InvoiceItem


class SagePdfParser:
    """
    Parser para ficheiros PDF do SAGE.

    Extrai texto do PDF e tenta identificar produtos, quantidades e valores.
    """

    def parse_file(self, file_path: str) -> Optional[Invoice]:
        """
        Faz parse de ficheiro PDF.

        Args:
            file_path: Caminho do ficheiro PDF

        Returns:
            Invoice object
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Ficheiro não encontrado: {file_path}")

        try:
            # Extrair texto do PDF
            text = self._extract_text(file_path)

            # Parse do texto
            distributor, customer, invoice_number = self._extract_header_info(text)
            items = self._extract_items(text)

            if not items:
                raise ValueError("Nenhum produto encontrado no PDF")

            invoice = Invoice(
                distributor=distributor or "N/A",
                customer=customer or "N/A",
                items=items,
                invoice_number=invoice_number or "",
                source_file=file_path,
                source_format="pdf"
            )

            return invoice

        except Exception as e:
            raise ValueError(f"Erro ao processar PDF: {e}")

    def _extract_text(self, file_path: str) -> str:
        """
        Extrai texto de PDF.

        Tenta múltiplas bibliotecas para máxima compatibilidade.
        """
        text = ""

        # Tentar PyPDF2 primeiro
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except:
            pass

        # Fallback: pdfplumber
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
            return text
        except:
            pass

        # Fallback: PyMuPDF (fitz)
        try:
            import fitz
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            return text
        except:
            pass

        raise ValueError("Não foi possível extrair texto do PDF. Instale PyPDF2, pdfplumber ou PyMuPDF")

    def _extract_header_info(self, text: str) -> tuple:
        """
        Extrai distribuidor, cliente e número de fatura.

        Returns:
            (distributor, customer, invoice_number)
        """
        distributor = None
        customer = None
        invoice_number = None

        lines = text.split('\n')

        for line in lines[:20]:  # Procurar nas primeiras 20 linhas
            # Distribuidor
            if not distributor and re.search(r'\b(LDA|SA|LIMITADA|UNIPESSOAL)\b', line, re.IGNORECASE):
                distributor = line.strip()

            # Cliente
            if not customer:
                match = re.search(r'(?:Cliente|Customer|Restaurante|Restaurant)\s*:?\s*(.+)', line, re.IGNORECASE)
                if match:
                    customer = match.group(1).strip()

            # Número de fatura
            if not invoice_number:
                match = re.search(r'(?:Fatura|Factura|Invoice|Fat\.?)\s*N[º°]?\s*:?\s*(\S+)', line, re.IGNORECASE)
                if match:
                    invoice_number = match.group(1).strip()

        return (distributor, customer, invoice_number)

    def _extract_items(self, text: str) -> List[InvoiceItem]:
        """
        Extrai lista de produtos do texto.

        Procura por padrões como:
        - "5 CAMARÃO 20/30 €10.00 €50.00"
        - "POTA LIMPA 2 15.50 31.00"
        """
        items = []
        lines = text.split('\n')

        # Padrões para detectar linhas de produtos
        # Formato: quantidade produto preço total
        # ou: produto quantidade preço total
        patterns = [
            # Padrão 1: Qtd Produto Preço Total
            r'(\d+)\s+([A-Za-zÀ-ÿ0-9/\s]+?)\s+€?\s*(\d+[.,]\d{2})\s+€?\s*(\d+[.,]\d{2})',
            # Padrão 2: Produto Qtd Preço Total
            r'([A-Za-zÀ-ÿ0-9/\s]+?)\s+(\d+)\s+€?\s*(\d+[.,]\d{2})\s+€?\s*(\d+[.,]\d{2})',
            # Padrão 3: Qtd Produto (sem preços)
            r'(\d+)\s+([A-Za-zÀ-ÿ0-9/\s]{3,})',
        ]

        for line in lines:
            line = line.strip()
            if len(line) < 5:
                continue

            for pattern in patterns:
                match = re.match(pattern, line)
                if match:
                    groups = match.groups()

                    # Determinar qual grupo é qual
                    if len(groups) == 4:
                        # Com preços
                        try:
                            # Tentar formato: qtd produto preço total
                            qty = int(groups[0])
                            product = groups[1].strip()
                            unit_price = float(groups[2].replace(',', '.'))
                            total = float(groups[3].replace(',', '.'))
                        except:
                            # Formato alternativo: produto qtd preço total
                            try:
                                product = groups[0].strip()
                                qty = int(groups[1])
                                unit_price = float(groups[2].replace(',', '.'))
                                total = float(groups[3].replace(',', '.'))
                            except:
                                continue
                    elif len(groups) == 2:
                        # Sem preços
                        try:
                            qty = int(groups[0])
                            product = groups[1].strip()
                            unit_price = 0.0
                            total = 0.0
                        except:
                            continue
                    else:
                        continue

                    # Validar
                    if qty > 0 and len(product) >= 3:
                        items.append(InvoiceItem(
                            product_name=product,
                            quantity=qty,
                            unit_price=unit_price,
                            total_price=total
                        ))
                        break  # Não tentar outros padrões para esta linha

        return items
