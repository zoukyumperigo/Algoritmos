"""
Exemplo usando parsers para processar dados do WhatsApp e Sage
"""
from decimal import Decimal
from order_validation_agent import OrderValidator
from order_validation_agent.utils.parsers import WhatsAppParser, SageParser


def example_with_json_data():
    """
    Demonstra processamento de dados vindos de sistemas externos
    (WhatsApp API e Sage API)
    """
    print("=" * 70)
    print("EXEMPLO: Processamento com Parsers (WhatsApp + Sage)")
    print("=" * 70)
    print()

    # Dados da encomenda recebida via WhatsApp
    # (simulando resposta de uma API ou webhook)
    whatsapp_data = {
        'order_id': 'ORD-2024-100',
        'client_name': 'Restaurante Mar Azul',
        'client_code': 'CLI-888',
        'items': [
            {
                'product_name': 'Salmão Fresco Noruega',
                'product_code': 'SAL-001',
                'quantity': 100,
                'unit': 'kg'
            },
            {
                'product_name': 'Atum Congelado',
                'product_code': 'ATM-002',
                'quantity': 50,
                'unit': 'kg'
            },
            {
                'product_name': 'Camarão Tigre',
                'product_code': 'CAM-005',
                'quantity': 30,
                'unit': 'kg'
            },
            {
                'product_name': 'Arroz Sushi Premium',
                'product_code': 'ARZ-003',
                'quantity': 40,
                'unit': 'kg'
            }
        ]
    }

    # Dados da fatura gerada no Sage
    # (simulando resposta da API do Sage)
    sage_data = {
        'invoice_number': 'INV-2024-100',
        'order_id': 'ORD-2024-100',
        'client_name': 'Restaurante Mar Azul',
        'client_code': 'CLI-888',
        'items': [
            {
                'product_name': 'Salmão Fresco Noruega',
                'product_code': 'SAL-001',
                'quantity': 95,  # Erro: faturado 95kg em vez de 100kg
                'unit_price': 13.50,
                'unit': 'kg',
                'discount': 0
            },
            {
                'product_name': 'Atum Congelado',
                'product_code': 'ATM-002',
                'quantity': 50,
                'unit_price': 15.50,
                'unit': 'kg',
                'discount': 0
            },
            {
                'product_name': 'Camarão Tigre',
                'product_code': 'CAM-005',
                'quantity': 30,
                'unit_price': 18.00,
                'unit': 'kg',
                'discount': 50  # Desconto de €50
            },
            # Faltou o Arroz Sushi Premium (ARZ-003)
            {
                'product_name': 'Polvo Congelado',  # Produto extra não pedido
                'product_code': 'POL-006',
                'quantity': 20,
                'unit_price': 22.00,
                'unit': 'kg',
                'discount': 0
            }
        ]
    }

    # Parse dos dados
    print("Processando encomenda do WhatsApp...")
    order = WhatsAppParser.parse_order(whatsapp_data)
    print(f"✓ Encomenda {order.order_id} processada: {order.get_total_items()} itens")
    print()

    print("Processando fatura do Sage...")
    invoice = SageParser.parse_invoice(sage_data)
    print(f"✓ Fatura {invoice.invoice_number} processada: {invoice.get_total_items()} itens")
    print(f"  Total da fatura: €{invoice.total}")
    print()

    # Configurar validador com preços de referência
    validator = OrderValidator(
        quantity_tolerance=0.02,  # 2% de tolerância
        price_variance_threshold=Decimal("0.10")  # 10% variação de preço
    )

    # Carregar preços de referência (tabela de preços da empresa)
    price_table = {
        "SAL-001": Decimal("12.50"),  # Salmão: €12.50/kg
        "ATM-002": Decimal("15.00"),  # Atum: €15.00/kg
        "CAM-005": Decimal("18.00"),  # Camarão: €18.00/kg
        "ARZ-003": Decimal("8.00"),   # Arroz: €8.00/kg
        "POL-006": Decimal("22.00")   # Polvo: €22.00/kg
    }
    validator.load_price_references(price_table)

    # Validar
    print("Executando validação...")
    print("=" * 70)
    result = validator.validate(order, invoice)

    # Exibir resultado
    print(result)

    # Análise detalhada por nível de erro
    print()
    print("=" * 70)
    print("ANÁLISE DETALHADA")
    print("=" * 70)

    critical = result.get_critical_errors()
    medium = result.get_medium_errors()
    low = result.get_low_errors()

    if critical:
        print(f"\n🔴 ERROS CRÍTICOS ({len(critical)}):")
        for err in critical:
            print(f"   - {err.product_name}: {err.description}")

    if medium:
        print(f"\n🟡 ERROS MÉDIOS ({len(medium)}):")
        for err in medium:
            print(f"   - {err.product_name}: {err.description}")

    if low:
        print(f"\n🟢 ERROS BAIXOS ({len(low)}):")
        for err in low:
            print(f"   - {err.product_name}: {err.description}")

    print()
    print("=" * 70)


if __name__ == "__main__":
    example_with_json_data()
