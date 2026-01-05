"""
Exemplos básicos de uso do Pricing & Margin Agent
Demonstra análise de margens e recomendações de preço
"""
from decimal import Decimal
from pricing_margin_agent import (
    Product, ProductCost, Client, ClientType, PurchaseFrequency,
    PricingProposal, MarginAnalyzer
)


def example_excellent_margin():
    """Exemplo 1: Margem excelente"""
    print("=" * 70)
    print("EXEMPLO 1: Margem Excelente")
    print("=" * 70)
    print()

    # Produto
    product = Product(
        product_code="SAL-001",
        name="Salmão Fresco Noruega",
        category="seafood",
        cost=ProductCost(
            purchase_cost=Decimal("10.00"),
            storage_cost=Decimal("0.50"),
            handling_cost=Decimal("0.30"),
            transport_cost=Decimal("0.20")
        ),
        unit="kg",
        minimum_margin=Decimal("0.15"),
        target_margin=Decimal("0.25"),
        premium_margin=Decimal("0.35")
    )

    # Cliente regular
    client = Client(
        client_id="CLI-001",
        name="Restaurante Sakura",
        client_type=ClientType.REGULAR,
        purchase_frequency=PurchaseFrequency.WEEKLY,
        average_order_value=Decimal("2000.0")
    )

    # Proposta com preço premium
    proposal = PricingProposal(
        product=product,
        client=client,
        proposed_price=Decimal("18.00"),  # Margem ~40%
        quantity=50.0
    )

    # Analisar
    analyzer = MarginAnalyzer()
    result = analyzer.analyze(proposal)

    print(result)
    print()


def example_dangerous_margin():
    """Exemplo 2: Margem perigosa"""
    print("=" * 70)
    print("EXEMPLO 2: Margem Perigosa")
    print("=" * 70)
    print()

    # Produto
    product = Product(
        product_code="ATM-002",
        name="Atum Congelado Premium",
        category="seafood",
        cost=ProductCost(
            purchase_cost=Decimal("14.00"),
            storage_cost=Decimal("0.60"),
            handling_cost=Decimal("0.40")
        ),
        unit="kg",
        minimum_margin=Decimal("0.15"),
        target_margin=Decimal("0.25"),
        premium_margin=Decimal("0.35")
    )

    # Cliente ocasional
    client = Client(
        client_id="CLI-002",
        name="Sushi Express",
        client_type=ClientType.REGULAR,
        purchase_frequency=PurchaseFrequency.OCCASIONAL,
        average_order_value=Decimal("500.0")
    )

    # Proposta com preço muito baixo
    proposal = PricingProposal(
        product=product,
        client=client,
        proposed_price=Decimal("16.00"),  # Margem ~6% (abaixo do mínimo)
        quantity=30.0
    )

    # Analisar
    analyzer = MarginAnalyzer()
    result = analyzer.analyze(proposal)

    print(result)
    print()


def example_critical_margin():
    """Exemplo 3: Margem crítica (negativa)"""
    print("=" * 70)
    print("EXEMPLO 3: Margem Crítica (Prejuízo)")
    print("=" * 70)
    print()

    # Produto
    product = Product(
        product_code="CAM-005",
        name="Camarão Tigre",
        category="seafood",
        cost=ProductCost(
            purchase_cost=Decimal("22.00"),
            storage_cost=Decimal("1.00"),
            handling_cost=Decimal("0.50")
        ),
        unit="kg",
        minimum_margin=Decimal("0.15"),
        target_margin=Decimal("0.25")
    )

    # Cliente
    client = Client(
        client_id="CLI-003",
        name="Ocean Bistro",
        client_type=ClientType.REGULAR,
        purchase_frequency=PurchaseFrequency.MONTHLY
    )

    # Proposta com preço abaixo do custo
    proposal = PricingProposal(
        product=product,
        client=client,
        proposed_price=Decimal("20.00"),  # Abaixo do custo!
        quantity=25.0
    )

    # Analisar
    analyzer = MarginAnalyzer()
    result = analyzer.analyze(proposal)

    print(result)
    print()


