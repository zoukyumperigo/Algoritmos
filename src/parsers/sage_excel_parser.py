"""
Parser para faturas do SAGE em formato Excel
"""
import os
from typing import Optional
from datetime import datetime
from ..models.invoice import Invoice, InvoiceItem


class SageExcelParser:
    """
    Parser para ficheiros Excel do SAGE.

    Formatos suportados:
    - .xlsx (Excel 2007+)
    - .xls (Excel 97-2003)

    Estrutura esperada (flexível):
    Coluna A: Produto
    Coluna B: Quantidade
    Coluna C: Preço Unitário (opcional)
    Coluna D: Total (opcional)
    """

    def parse_file(self, file_path: str, sheet_name: str = None) -> Optional[Invoice]:
        """
        Faz parse de ficheiro Excel.

        Args:
            file_path: Caminho do ficheiro Excel
            sheet_name: Nome da folha (None = primeira folha)

        Returns:
            Invoice object
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Ficheiro não encontrado: {file_path}")

        try:
            import pandas as pd

            # Ler Excel
            if sheet_name:
                df = pd.read_excel(file_path, sheet_name=sheet_name)
            else:
                df = pd.read_excel(file_path, sheet_name=0)

            # Tentar identificar colunas automaticamente
            column_mapping = self._detect_columns(df)

            # Extrair informações do cabeçalho (primeiras linhas)
            distributor, customer, invoice_number = self._extract_header_info(df)

            # Extrair itens
            items = []
            for idx, row in df.iterrows():
                item = self._parse_row(row, column_mapping)
                if item:
                    items.append(item)

            if not items:
                raise ValueError("Nenhum produto encontrado no Excel")

            invoice = Invoice(
                distributor=distributor or "N/A",
                customer=customer or "N/A",
                items=items,
                invoice_number=invoice_number or "",
                source_file=file_path,
                source_format="excel"
            )

            return invoice

        except Exception as e:
            raise ValueError(f"Erro ao processar Excel: {e}")

    def _detect_columns(self, df) -> dict:
        """
        Deteta automaticamente quais colunas contêm cada tipo de informação.

        Returns:
            Dict com mapeamento de colunas
        """
        import pandas as pd

        mapping = {
            'product': None,
            'quantity': None,
            'unit_price': None,
            'total': None
        }

        # Procurar por nomes comuns de colunas
        for col in df.columns:
            col_lower = str(col).lower()

            # Produto
            if any(word in col_lower for word in ['produto', 'product', 'artigo', 'descri', 'item']):
                mapping['product'] = col

            # Quantidade
            elif any(word in col_lower for word in ['qtd', 'quantidade', 'quantity', 'qty', 'quant']):
                mapping['quantity'] = col

            # Preço unitário
            elif any(word in col_lower for word in ['preço', 'preco', 'price', 'unit', 'pvp']):
                mapping['unit_price'] = col

            # Total
            elif any(word in col_lower for word in ['total', 'valor', 'amount']):
                mapping['total'] = col

        # Se não encontrou, usar posições padrão
        if mapping['product'] is None and len(df.columns) > 0:
            mapping['product'] = df.columns[0]

        if mapping['quantity'] is None and len(df.columns) > 1:
            mapping['quantity'] = df.columns[1]

        if mapping['unit_price'] is None and len(df.columns) > 2:
            mapping['unit_price'] = df.columns[2]

        if mapping['total'] is None and len(df.columns) > 3:
            mapping['total'] = df.columns[3]

        return mapping

    def _extract_header_info(self, df) -> tuple:
        """
        Extrai informações do cabeçalho (distribuidor, cliente, nº fatura).

        Returns:
            (distributor, customer, invoice_number)
        """
        import pandas as pd
        import re

        distributor = None
        customer = None
        invoice_number = None

        # Procurar nas primeiras 10 linhas
        for idx in range(min(10, len(df))):
            row_text = ' '.join(str(val) for val in df.iloc[idx].values if pd.notna(val))

            # Procurar distribuidor (geralmente tem "LDA", "SA", etc)
            if not distributor and re.search(r'\b(LDA|SA|LIMITADA|UNIPESSOAL)\b', row_text, re.IGNORECASE):
                distributor = row_text.strip()

            # Procurar cliente
            if not customer and re.search(r'\b(Cliente|Customer|Restaurante|Restaurant)\b', row_text, re.IGNORECASE):
                match = re.search(r'(?:Cliente|Customer|Restaurante|Restaurant)\s*:?\s*(.+)', row_text, re.IGNORECASE)
                if match:
                    customer = match.group(1).strip()

            # Procurar número de fatura
            if not invoice_number and re.search(r'\b(Fatura|Factura|Invoice|Fat\.?)\s*N[º°]?\s*:?\s*(\S+)', row_text, re.IGNORECASE):
                match = re.search(r'(?:Fatura|Factura|Invoice|Fat\.?)\s*N[º°]?\s*:?\s*(\S+)', row_text, re.IGNORECASE)
                if match:
                    invoice_number = match.group(1).strip()

        return (distributor, customer, invoice_number)

    def _parse_row(self, row, column_mapping: dict) -> Optional[InvoiceItem]:
        """
        Faz parse de uma linha do Excel.

        Returns:
            InvoiceItem ou None
        """
        import pandas as pd

        # Extrair valores
        product_col = column_mapping.get('product')
        quantity_col = column_mapping.get('quantity')
        price_col = column_mapping.get('unit_price')
        total_col = column_mapping.get('total')

        if product_col is None or quantity_col is None:
            return None

        product_name = row.get(product_col)
        quantity_val = row.get(quantity_col)

        # Validar
        if pd.isna(product_name) or pd.isna(quantity_val):
            return None

        product_name = str(product_name).strip()
        if len(product_name) < 2:
            return None

        # Converter quantidade
        try:
            quantity = int(float(quantity_val))
        except:
            return None

        if quantity <= 0:
            return None

        # Preços (opcionais)
        unit_price = 0.0
        total_price = 0.0

        if price_col and not pd.isna(row.get(price_col)):
            try:
                unit_price = float(row.get(price_col))
            except:
                pass

        if total_col and not pd.isna(row.get(total_col)):
            try:
                total_price = float(row.get(total_col))
            except:
                pass

        return InvoiceItem(
            product_name=product_name,
            quantity=quantity,
            unit_price=unit_price,
            total_price=total_price
        )
