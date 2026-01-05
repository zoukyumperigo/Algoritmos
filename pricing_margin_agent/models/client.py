"""
Modelos de dados para Clientes
"""
from dataclasses import dataclass
from enum import Enum
from decimal import Decimal


class ClientType(Enum):
    """Tipo de cliente"""
    REGULAR = "regular"
    PREMIUM = "premium"
    VIP = "vip"

    def __str__(self):
        return self.value


class PurchaseFrequency(Enum):
    """Frequência de compra do cliente"""
    OCCASIONAL = "occasional"      # Compra esporádica
    MONTHLY = "monthly"            # Mensal
    WEEKLY = "weekly"              # Semanal
    DAILY = "daily"                # Diária

    def __str__(self):
        return self.value

    def get_loyalty_factor(self) -> Decimal:
        """Retorna fator de fidelidade baseado na frequência"""
        factors = {
            self.OCCASIONAL: Decimal("1.0"),
            self.MONTHLY: Decimal("0.95"),
            self.WEEKLY: Decimal("0.90"),
            self.DAILY: Decimal("0.85")
        }
        return factors.get(self, Decimal("1.0"))


@dataclass
class Client:
    """Cliente B2B"""
    client_id: str
    name: str
    client_type: ClientType
    purchase_frequency: PurchaseFrequency
    average_order_value: Decimal = Decimal("0.0")
    payment_terms_days: int = 30
    credit_limit: Decimal = Decimal("10000.0")

    def get_discount_eligibility(self) -> Decimal:
        """
        Calcula elegibilidade para desconto baseado no tipo e frequência
        Retorna percentual máximo de desconto permitido
        """
        # Base por tipo de cliente
        base_discount = {
            ClientType.REGULAR: Decimal("0.05"),   # 5%
            ClientType.PREMIUM: Decimal("0.10"),   # 10%
            ClientType.VIP: Decimal("0.15")        # 15%
        }

        # Adicional por frequência
        frequency_bonus = {
            PurchaseFrequency.OCCASIONAL: Decimal("0.00"),
            PurchaseFrequency.MONTHLY: Decimal("0.02"),
            PurchaseFrequency.WEEKLY: Decimal("0.05"),
            PurchaseFrequency.DAILY: Decimal("0.08")
        }

        base = base_discount.get(self.client_type, Decimal("0.05"))
        bonus = frequency_bonus.get(self.purchase_frequency, Decimal("0.00"))

        return base + bonus

    def is_high_value(self) -> bool:
        """Verifica se é cliente de alto valor"""
        return (self.client_type in [ClientType.PREMIUM, ClientType.VIP] or
                self.average_order_value > Decimal("5000.0") or
                self.purchase_frequency in [PurchaseFrequency.WEEKLY, PurchaseFrequency.DAILY])

    def __str__(self):
        return (f"Cliente {self.name} ({self.client_id})\n"
                f"  Tipo: {self.client_type.value}\n"
                f"  Frequência: {self.purchase_frequency.value}\n"
                f"  Ticket médio: €{self.average_order_value}")
