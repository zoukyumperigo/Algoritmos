"""
Parsers para converter dados de WhatsApp e Sage em objetos do sistema
"""
from decimal import Decimal
from datetime import datetime
from typing import Dict, List
from ..models.order import Order, OrderItem
from ..models.invoice import Invoice, InvoiceItem


class WhatsAppParser:
    """Parser para mensagens de encomenda do WhatsApp"""

    @staticmethod
    def parse_order(data: Dict) -> Order:
        """
        Converte dados de encomenda em objeto Order

        Args:
            data: Dicionário com dados da encomenda
                {
                    'order_id': 'ORD-001',
                    'client_name': 'Restaurante Sakura',
                    'client_code': 'CLI-123',
                    'items': [
                        {'product_name': 'Salmão', 'product_code': 'SAL-001', 'quantity': 50, 'unit': 'kg'},
                        ...
                    ]
                }

        Returns:
            Order object
        """
        order = Order(
            order_id=data['order_id'],
            client_name=data['client_name'],
            client_code=data['client_code'],
            date=data.get('date', datetime.now()),
            notes=data.get('notes', '')
        )

        for item_data in data.get('items', []):
            item = OrderItem(
                product_name=item_data['product_name'],
                product_code=item_data['product_code'],
                quantity=float(item_data['quantity']),
                unit=item_data.get('unit', 'kg')
            )
            order.add_item(item)

        return order


class SageParser:
    """Parser para dados de fatura do Sage"""

    @staticmethod
    def parse_invoice(data: Dict) -> Invoice:
        """
        Converte dados de fatura em objeto Invoice

        Args:
            data: Dicionário com dados da fatura
                {
                    'invoice_number': 'INV-001',
                    'order_id': 'ORD-001',
                    'client_name': 'Restaurante Sakura',
                    'client_code': 'CLI-123',
                    'items': [
                        {
                            'product_name': 'Salmão',
                            'product_code': 'SAL-001',
                            'quantity': 50,
                            'unit_price': 12.50,
                            'unit': 'kg',
                            'discount': 0
                        },
                        ...
                    ]
                }

        Returns:
            Invoice object
        """
        invoice = Invoice(
            invoice_number=data['invoice_number'],
            order_id=data['order_id'],
            client_name=data['client_name'],
            client_code=data['client_code'],
            date=data.get('date', datetime.now()),
            notes=data.get('notes', '')
        )

        for item_data in data.get('items', []):
            item = InvoiceItem(
                product_name=item_data['product_name'],
                product_code=item_data['product_code'],
                quantity=float(item_data['quantity']),
                unit_price=Decimal(str(item_data['unit_price'])),
                unit=item_data.get('unit', 'kg'),
                discount=Decimal(str(item_data.get('discount', 0)))
            )
            invoice.add_item(item)

        return invoice
