"""
Exemplo avançado do Pricing & Margin Agent
Demonstra uso do PricingCalculator e cenários complexos
"""
from decimal import Decimal
from pricing_margin_agent import (
    Product, ProductCost, Client, ClientType, PurchaseFrequency,
    PricingProposal, MarginAnalyzer, PricingCalculator
)


def example_volume_pricing():
    """Exemplo com pricing por volume"""
    print("=" * 70)
    print("EXEMPLO: Pricing por Volume")
    print("=" * 70)
    print()

    # Produto
    product = Product(
        product_code="SAL-001",
        name="Salmão Fresco Noruega",
        category="seafood",
        cost=ProductCost(purchase_cost=Decimal("10.00")),
        unit="kg"
    )

    # Cliente
    client = Client(
        client_id="CLI-100",
        name="Mega Sushi Chain",
        client_type=ClientType.PREMIUM,
        purchase_frequency=PurchaseFrequency.DAILY
    )

    calculator = PricingCalculator()
    analyzer = MarginAnalyzer()

    # Testar diferentes volumes
    base_price = Decimal("14.00")
    quantities = [50, 150, 300, 600]

    print(f"Preço base: €{base_price:.2f}/kg")
    print()

    for qty in quantities:
        # Aplicar desconto por volume
        final_price, discount = calculator.apply_volume_discount(base_price, qty)

        print(f"Quantidade: {qty} kg")
        print(f"  Desconto aplicado: {discount * 100:.1f}%")
        print(f"  Preço final: €{final_price:.2f}/kg")

        # Analisar margem
        proposal = PricingProposal(
            product=product,
            client=client,
            proposed_price=final_price,
            quantity=qty
        )
        result = analyzer.analyze(proposal)

        print(f"  Margem: {result.margin_percentage * 100:.1f}% - {result.risk_level.value}")
        print(f"  Lucro total: €{result.total_margin:.2f}")
        print()


def example_client_adjusted_pricing():
    """Exemplo com ajuste de preço por tipo de cliente"""
    print("=" * 70)
    print("EXEMPLO: Ajuste de Preço por Cliente")
    print("=" * 70)
    print()

    # Produto
    product = Product(
        product_code="ATM-002",
        name="Atum Congelado Premium",
        category="seafood",
        cost=ProductCost(purchase_cost=Decimal("15.00")),
        minimum_margin=Decimal("0.15"),
        target_margin=Decimal("0.25")
    )

    base_price = Decimal("21.00")  # Preço base
    calculator = PricingCalculator()

    # Diferentes tipos de cliente
    client_profiles = [
        ("Regular Ocasional", ClientType.REGULAR, PurchaseFrequency.OCCASIONAL),
        ("Regular Mensal", ClientType.REGULAR, PurchaseFrequency.MONTHLY),
        ("Premium Semanal", ClientType.PREMIUM, PurchaseFrequency.WEEKLY),
        ("VIP Diário", ClientType.VIP, PurchaseFrequency.DAILY)
    ]

    print(f"Preço base: €{base_price:.2f}/kg")
    print()

    for name, client_type, frequency in client_profiles:
        client = Client(
            client_id=f"CLI-{name[:3]}",
            name=name,
            client_type=client_type,
            purchase_frequency=frequency
        )

        # Calcular preço ajustado
        adjusted_price, justification = calculator.calculate_client_adjusted_price(
            product, client, base_price
        )

        print(f"{name}:")
        print(f"  Preço ajustado: €{adjusted_price:.2f}/kg")
        print(f"  Ajuste: {justification}")
        print(f"  Economia: €{base_price - adjusted_price:.2f}/kg "
              f"({((base_price - adjusted_price) / base_price * 100):.1f}%)")
        print()


def example_margin_calculations():
    """Exemplo com diferentes cálculos de margem"""
    print("=" * 70)
    print("EXEMPLO: Cálculos de Margem e Markup")
    print("=" * 70)
    print()

    calculator = PricingCalculator()
    cost = Decimal("12.00")

    print(f"Custo: €{cost:.2f}")
    print()

    # Diferentes preços
    prices = [
        Decimal("14.00"),
        Decimal("16.00"),
        Decimal("18.00"),
        Decimal("20.00")
    ]

    print("Preço    | Margem € | Margem % | Markup %")
    print("-" * 50)

    for price in prices:
        margin_abs, margin_pct = calculator.calculate_margin(cost, price)
        markup = calculator.calculate_markup(cost, price)

        print(f"€{price:.2f}   | €{margin_abs:.2f}    | {margin_pct * 100:.1f}%     | {markup * 100:.1f}%")

    print()


