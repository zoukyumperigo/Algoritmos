"""
Modelos de dados para Encomendas (WhatsApp)
"""
from dataclasses import dataclass, field
from typing import List
from datetime import datetime


@dataclass
class OrderItem:
    """Item individual de uma encomenda"""
    product_name: str
    product_code: str
    quantity: float
    unit: str = "kg"  # kg, unidades, caixas, etc.

    def __str__(self):
        return f"{self.product_name} ({self.product_code}): {self.quantity} {self.unit}"


@dataclass
class Order:
    """Encomenda recebida via WhatsApp"""
    order_id: str
    client_name: str
    client_code: str
    items: List[OrderItem] = field(default_factory=list)
    date: datetime = field(default_factory=datetime.now)
    notes: str = ""

    def add_item(self, item: OrderItem):
        """Adiciona item à encomenda"""
        self.items.append(item)

    def get_total_items(self) -> int:
        """Retorna número total de itens"""
        return len(self.items)

    def get_item_by_code(self, product_code: str) -> OrderItem:
        """Busca item pelo código do produto"""
        for item in self.items:
            if item.product_code == product_code:
                return item
        return None

    def __str__(self):
        items_str = "\n  ".join([str(item) for item in self.items])
        return f"Encomenda {self.order_id} - {self.client_name}\n  {items_str}"
