#!/usr/bin/env python3
"""
Sales Agent B2B - Script Principal
Demonstração do sistema de vendas bilíngue
"""

import sys
from decimal import Decimal
from sales_agent_b2b.models.sales_context import SalesContext, SalesScenario, ProductOffer
from sales_agent_b2b.generators.message_generator import MessageGenerator
from sales_agent_b2b.generators.upsell_generator import UpsellGenerator
from sales_agent_b2b.models.message import Language
from sales_agent_b2b.utils.pricing_integration import PricingIntegration


def main():
    """
    Demonstração principal do Sales Agent B2B
    """
    print("=" * 70)
    print("SALES AGENT B2B")
    print("Vendas para Restaurantes Chineses - Frozen Seafood, Meat & Rice")
    print("=" * 70)
    print()

    # Configurar pricing integration
    pricing = PricingIntegration()

    # Cenário: Cliente premium solicita orçamento
    print("📋 CENÁRIO: Orçamento para Cliente Premium")
    print("-" * 70)
    print()

    # 1. Criar contexto
    context = SalesContext(
        client_name="Restaurante Grande Muralha",
        client_name_cn="长城大酒楼",
        client_type="premium",
        scenario=SalesScenario.PRICE_INQUIRY,
        preferred_language="both"  # Cliente prefere ver ambas as versões
    )

    # 2. Adicionar produtos solicitados
    print("Produtos solicitados:")

    product1 = ProductOffer(
        product_code="SAL-001",
        product_name="Salmão Fresco Noruega Premium",
        product_name_cn="挪威优质新鲜三文鱼",
        quantity=80.0,
        unit="kg",
        unit_price=Decimal("14.50"),
        total_price=Decimal("1160.00")
    )
    context.add_product(product1)
    print(f"  • {product1.product_name}: {product1.quantity}{product1.unit} × €{product1.unit_price}")

    product2 = ProductOffer(
        product_code="ATM-002",
        product_name="Atum Congelado Premium",
        product_name_cn="优质冷冻金枪鱼",
        quantity=50.0,
        unit="kg",
        unit_price=Decimal("16.50"),
        total_price=Decimal("825.00")
    )
    context.add_product(product2)
    print(f"  • {product2.product_name}: {product2.quantity}{product2.unit} × €{product2.unit_price}")

    print(f"\nValor total: €{context.total_value:.2f}")
    print()

    # 3. Verificar margem (integração com Pricing Agent)
    print("🔍 Verificando margens...")
    is_safe, margin, recommendation = pricing.check_margin_safe(
        product1.product_code,
        product1.product_name,
        Decimal("11.00"),  # Custo
        product1.unit_price,
        product1.quantity,
        client_type=context.client_type
    )

    context.margin_safe = is_safe
    context.margin_percentage = margin

    if margin:
        print(f"  Margem: {margin * 100:.1f}%")
        print(f"  Status: {'✓ Segura' if is_safe else '⚠ Atenção'}")
    print()

    # 4. Gerar orçamento
    print("💬 Gerando orçamento bilíngue...")
    print()

    generator = MessageGenerator(sales_person_name="Maria Silva")
    quotation = generator.generate_quotation(context)

    # Exibir versão portuguesa
    print("=" * 70)
    print("VERSÃO PORTUGUESA (Completa)")
    print("=" * 70)
    print(quotation.get_message(Language.PT, "full"))
    print()

    # Exibir versão chinesa
    print("=" * 70)
    print("中文版本 (完整)")
    print("=" * 70)
    print(quotation.get_message(Language.CN, "full"))
    print()

    # 5. Sugerir upsell
    print("=" * 70)
    print("💡 SUGESTÕES DE UPSELL")
    print("=" * 70)
    print()

    upsell_gen = UpsellGenerator(sales_person_name="Maria Silva")

    if upsell_gen.should_suggest_upsell(context):
        # Gerar sugestões
        suggestions = upsell_gen.generate_upsell_suggestions(context)

        if suggestions:
            print(f"Identificadas {len(suggestions)} oportunidades de upsell:")
            for sugg in suggestions:
                context.add_upsell(sugg)
                print(f"  • {sugg.product_name} ({sugg.product_name_cn})")
                print(f"    {sugg.quantity}{sugg.unit} × €{sugg.unit_price} = €{sugg.total_price}")

            # Gerar mensagem de upsell
            print()
            print("Mensagem de upsell (PT - Versão curta):")
            print("-" * 70)
            upsell_message = upsell_gen.generate_upsell_message(context)
            print(upsell_message.get_message(Language.PT, "short"))
            print()
        else:
            print("Nenhuma sugestão de upsell disponível no momento.")
    else:
        print("Contexto não é apropriado para upsell.")

    print()

    # 6. Demonstrar versão WhatsApp
    print("=" * 70)
    print("📱 VERSÃO WHATSAPP (Otimizada)")
    print("=" * 70)
    print()
    print("PT:")
    print(quotation.get_message(Language.PT, "whatsapp"))
    print()
    print("CN:")
    print(quotation.get_message(Language.CN, "whatsapp"))
    print()

    print("=" * 70)
    print("✓ Demonstração concluída!")
    print("=" * 70)

    return 0


if __name__ == "__main__":
    sys.exit(main())
