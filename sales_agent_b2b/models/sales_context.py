"""
Modelos de dados para contexto de vendas
"""
from dataclasses import dataclass, field
from enum import Enum
from decimal import Decimal
from typing import List, Optional, Dict
from datetime import datetime


class SalesScenario(Enum):
    """Cenários de venda"""
    NEW_CLIENT = "new_client"              # Cliente novo
    REGULAR_CLIENT = "regular_client"      # Cliente regular
    INACTIVE_CLIENT = "inactive_client"    # Cliente inativo
    PRICE_INQUIRY = "price_inquiry"        # Consulta de preço
    COMPLAINT = "complaint"                # Reclamação
    REORDER = "reorder"                    # Repetir pedido
    NEGOTIATION = "negotiation"            # Negociação

    def __str__(self):
        return self.value


@dataclass
class ProductOffer:
    """Oferta de produto"""
    product_code: str
    product_name: str
    product_name_cn: str  # Nome em chinês
    quantity: float
    unit: str
    unit_price: Decimal
    total_price: Decimal
    discount_percentage: Decimal = Decimal("0.0")
    special_notes: str = ""

    @property
    def final_price(self) -> Decimal:
        """Calcula preço final com desconto"""
        if self.discount_percentage > 0:
            return self.total_price * (Decimal("1.0") - self.discount_percentage)
        return self.total_price


@dataclass
class SalesContext:
    """Contexto completo de uma interação de vendas"""

    # Cliente
    client_name: str
    client_name_cn: Optional[str] = None  # Nome em chinês
    client_type: str = "regular"  # new, regular, premium, vip

    # Cenário
    scenario: SalesScenario = SalesScenario.PRICE_INQUIRY

    # Produtos
    products: List[ProductOffer] = field(default_factory=list)

    # Preços e margens
    total_value: Decimal = Decimal("0.0")
    margin_safe: bool = True
    margin_percentage: Optional[Decimal] = None

    # Desconto
    discount_requested: Optional[Decimal] = None
    discount_approved: Optional[Decimal] = None
    discount_reason: str = ""

    # Upsell
    upsell_products: List[ProductOffer] = field(default_factory=list)
    bundle_opportunity: bool = False

    # Follow-up
    last_contact: Optional[datetime] = None
    days_since_contact: int = 0
    follow_up_reason: str = ""

    # Notas
    special_notes: str = ""
    urgency: str = "normal"  # low, normal, high

    # Preferências
    preferred_language: str = "pt"  # pt, cn, both

    def add_product(self, product: ProductOffer):
        """Adiciona produto à oferta"""
        self.products.append(product)
        self._recalculate_total()

    def add_upsell(self, product: ProductOffer):
        """Adiciona produto de upsell"""
        self.upsell_products.append(product)

    def _recalculate_total(self):
        """Recalcula valor total"""
        self.total_value = sum(p.final_price for p in self.products)

    def get_product_summary(self) -> str:
        """Retorna resumo dos produtos"""
        if not self.products:
            return "Nenhum produto"

        items = [f"{p.product_name} ({p.quantity}{p.unit})"
                for p in self.products]
        return ", ".join(items)

    def can_offer_discount(self) -> bool:
        """Verifica se pode oferecer desconto mantendo margem"""
        return self.margin_safe and self.margin_percentage and self.margin_percentage > Decimal("0.20")
