#!/usr/bin/env python3
"""
Order Validation Agent - Script Principal
Demonstração do sistema de validação
"""

import sys
from decimal import Decimal
from order_validation_agent.models.order import Order, OrderItem
from order_validation_agent.models.invoice import Invoice, InvoiceItem
from order_validation_agent.validators.order_validator import OrderValidator


def main():
    """
    Demonstração principal do Order Validation Agent
    """
    print("=" * 70)
    print("ORDER VALIDATION AGENT")
    print("Validação de Encomendas B2B - Frozen Seafood, Meat & Sushi Rice")
    print("=" * 70)
    print()

    # Criar encomenda de exemplo
    print("📱 Encomenda recebida via WhatsApp:")
    print("-" * 70)
    order = Order(
        order_id="ORD-2024-DEMO",
        client_name="Restaurante Sakura Premium",
        client_code="CLI-DEMO-001"
    )
    order.add_item(OrderItem("Salmão Fresco Noruega", "SAL-001", 75.0, "kg"))
    order.add_item(OrderItem("Atum Congelado Premium", "ATM-002", 50.0, "kg"))
    order.add_item(OrderItem("Camarão Tigre", "CAM-005", 25.0, "kg"))
    order.add_item(OrderItem("Arroz Sushi Premium", "ARZ-003", 30.0, "kg"))

    print(order)
    print()

    # Criar fatura com alguns erros intencionais
    print("🧾 Fatura gerada no Sage:")
    print("-" * 70)
    invoice = Invoice(
        invoice_number="INV-2024-DEMO",
        order_id="ORD-2024-DEMO",
        client_name="Restaurante Sakura Premium",
        client_code="CLI-DEMO-001"
    )
    # Salmão: quantidade errada (70kg em vez de 75kg)
    invoice.add_item(InvoiceItem("Salmão Fresco Noruega", "SAL-001", 70.0,
                                 Decimal("13.50"), "kg"))
    # Atum: OK
    invoice.add_item(InvoiceItem("Atum Congelado Premium", "ATM-002", 50.0,
                                 Decimal("15.50"), "kg"))
    # Camarão: OK
    invoice.add_item(InvoiceItem("Camarão Tigre", "CAM-005", 25.0,
                                 Decimal("18.00"), "kg"))
    # Arroz: FALTOU (não foi adicionado à fatura)

    print(invoice)
    print()

    # Configurar validador
    print("⚙️  Configurando validador...")
    validator = OrderValidator(
        quantity_tolerance=0.02,  # 2% tolerância
        price_variance_threshold=Decimal("0.10")  # 10% variação de preço
    )

    # Carregar preços de referência
    validator.load_price_references({
        "SAL-001": Decimal("12.50"),
        "ATM-002": Decimal("15.00"),
        "CAM-005": Decimal("18.00"),
        "ARZ-003": Decimal("8.00")
    })
    print("✓ Preços de referência carregados")
    print()

    # Validar
    print("🔍 Executando validação...")
    print()
    result = validator.validate(order, invoice)

    # Exibir resultado completo
    print(result)

    # Retornar código de erro se houver problemas críticos
    if result.has_critical_errors():
        print()
        print("⚠️  ATENÇÃO: Erros críticos detectados!")
        return 1
    elif result.errors:
        print()
        print("⚡ Erros não-críticos detectados. Revisar antes de prosseguir.")
        return 2
    else:
        print()
        print("✓ Validação concluída com sucesso!")
        return 0


if __name__ == "__main__":
    sys.exit(main())
