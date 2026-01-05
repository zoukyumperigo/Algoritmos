#!/usr/bin/env python3
"""
Pricing & Margin Agent - Script Principal
Demonstração do sistema de análise de margens
"""

import sys
from decimal import Decimal
from pricing_margin_agent.models.product import Product, ProductCost
from pricing_margin_agent.models.client import Client, ClientType, PurchaseFrequency
from pricing_margin_agent.models.pricing import PricingProposal
from pricing_margin_agent.analyzers.margin_analyzer import MarginAnalyzer


def main():
    """
    Demonstração principal do Pricing & Margin Agent
    """
    print("=" * 70)
    print("PRICING & MARGIN AGENT")
    print("Análise de Margens B2B - Frozen Seafood, Meat & Sushi Rice")
    print("=" * 70)
    print()

    # Criar produto de exemplo
    print("📦 Produto:")
    print("-" * 70)
    product = Product(
        product_code="SAL-001",
        name="Salmão Fresco Noruega Premium",
        category="seafood",
        cost=ProductCost(
            purchase_cost=Decimal("12.00"),
            storage_cost=Decimal("0.60"),
            handling_cost=Decimal("0.40"),
            transport_cost=Decimal("0.30")
        ),
        unit="kg",
        minimum_margin=Decimal("0.15"),  # 15%
        target_margin=Decimal("0.25"),   # 25%
        premium_margin=Decimal("0.35")   # 35%
    )
    print(product)
    print()

    # Criar cliente
    print("👤 Cliente:")
    print("-" * 70)
    client = Client(
        client_id="CLI-DEMO-001",
        name="Restaurante Sakura Premium",
        client_type=ClientType.PREMIUM,
        purchase_frequency=PurchaseFrequency.WEEKLY,
        average_order_value=Decimal("5000.0")
    )
    print(client)
    print()

    # Proposta de preço
    print("💰 Proposta de Preço:")
    print("-" * 70)
    proposal = PricingProposal(
        product=product,
        client=client,
        proposed_price=Decimal("17.00"),  # Preço proposto
        quantity=80.0,
        discount_percentage=Decimal("0.05"),  # 5% desconto
        notes="Cliente premium - compra semanal regular"
    )
    print(f"Preço proposto: €{proposal.proposed_price:.2f}/{product.unit}")
    print(f"Desconto: {proposal.discount_percentage * 100:.1f}%")
    print(f"Preço final: €{proposal.final_price:.2f}/{product.unit}")
    print(f"Quantidade: {proposal.quantity} {product.unit}")
    print(f"Valor total: €{proposal.total_value:.2f}")
    print()

    # Analisar
    print("🔍 Executando análise de margem...")
    print()
    analyzer = MarginAnalyzer()
    result = analyzer.analyze(proposal)

    # Exibir resultado completo
    print(result)

    # Retornar código de erro baseado no risco
    if not result.is_safe_to_proceed():
        print()
        print("⚠️  ATENÇÃO: Margem perigosa ou crítica detectada!")
        return 1
    else:
        print()
        print("✓ Análise concluída. Margem dentro dos parâmetros aceitáveis.")
        return 0


if __name__ == "__main__":
    sys.exit(main())
