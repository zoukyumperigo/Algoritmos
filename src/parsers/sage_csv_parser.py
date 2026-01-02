"""
Parser para faturas do SAGE em formato CSV
"""
import os
import csv
from typing import Optional
from ..models.invoice import Invoice, InvoiceItem


class SageCsvParser:
    """
    Parser para ficheiros CSV do SAGE.

    Formato esperado (flexível, com deteção automática):
    Produto,Quantidade,Preço,Total
    """

    def parse_file(self, file_path: str, delimiter: str = ',', encoding: str = 'utf-8') -> Optional[Invoice]:
        """
        Faz parse de ficheiro CSV.

        Args:
            file_path: Caminho do ficheiro
            delimiter: Delimitador (padrão: vírgula)
            encoding: Codificação do ficheiro

        Returns:
            Invoice object
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Ficheiro não encontrado: {file_path}")

        try:
            # Tentar detectar delimitador automaticamente
            with open(file_path, 'r', encoding=encoding) as f:
                sample = f.read(1024)
                sniffer = csv.Sniffer()
                try:
                    detected_delimiter = sniffer.sniff(sample).delimiter
                    delimiter = detected_delimiter
                except:
                    pass  # Usar delimitador fornecido

            # Ler CSV
            with open(file_path, 'r', encoding=encoding) as f:
                reader = csv.DictReader(f, delimiter=delimiter)

                # Detectar colunas
                fieldnames = reader.fieldnames
                column_mapping = self._detect_columns(fieldnames)

                # Extrair itens
                items = []
                distributor = None
                customer = None
                invoice_number = None

                for row in reader:
                    # Tentar extrair informações do cabeçalho
                    if not distributor:
                        dist = self._try_extract_distributor(row)
                        if dist:
                            distributor = dist
                            continue

                    if not customer:
                        cust = self._try_extract_customer(row)
                        if cust:
                            customer = cust
                            continue

                    # Parse de item
                    item = self._parse_row(row, column_mapping)
                    if item:
                        items.append(item)

                if not items:
                    raise ValueError("Nenhum produto encontrado no CSV")

                invoice = Invoice(
                    distributor=distributor or "N/A",
                    customer=customer or "N/A",
                    items=items,
                    invoice_number=invoice_number or "",
                    source_file=file_path,
                    source_format="csv"
                )

                return invoice

        except Exception as e:
            raise ValueError(f"Erro ao processar CSV: {e}")

    def _detect_columns(self, fieldnames) -> dict:
        """Deteta colunas automaticamente"""
        mapping = {
            'product': None,
            'quantity': None,
            'unit_price': None,
            'total': None
        }

        for field in fieldnames:
            field_lower = field.lower().strip()

            if any(word in field_lower for word in ['produto', 'product', 'artigo', 'descri', 'item']):
                mapping['product'] = field
            elif any(word in field_lower for word in ['qtd', 'quantidade', 'quantity', 'qty']):
                mapping['quantity'] = field
            elif any(word in field_lower for word in ['preço', 'preco', 'price', 'unit', 'pvp']):
                mapping['unit_price'] = field
            elif any(word in field_lower for word in ['total', 'valor', 'amount']):
                mapping['total'] = field

        # Fallback para primeiras colunas
        if mapping['product'] is None and len(fieldnames) > 0:
            mapping['product'] = fieldnames[0]
        if mapping['quantity'] is None and len(fieldnames) > 1:
            mapping['quantity'] = fieldnames[1]

        return mapping

    def _try_extract_distributor(self, row: dict) -> Optional[str]:
        """Tenta extrair distribuidor de uma linha"""
        import re
        row_text = ' '.join(str(v) for v in row.values() if v)
        if re.search(r'\b(LDA|SA|LIMITADA)\b', row_text, re.IGNORECASE):
            return row_text.strip()
        return None

    def _try_extract_customer(self, row: dict) -> Optional[str]:
        """Tenta extrair cliente de uma linha"""
        import re
        row_text = ' '.join(str(v) for v in row.values() if v)
        match = re.search(r'(?:Cliente|Restaurante)\s*:?\s*(.+)', row_text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return None

    def _parse_row(self, row: dict, column_mapping: dict) -> Optional[InvoiceItem]:
        """Parse de linha CSV"""
        product_col = column_mapping.get('product')
        quantity_col = column_mapping.get('quantity')

        if not product_col or not quantity_col:
            return None

        product_name = row.get(product_col, '').strip()
        quantity_val = row.get(quantity_col, '').strip()

        if not product_name or not quantity_val or len(product_name) < 2:
            return None

        try:
            quantity = int(float(quantity_val))
            if quantity <= 0:
                return None
        except:
            return None

        # Preços opcionais
        unit_price = 0.0
        total_price = 0.0

        price_col = column_mapping.get('unit_price')
        if price_col and row.get(price_col):
            try:
                unit_price = float(row.get(price_col))
            except:
                pass

        total_col = column_mapping.get('total')
        if total_col and row.get(total_col):
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
