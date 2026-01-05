"""
Modelos de dados para Produtos e Custos
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional


@dataclass
class ProductCost:
    """Estrutura de custos de um produto"""
    purchase_cost: Decimal          # Custo de aquisição
    storage_cost: Decimal = Decimal("0.0")      # Custo de armazenamento
    handling_cost: Decimal = Decimal("0.0")     # Custo de manuseio
    transport_cost: Decimal = Decimal("0.0")    # Custo de transporte
    other_costs: Decimal = Decimal("0.0")       # Outros custos

    @property
    def total_cost(self) -> Decimal:
        """Calcula custo total"""
        return (self.purchase_cost + self.storage_cost +
                self.handling_cost + self.transport_cost + self.other_costs)

    def cost_per_unit(self, quantity: float = 1.0) -> Decimal:
        """
        Calcula custo por unidade
        Os custos já são unitários, então retorna o custo total
        """
        return self.total_cost


@dataclass
class Product:
    """Produto B2B"""
    product_code: str
    name: str
    category: str                   # seafood, meat, rice
    cost: ProductCost
    unit: str = "kg"
    minimum_margin: Decimal = Decimal("0.15")   # 15% margem mínima
    target_margin: Decimal = Decimal("0.25")    # 25% margem alvo
    premium_margin: Decimal = Decimal("0.35")   # 35% margem premium
    minimum_quantity: float = 1.0
    market_price_reference: Optional[Decimal] = None

    def get_minimum_price(self, quantity: float = 1.0) -> Decimal:
        """Calcula preço mínimo baseado na margem mínima"""
        cost = self.cost.cost_per_unit(quantity)
        return cost / (Decimal("1.0") - self.minimum_margin)

    def get_target_price(self, quantity: float = 1.0) -> Decimal:
        """Calcula preço alvo baseado na margem alvo"""
        cost = self.cost.cost_per_unit(quantity)
        return cost / (Decimal("1.0") - self.target_margin)

    def get_premium_price(self, quantity: float = 1.0) -> Decimal:
        """Calcula preço premium baseado na margem premium"""
        cost = self.cost.cost_per_unit(quantity)
        return cost / (Decimal("1.0") - self.premium_margin)

    def __str__(self):
        return (f"Produto: {self.name} ({self.product_code})\n"
                f"  Categoria: {self.category}\n"
                f"  Custo total: €{self.cost.total_cost}\n"
                f"  Margem mínima: {self.minimum_margin * 100:.1f}%\n"
                f"  Margem alvo: {self.target_margin * 100:.1f}%")
