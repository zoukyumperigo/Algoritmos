"""
Exemplo básico de uso do Order Validation Agent
Demonstra validação de encomenda vs fatura
"""
from decimal import Decimal
from order_validation_agent import Order, OrderItem, Invoice, InvoiceItem, OrderValidator


def example_perfect_match():
    """Exemplo 1: Encomenda e fatura correspondem perfeitamente"""
    print("=" * 70)
    print("EXEMPLO 1: Validação Perfeita")
    print("=" * 70)

    # Encomenda recebida via WhatsApp
    order = Order(
        order_id="ORD-2024-001",
        client_name="Restaurante Sakura",
        client_code="CLI-123"
    )
    order.add_item(OrderItem("Salmão Fresco", "SAL-001", 50.0, "kg"))
    order.add_item(OrderItem("Atum Congelado", "ATM-002", 30.0, "kg"))
    order.add_item(OrderItem("Arroz Sushi Premium", "ARZ-003", 20.0, "kg"))

    # Fatura gerada no Sage
    invoice = Invoice(
        invoice_number="INV-2024-001",
        order_id="ORD-2024-001",
        client_name="Restaurante Sakura",
        client_code="CLI-123"
    )
    invoice.add_item(InvoiceItem("Salmão Fresco", "SAL-001", 50.0, Decimal("12.50"), "kg"))
    invoice.add_item(InvoiceItem("Atum Congelado", "ATM-002", 30.0, Decimal("15.00"), "kg"))
    invoice.add_item(InvoiceItem("Arroz Sushi Premium", "ARZ-003", 20.0, Decimal("8.00"), "kg"))

    # Validar
    validator = OrderValidator()
    result = validator.validate(order, invoice)

    print(result)
    print()


def example_quantity_mismatch():
    """Exemplo 2: Divergência de quantidade"""
    print("=" * 70)
    print("EXEMPLO 2: Divergência de Quantidade")
    print("=" * 70)

    # Encomenda
    order = Order(
        order_id="ORD-2024-002",
        client_name="Sushi Express",
        client_code="CLI-456"
    )
    order.add_item(OrderItem("Salmão Fresco", "SAL-001", 50.0, "kg"))

    # Fatura com quantidade errada (45kg em vez de 50kg)
    invoice = Invoice(
        invoice_number="INV-2024-002",
        order_id="ORD-2024-002",
        client_name="Sushi Express",
        client_code="CLI-456"
    )
    invoice.add_item(InvoiceItem("Salmão Fresco", "SAL-001", 45.0, Decimal("12.50"), "kg"))

    # Validar
    validator = OrderValidator()
    result = validator.validate(order, invoice)

    print(result)
    print()


def example_missing_product():
    """Exemplo 3: Produto faltando na fatura"""
    print("=" * 70)
    print("EXEMPLO 3: Produto Faltando na Fatura")
    print("=" * 70)

    # Encomenda com 2 produtos
    order = Order(
        order_id="ORD-2024-003",
        client_name="Tokyo Fusion",
        client_code="CLI-789"
    )
    order.add_item(OrderItem("Salmão Fresco", "SAL-001", 50.0, "kg"))
    order.add_item(OrderItem("Atum Congelado", "ATM-002", 30.0, "kg"))

    # Fatura só com 1 produto (faltou o Atum)
    invoice = Invoice(
        invoice_number="INV-2024-003",
        order_id="ORD-2024-003",
        client_name="Tokyo Fusion",
        client_code="CLI-789"
    )
    invoice.add_item(InvoiceItem("Salmão Fresco", "SAL-001", 50.0, Decimal("12.50"), "kg"))

    # Validar
    validator = OrderValidator()
    result = validator.validate(order, invoice)

    print(result)
    print()


