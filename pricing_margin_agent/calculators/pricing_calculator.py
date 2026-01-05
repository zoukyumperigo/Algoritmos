"""
Calculador de Preços e Margens
"""
from decimal import Decimal
from typing import Tuple
from ..models.product import Product
from ..models.client import Client


class PricingCalculator:
    """
    Calculador de preços, margens e métricas financeiras
    """

    @staticmethod
    def calculate_margin(cost: Decimal, price: Decimal) -> Tuple[Decimal, Decimal]:
        """
        Calcula margem absoluta e percentual

        Args:
            cost: Custo unitário
            price: Preço de venda unitário

        Returns:
            Tuple (margem_absoluta, margem_percentual)
        """
        margin_absolute = price - cost

        if price > 0:
            margin_percentage = margin_absolute / price
        else:
            margin_percentage = Decimal("0.0")

        return margin_absolute, margin_percentage

    @staticmethod
    def calculate_markup(cost: Decimal, price: Decimal) -> Decimal:
        """
        Calcula markup (percentual sobre o custo)

        Args:
            cost: Custo unitário
            price: Preço de venda unitário

        Returns:
            Markup percentual
        """
        if cost > 0:
            return (price - cost) / cost
        return Decimal("0.0")

    @staticmethod
    def price_from_margin(cost: Decimal, target_margin: Decimal) -> Decimal:
        """
        Calcula preço necessário para atingir margem desejada

        Args:
            cost: Custo unitário
            target_margin: Margem percentual desejada (0.25 = 25%)

        Returns:
            Preço de venda
        """
        if target_margin >= Decimal("1.0"):
            # Margem impossível (>= 100%)
            return cost * Decimal("10.0")  # Retorna algo alto mas razoável

        return cost / (Decimal("1.0") - target_margin)

    @staticmethod
    def price_from_markup(cost: Decimal, markup: Decimal) -> Decimal:
        """
        Calcula preço a partir do markup desejado

        Args:
            cost: Custo unitário
            markup: Markup percentual desejado (0.50 = 50% sobre custo)

        Returns:
            Preço de venda
        """
        return cost * (Decimal("1.0") + markup)

    @staticmethod
    def calculate_breakeven(fixed_costs: Decimal, variable_cost_per_unit: Decimal,
                           price_per_unit: Decimal) -> Decimal:
        """
        Calcula ponto de equilíbrio (break-even)

        Args:
            fixed_costs: Custos fixos totais
            variable_cost_per_unit: Custo variável por unidade
            price_per_unit: Preço de venda por unidade

        Returns:
            Quantidade necessária para break-even
        """
        contribution_margin = price_per_unit - variable_cost_per_unit

        if contribution_margin > 0:
            return fixed_costs / contribution_margin
        return Decimal("999999.0")  # Impossível atingir break-even

    @staticmethod
    def apply_volume_discount(base_price: Decimal, quantity: float,
                             tiers: list = None) -> Tuple[Decimal, Decimal]:
        """
        Aplica desconto por volume

        Args:
            base_price: Preço base
            quantity: Quantidade
            tiers: Lista de tuplas (quantidade_minima, desconto_percentual)

        Returns:
            Tuple (preço_final, desconto_aplicado)
        """
        if tiers is None:
            # Tiers padrão
            tiers = [
                (100, Decimal("0.05")),  # 100+ unidades: 5% desconto
                (250, Decimal("0.10")),  # 250+ unidades: 10% desconto
                (500, Decimal("0.15")),  # 500+ unidades: 15% desconto
                (1000, Decimal("0.20"))  # 1000+ unidades: 20% desconto
            ]

        # Ordena tiers por quantidade decrescente
        sorted_tiers = sorted(tiers, key=lambda x: x[0], reverse=True)

        # Encontra tier aplicável
        discount = Decimal("0.0")
        for min_qty, disc in sorted_tiers:
            if quantity >= min_qty:
                discount = disc
                break

        final_price = base_price * (Decimal("1.0") - discount)
        return final_price, discount

    @staticmethod
    def calculate_client_adjusted_price(product: Product, client: Client,
                                       base_price: Decimal) -> Tuple[Decimal, str]:
        """
        Ajusta preço baseado no perfil do cliente

        Args:
            product: Produto
            client: Cliente
            base_price: Preço base

        Returns:
            Tuple (preço_ajustado, justificativa)
        """
        # Desconto máximo elegível para o cliente
        max_discount = client.get_discount_eligibility()

        # Fator de frequência (clientes frequentes podem ter pequeno desconto adicional)
        frequency_factor = client.purchase_frequency.get_loyalty_factor()

        # Calcula desconto total
        total_discount = max_discount

        # Aplica fator de frequência (reduz preço ligeiramente)
        adjusted_price = base_price * frequency_factor

        # Aplica desconto se elegível
        if total_discount > 0:
            adjusted_price = adjusted_price * (Decimal("1.0") - total_discount)

        # Justificativa
        justifications = []
        if client.client_type.value != "regular":
            justifications.append(f"Cliente {client.client_type.value}")
        if client.purchase_frequency.value in ["weekly", "daily"]:
            justifications.append(f"Compra {client.purchase_frequency.value}")
        if total_discount > 0:
            justifications.append(f"Desconto {total_discount * 100:.1f}%")

        justification = ", ".join(justifications) if justifications else "Preço padrão"

        return adjusted_price, justification

    @staticmethod
    def calculate_roi(investment: Decimal, returns: Decimal) -> Decimal:
        """
        Calcula ROI (Return on Investment)

        Args:
            investment: Investimento inicial
            returns: Retorno obtido

        Returns:
            ROI percentual
        """
        if investment > 0:
            return (returns - investment) / investment
        return Decimal("0.0")