def example_premium_client_good_margin():
    """Exemplo 4: Cliente premium com boa margem"""
    print("=" * 70)
    print("EXEMPLO 4: Cliente Premium - Boa Margem")
    print("=" * 70)
    print()

    # Produto
    product = Product(
        product_code="ARZ-003",
        name="Arroz Sushi Premium",
        category="rice",
        cost=ProductCost(
            purchase_cost=Decimal("6.00"),
            storage_cost=Decimal("0.20"),
            handling_cost=Decimal("0.15")
        ),
        unit="kg",
        minimum_margin=Decimal("0.15"),
        target_margin=Decimal("0.25"),
        premium_margin=Decimal("0.35")
    )

    # Cliente premium
    client = Client(
        client_id="CLI-004",
        name="Tokyo Fusion Premium",
        client_type=ClientType.PREMIUM,
        purchase_frequency=PurchaseFrequency.DAILY,
        average_order_value=Decimal("8000.0")
    )

    # Proposta com margem boa
    proposal = PricingProposal(
        product=product,
        client=client,
        proposed_price=Decimal("9.00"),  # Margem ~30%
        quantity=100.0
    )

    # Analisar
    analyzer = MarginAnalyzer()
    result = analyzer.analyze(proposal)

    print(result)
    print()


def example_with_discount():
    """Exemplo 5: Proposta com desconto"""
    print("=" * 70)
    print("EXEMPLO 5: Proposta com Desconto")
    print("=" * 70)
    print()

    # Produto
    product = Product(
        product_code="CAR-010",
        name="Carne Wagyu Congelada",
        category="meat",
        cost=ProductCost(
            purchase_cost=Decimal("45.00"),
            storage_cost=Decimal("2.00"),
            handling_cost=Decimal("1.00")
        ),
        unit="kg",
        minimum_margin=Decimal("0.20"),
        target_margin=Decimal("0.30"),
        premium_margin=Decimal("0.40")
    )

    # Cliente VIP
    client = Client(
        client_id="CLI-005",
        name="Premium Steakhouse",
        client_type=ClientType.VIP,
        purchase_frequency=PurchaseFrequency.WEEKLY,
        average_order_value=Decimal("15000.0")
    )

    # Proposta com desconto de 10%
    proposal = PricingProposal(
        product=product,
        client=client,
        proposed_price=Decimal("70.00"),
        quantity=50.0,
        discount_percentage=Decimal("0.10"),  # 10% desconto
        notes="Cliente VIP - desconto especial"
    )

    # Analisar
    analyzer = MarginAnalyzer()
    result = analyzer.analyze(proposal)

    print(result)
    print()


def example_acceptable_margin_with_recommendations():
    """Exemplo 6: Margem aceitável com recomendações"""
    print("=" * 70)
    print("EXEMPLO 6: Margem Aceitável - Pode Melhorar")
    print("=" * 70)
    print()

    # Produto
    product = Product(
        product_code="SAL-001",
        name="Salmão Fresco Noruega",
        category="seafood",
        cost=ProductCost(
            purchase_cost=Decimal("10.00"),
            storage_cost=Decimal("0.50"),
            handling_cost=Decimal("0.30")
        ),
        unit="kg",
        minimum_margin=Decimal("0.15"),
        target_margin=Decimal("0.25"),
        premium_margin=Decimal("0.35")
    )

    # Cliente regular
    client = Client(
        client_id="CLI-006",
        name="Nikkei Kitchen",
        client_type=ClientType.REGULAR,
        purchase_frequency=PurchaseFrequency.MONTHLY,
        average_order_value=Decimal("1500.0")
    )

    # Proposta com margem aceitável mas não ideal
    proposal = PricingProposal(
        product=product,
        client=client,
        proposed_price=Decimal("13.50"),  # Margem ~20% (entre mínimo e alvo)
        quantity=75.0
    )

    # Analisar
    analyzer = MarginAnalyzer()
    result = analyzer.analyze(proposal)

    print(result)
    print()


if __name__ == "__main__":
    # Executar todos os exemplos
    example_excellent_margin()
    example_dangerous_margin()
    example_critical_margin()
    example_premium_client_good_margin()
    example_with_discount()
    example_acceptable_margin_with_recommendations()