def example_extra_product():
    """Exemplo 4: Produto extra na fatura (não foi pedido)"""
    print("=" * 70)
    print("EXEMPLO 4: Produto Extra na Fatura")
    print("=" * 70)

    # Encomenda com 1 produto
    order = Order(
        order_id="ORD-2024-004",
        client_name="Nikkei Kitchen",
        client_code="CLI-999"
    )
    order.add_item(OrderItem("Salmão Fresco", "SAL-001", 50.0, "kg"))

    # Fatura com produto extra não pedido
    invoice = Invoice(
        invoice_number="INV-2024-004",
        order_id="ORD-2024-004",
        client_name="Nikkei Kitchen",
        client_code="CLI-999"
    )
    invoice.add_item(InvoiceItem("Salmão Fresco", "SAL-001", 50.0, Decimal("12.50"), "kg"))
    invoice.add_item(InvoiceItem("Camarão Tigre", "CAM-005", 20.0, Decimal("18.00"), "kg"))

    # Validar
    validator = OrderValidator()
    result = validator.validate(order, invoice)

    print(result)
    print()


def example_price_anomaly():
    """Exemplo 5: Preço anômalo"""
    print("=" * 70)
    print("EXEMPLO 5: Preço Anômalo")
    print("=" * 70)

    # Encomenda
    order = Order(
        order_id="ORD-2024-005",
        client_name="Ocean Bistro",
        client_code="CLI-555"
    )
    order.add_item(OrderItem("Salmão Fresco", "SAL-001", 50.0, "kg"))

    # Fatura com preço muito acima do normal
    invoice = Invoice(
        invoice_number="INV-2024-005",
        order_id="ORD-2024-005",
        client_name="Ocean Bistro",
        client_code="CLI-555"
    )
    invoice.add_item(InvoiceItem("Salmão Fresco", "SAL-001", 50.0, Decimal("25.00"), "kg"))

    # Validar com preço de referência
    validator = OrderValidator()
    validator.set_price_reference("SAL-001", Decimal("12.50"))  # Preço normal: €12.50/kg

    result = validator.validate(order, invoice)

    print(result)
    print()


def example_multiple_errors():
    """Exemplo 6: Múltiplos erros (cenário real complexo)"""
    print("=" * 70)
    print("EXEMPLO 6: Múltiplos Erros")
    print("=" * 70)

    # Encomenda
    order = Order(
        order_id="ORD-2024-006",
        client_name="Premium Sushi Bar",
        client_code="CLI-777"
    )
    order.add_item(OrderItem("Salmão Fresco", "SAL-001", 50.0, "kg"))
    order.add_item(OrderItem("Atum Congelado", "ATM-002", 30.0, "kg"))
    order.add_item(OrderItem("Arroz Sushi Premium", "ARZ-003", 25.0, "kg"))

    # Fatura com vários erros
    invoice = Invoice(
        invoice_number="INV-2024-006",
        order_id="ORD-2024-006",
        client_name="Premium Sushi Bar",
        client_code="CLI-777"
    )
    # Salmão: quantidade errada (45 em vez de 50)
    invoice.add_item(InvoiceItem("Salmão Fresco", "SAL-001", 45.0, Decimal("12.50"), "kg"))
    # Atum: preço anômalo
    invoice.add_item(InvoiceItem("Atum Congelado", "ATM-002", 30.0, Decimal("25.00"), "kg"))
    # Faltou o Arroz
    # Extra: produto não pedido
    invoice.add_item(InvoiceItem("Polvo Congelado", "POL-006", 15.0, Decimal("22.00"), "kg"))

    # Validar com preços de referência
    validator = OrderValidator()
    validator.load_price_references({
        "SAL-001": Decimal("12.50"),
        "ATM-002": Decimal("15.00"),
        "ARZ-003": Decimal("8.00"),
        "POL-006": Decimal("22.00")
    })

    result = validator.validate(order, invoice)

    print(result)
    print()


if __name__ == "__main__":
    # Executar todos os exemplos
    example_perfect_match()
    example_quantity_mismatch()
    example_missing_product()
    example_extra_product()
    example_price_anomaly()
    example_multiple_errors()
