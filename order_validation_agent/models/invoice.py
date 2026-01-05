"""
Modelos de dados para Faturas (Sage)
"""
from dataclasses import dataclass, field
from typing import List
from datetime import datetime
from decimal import Decimal


@dataclass
class InvoiceItem:
    """Item individual de uma fatura"""
    product_name: str
    product_code: str
    quantity: float
    unit_price: Decimal
    unit: str = "kg"
    discount: Decimal = Decimal("0.0")

    @property
    def subtotal(self) -> Decimal:
        """Calcula subtotal do item"""
        return Decimal(str(self.quantity)) * self.unit_price

    @property
    def total(self) -> Decimal:
        """Calcula total com desconto"""
        return self.subtotal - self.discount

    def __str__(self):
        return (f"{self.product_name} ({self.product_code}): "
                f"{self.quantity} {self.unit} x €{self.unit_price} = €{self.total}")


@dataclass
class Invoice:
    """Fatura gerada no Sage"""
    invoice_number: str
    order_id: str
    client_name: str
    client_code: str
    items: List[InvoiceItem] = field(default_factory=list)
    date: datetime = field(default_factory=datetime.now)
    notes: str = ""

    def add_item(self, item: InvoiceItem):
        """Adiciona item à fatura"""
        self.items.append(item)

    def get_total_items(self) -> int:
        """Retorna número total de itens"""
        return len(self.items)

    def get_item_by_code(self, product_code: str) -> InvoiceItem:
        """Busca item pelo código do produto"""
        for item in self.items:
            if item.product_code == product_code:
                return item
        return None

    @property
    def subtotal(self) -> Decimal:
        """Calcula subtotal da fatura"""
        return sum((item.subtotal for item in self.items), Decimal("0.0"))

    @property
    def total_discount(self) -> Decimal:
        """Calcula desconto total"""
        return sum((item.discount for item in self.items), Decimal("0.0"))

    @property
    def total(self) -> Decimal:
        """Calcula total da fatura"""
        return sum((item.total for item in self.items), Decimal("0.0"))

    def __str__(self):
        items_str = "\n  ".join([str(item) for item in self.items])
        return (f"Fatura {self.invoice_number} - {self.client_name}\n"
                f"  {items_str}\n"
                f"  Total: €{self.total}")
