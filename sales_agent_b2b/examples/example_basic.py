"""
Exemplos básicos de uso do Sales Agent B2B
Demonstra geração de mensagens bilíngues
"""
from decimal import Decimal
from sales_agent_b2b import (
    SalesContext, SalesScenario, ProductOffer,
    MessageGenerator, MessageType, Language
)


def example_greeting_new_client():
    """Exemplo 1: Saudação para cliente novo"""
    print("=" * 70)
    print("EXEMPLO 1: Saudação - Cliente Novo")
    print("=" * 70)
    print()

    # Contexto
    context = SalesContext(
        client_name="Restaurante Dragão Dourado",
        client_name_cn="金龙餐厅",
        client_type="new",
        scenario=SalesScenario.NEW_CLIENT,
        preferred_language="both"
    )

    # Gerar mensagem
    generator = MessageGenerator(sales_person_name="Maria Silva")
    message = generator.generate_greeting(context)

    # Exibir versões
    print(message)
    print()


def example_quotation():
    """Exemplo 2: Orçamento com produtos"""
    print("=" * 70)
    print("EXEMPLO 2: Orçamento")
    print("=" * 70)
    print()

    # Contexto
    context = SalesContext(
        client_name="Restaurante Panda",
        client_name_cn="熊猫餐厅",
        client_type="regular",
        scenario=SalesScenario.PRICE_INQUIRY,
        preferred_language="both"
    )

    # Adicionar produtos
    context.add_product(ProductOffer(
        product_code="SAL-001",
        product_name="Salmão Fresco Noruega",
        product_name_cn="挪威新鲜三文鱼",
        quantity=50.0,
        unit="kg",
        unit_price=Decimal("13.50"),
        total_price=Decimal("675.00")
    ))

    context.add_product(ProductOffer(
        product_code="ATM-002",
        product_name="Atum Congelado Premium",
        product_name_cn="优质冷冻金枪鱼",
        quantity=30.0,
        unit="kg",
        unit_price=Decimal("16.00"),
        total_price=Decimal("480.00")
    ))

    # Gerar mensagem
    generator = MessageGenerator(sales_person_name="João Costa")
    message = generator.generate_quotation(context)

    # Exibir
    print(message)
    print()

    # Exibir versão WhatsApp em português
    print("=" * 70)
    print("VERSÃO WHATSAPP (PT):")
    print("=" * 70)
    print(message.get_message(Language.PT, "whatsapp"))
    print()


def example_quotation_with_discount():
    """Exemplo 3: Orçamento com desconto"""
    print("=" * 70)
    print("EXEMPLO 3: Orçamento com Desconto")
    print("=" * 70)
    print()

    # Contexto
    context = SalesContext(
        client_name="Restaurante Grande Muralha",
        client_name_cn="长城大酒楼",
        client_type="premium",
        scenario=SalesScenario.PRICE_INQUIRY,
        preferred_language="cn"
    )

    # Adicionar produtos com desconto
    context.add_product(ProductOffer(
        product_code="SAL-001",
        product_name="Salmão Fresco",
        product_name_cn="新鲜三文鱼",
        quantity=100.0,
        unit="kg",
        unit_price=Decimal("13.50"),
        total_price=Decimal("1350.00"),
        discount_percentage=Decimal("0.10")  # 10% desconto
    ))

    context.discount_approved = Decimal("0.10")
    context.margin_safe = True

    # Gerar mensagem
    generator = MessageGenerator(sales_person_name="Pedro Lopes")
    message = generator.generate_quotation(context)

    # Exibir versão chinês
    print("=== 中文版本 ===")
    print(message.get_message(Language.CN, "full"))
    print()


def example_follow_up():
    """Exemplo 4: Follow-up"""
    print("=" * 70)
    print("EXEMPLO 4: Follow-up")
    print("=" * 70)
    print()

    from sales_agent_b2b import FollowUpGenerator

    # Contexto
    context = SalesContext(
        client_name="Restaurante Lótus",
        client_name_cn="莲花餐厅",
        client_type="regular",
        scenario=SalesScenario.INACTIVE_CLIENT,
        days_since_contact=15,
        preferred_language="both"
    )

    # Gerar follow-up
    follow_up_gen = FollowUpGenerator(sales_person_name="Ana Santos")
    message = follow_up_gen.generate_follow_up(context)

    # Exibir
    print(message)
    print()


def example_upsell():
    """Exemplo 5: Upsell"""
    print("=" * 70)
    print("EXEMPLO 5: Sugestão de Upsell")
    print("=" * 70)
    print()

    from sales_agent_b2b import UpsellGenerator

    # Contexto
    context = SalesContext(
        client_name="Restaurante Imperador",
        client_name_cn="皇帝餐厅",
        client_type="vip",
        scenario=SalesScenario.REORDER,
        preferred_language="both"
    )

    # Produto atual
    context.add_product(ProductOffer(
        product_code="SAL-001",
        product_name="Salmão Fresco",
        product_name_cn="新鲜三文鱼",
        quantity=80.0,
        unit="kg",
        unit_price=Decimal("13.50"),
        total_price=Decimal("1080.00")
    ))

    # Gerar upsell
    upsell_gen = UpsellGenerator(sales_person_name="Carlos Mendes")

    # Adicionar sugestões
    suggestions = upsell_gen.generate_upsell_suggestions(context)
    for sugg in suggestions:
        context.add_upsell(sugg)

    message = upsell_gen.generate_upsell_message(context)

    # Exibir
    print(message)
    print()


def example_thank_you():
    """Exemplo 6: Agradecimento"""
    print("=" * 70)
    print("EXEMPLO 6: Agradecimento")
    print("=" * 70)
    print()

    # Contexto
    context = SalesContext(
        client_name="Restaurante Dinastia",
        client_name_cn="王朝餐厅",
        client_type="premium",
        scenario=SalesScenario.ORDER_CONFIRMATION,
        preferred_language="both"
    )

    # Gerar mensagem
    generator = MessageGenerator(sales_person_name="Rita Oliveira")
    message = generator.generate_thank_you(context, delivery_date="Segunda-feira, 13h")

    # Exibir versão curta
    print("=== PORTUGUÊS (Curta) ===")
    print(message.get_message(Language.PT, "short"))
    print()

    print("=== 中文 (短版) ===")
    print(message.get_message(Language.CN, "short"))
    print()


if __name__ == "__main__":
    example_greeting_new_client()
    example_quotation()
    example_quotation_with_discount()
    example_follow_up()
    example_upsell()
    example_thank_you()
