"""
Modelo de dados para Pedido (WhatsApp)
"""
from dataclasses import dataclass, field
from typing import List
from datetime import datetime


@dataclass
class OrderItem:
    """Item individual do pedido"""
    product_name: str
    quantity: int
    normalized_name: str = ""  # Nome normalizado para comparação

    def __post_init__(self):
        if not self.normalized_name:
            from ..services.normalization_service import NormalizationService
            self.normalized_name = NormalizationService.normalize(self.product_name)


@dataclass
class Order:
    """Pedido completo do WhatsApp"""
    distributor: str
    customer: str  # Nome do restaurante
    items: List[OrderItem] = field(default_factory=list)
    raw_text: str = ""  # Texto original do WhatsApp
    created_at: datetime = field(default_factory=datetime.now)

    # Campos normalizados
    normalized_distributor: str = ""
    normalized_customer: str = ""

    def __post_init__(self):
        from ..services.normalization_service import NormalizationService
        if not self.normalized_distributor:
            self.normalized_distributor = NormalizationService.normalize(self.distributor)
        if not self.normalized_customer:
            self.normalized_customer = NormalizationService.normalize(self.customer)

    @property
    def total_items(self) -> int:
        """Total de itens no pedido"""
        return sum(item.quantity for item in self.items)

    @property
    def unique_products(self) -> int:
        """Número de produtos únicos"""
        return len(self.items)

    def get_item_by_name(self, product_name: str) -> OrderItem:
        """Buscar item por nome (exato ou normalizado)"""
        from ..services.normalization_service import NormalizationService
        normalized = NormalizationService.normalize(product_name)

        for item in self.items:
            if item.normalized_name == normalized:
                return item
        return None

    def __str__(self):
        lines = [
            f"Distribuidor: {self.distributor}",
            f"Cliente: {self.customer}",
            f"Produtos ({len(self.items)}):"
        ]
        for item in self.items:
            lines.append(f"  {item.quantity} {item.product_name}")
        return "\n".join(lines)