def example_price_from_target_margin():
    """Exemplo calculando preço a partir de margem desejada"""
    print("=" * 70)
    print("EXEMPLO: Calcular Preço para Margem Alvo")
    print("=" * 70)
    print()

    calculator = PricingCalculator()
    cost = Decimal("10.00")

    print(f"Custo: €{cost:.2f}")
    print()

    # Diferentes margens alvo
    target_margins = [
        Decimal("0.10"),   # 10%
        Decimal("0.20"),   # 20%
        Decimal("0.30"),   # 30%
        Decimal("0.40")    # 40%
    ]

    print("Margem Alvo | Preço Necessário")
    print("-" * 35)

    for target in target_margins:
        price = calculator.price_from_margin(cost, target)
        print(f"{target * 100:.0f}%         | €{price:.2f}")

    print()


def example_complete_scenario():
    """Cenário completo: Negociação com cliente"""
    print("=" * 70)
    print("CENÁRIO COMPLETO: Negociação com Cliente Premium")
    print("=" * 70)
    print()

    # Produto
    product = Product(
        product_code="SAL-PREMIUM",
        name="Salmão Orgânico Premium",
        category="seafood",
        cost=ProductCost(
            purchase_cost=Decimal("18.00"),
            storage_cost=Decimal("1.00"),
            handling_cost=Decimal("0.50"),
            transport_cost=Decimal("0.50")
        ),
        unit="kg",
        minimum_margin=Decimal("0.20"),
        target_margin=Decimal("0.30"),
        premium_margin=Decimal("0.40")
    )

    # Cliente premium com boa frequência
    client = Client(
        client_id="CLI-PREMIUM-001",
        name="Michelin Star Restaurant",
        client_type=ClientType.VIP,
        purchase_frequency=PurchaseFrequency.WEEKLY,
        average_order_value=Decimal("12000.0")
    )

    analyzer = MarginAnalyzer()
    calculator = PricingCalculator()

    # Cenário 1: Primeira oferta (preço premium)
    print("CENÁRIO 1: Oferta Inicial")
    print("-" * 70)

    premium_price = product.get_premium_price()
    proposal1 = PricingProposal(
        product=product,
        client=client,
        proposed_price=premium_price,
        quantity=100.0
    )

    result1 = analyzer.analyze(proposal1)
    print(result1.get_summary())
    print(result1.recommendation)
    print()

    # Cenário 2: Cliente pede desconto
    print("CENÁRIO 2: Cliente Solicitou 15% de Desconto")
    print("-" * 70)

    proposal2 = PricingProposal(
        product=product,
        client=client,
        proposed_price=premium_price,
        quantity=100.0,
        discount_percentage=Decimal("0.15")
    )

    result2 = analyzer.analyze(proposal2)
    print(result2.get_summary())
    print(result2.recommendation)
    print()

    # Cenário 3: Contra-proposta com volume
    print("CENÁRIO 3: Contra-proposta - Aumento de Volume")
    print("-" * 70)

    proposal3 = PricingProposal(
        product=product,
        client=client,
        proposed_price=premium_price,
        quantity=200.0,  # Dobro da quantidade
        discount_percentage=Decimal("0.10")  # Desconto menor
    )

    result3 = analyzer.analyze(proposal3)
    print(result3.get_summary())
    print(result3.recommendation)
    print(f"Lucro total: €{result3.total_margin:.2f}")
    print()

    # Comparação
    print("COMPARAÇÃO DOS CENÁRIOS:")
    print("-" * 70)
    print(f"Cenário 1: Margem {result1.margin_percentage * 100:.1f}% | "
          f"Lucro €{result1.total_margin:.2f}")
    print(f"Cenário 2: Margem {result2.margin_percentage * 100:.1f}% | "
          f"Lucro €{result2.total_margin:.2f}")
    print(f"Cenário 3: Margem {result3.margin_percentage * 100:.1f}% | "
          f"Lucro €{result3.total_margin:.2f}")
    print()
    print(f"MELHOR OPÇÃO: Cenário 3 - Maior lucro absoluto (€{result3.total_margin:.2f})")
    print("=" * 70)


if __name__ == "__main__":
    example_volume_pricing()
    print("\n")
    example_client_adjusted_pricing()
    print("\n")
    example_margin_calculations()
    print("\n")
    example_price_from_target_margin()
    print("\n")
    example_complete_scenario()
