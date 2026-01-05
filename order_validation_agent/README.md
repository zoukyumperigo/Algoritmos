# Order Validation Agent 🔍

Sistema inteligente de validação de encomendas para empresa B2B de **frozen seafood**, **frozen meat** e **arroz para sushi**.

## 📋 Missão

Comparar encomendas enviadas via WhatsApp com faturas geradas no Sage e identificar qualquer inconsistência, garantindo precisão nas operações comerciais.

## 🎯 Funcionalidades

### 1. Validação Automática
- ✅ Compara encomendas (WhatsApp) vs faturas (Sage)
- ✅ Verifica quantidade, produto e preços
- ✅ Detecta produtos faltando ou extras
- ✅ Identifica divergências de cliente

### 2. Classificação de Erros
O sistema classifica erros em 3 níveis:

- **🔴 CRÍTICO**: Erros graves que exigem ação imediata
  - Produtos faltando na fatura
  - Produtos extras não solicitados
  - Divergências de cliente
  - Grandes diferenças de quantidade (>20%)

- **🟡 MÉDIO**: Erros que requerem atenção
  - Diferenças de quantidade moderadas (5-20%)
  - Preços com variação significativa (15-30%)

- **🟢 BAIXO**: Pequenas divergências aceitáveis
  - Pequenas diferenças de quantidade (1-5%)
  - Variações de preço mínimas

### 3. Impacto Financeiro
- Calcula o impacto em euros de cada erro
- Estima o impacto total da encomenda
- Ajuda na tomada de decisão

### 4. Recomendações Automáticas
O sistema sugere ações concretas:
- ⚠️ **Ação Urgente**: Para erros críticos
- ⚡ **Revisar**: Para erros médios
- ℹ️ **Verificar**: Para erros baixos

## 🏗️ Estrutura do Projeto

```
order_validation_agent/
├── __init__.py
├── models/
│   ├── __init__.py
│   ├── order.py              # Modelo de encomenda (WhatsApp)
│   ├── invoice.py            # Modelo de fatura (Sage)
│   └── validation_result.py  # Resultado da validação
├── validators/
│   ├── __init__.py
│   └── order_validator.py    # Validador principal
├── utils/
│   ├── __init__.py
│   └── parsers.py            # Parsers para WhatsApp e Sage
├── examples/
│   ├── example_basic.py      # Exemplos básicos
│   └── example_with_parsers.py  # Exemplos com parsers
└── README.md
```

## 🚀 Uso Rápido

### Exemplo Básico

```python
from order_validation_agent import Order, OrderItem, Invoice, InvoiceItem, OrderValidator
from decimal import Decimal

# 1. Criar encomenda (dados do WhatsApp)
order = Order(
    order_id="ORD-2024-001",
    client_name="Restaurante Sakura",
    client_code="CLI-123"
)
order.add_item(OrderItem("Salmão Fresco", "SAL-001", 50.0, "kg"))
order.add_item(OrderItem("Atum Congelado", "ATM-002", 30.0, "kg"))

# 2. Criar fatura (dados do Sage)
invoice = Invoice(
    invoice_number="INV-2024-001",
    order_id="ORD-2024-001",
    client_name="Restaurante Sakura",
    client_code="CLI-123"
)
invoice.add_item(InvoiceItem("Salmão Fresco", "SAL-001", 50.0, Decimal("12.50"), "kg"))
invoice.add_item(InvoiceItem("Atum Congelado", "ATM-002", 30.0, Decimal("15.00"), "kg"))

# 3. Validar
validator = OrderValidator()
result = validator.validate(order, invoice)

# 4. Ver resultado
print(result)
```

### Exemplo com Parsers (JSON)

```python
from order_validation_agent import OrderValidator
from order_validation_agent.utils.parsers import WhatsAppParser, SageParser
from decimal import Decimal

# Dados da encomenda (WhatsApp API)
whatsapp_data = {
    'order_id': 'ORD-2024-100',
    'client_name': 'Restaurante Mar Azul',
    'client_code': 'CLI-888',
    'items': [
        {'product_name': 'Salmão Fresco', 'product_code': 'SAL-001',
         'quantity': 100, 'unit': 'kg'},
        {'product_name': 'Atum Congelado', 'product_code': 'ATM-002',
         'quantity': 50, 'unit': 'kg'}
    ]
}

# Dados da fatura (Sage API)
sage_data = {
    'invoice_number': 'INV-2024-100',
    'order_id': 'ORD-2024-100',
    'client_name': 'Restaurante Mar Azul',
    'client_code': 'CLI-888',
    'items': [
        {'product_name': 'Salmão Fresco', 'product_code': 'SAL-001',
         'quantity': 100, 'unit_price': 13.50, 'unit': 'kg', 'discount': 0},
        {'product_name': 'Atum Congelado', 'product_code': 'ATM-002',
         'quantity': 50, 'unit_price': 15.50, 'unit': 'kg', 'discount': 0}
    ]
}

# Parse e validação
order = WhatsAppParser.parse_order(whatsapp_data)
invoice = SageParser.parse_invoice(sage_data)

validator = OrderValidator()
validator.load_price_references({
    "SAL-001": Decimal("12.50"),
    "ATM-002": Decimal("15.00")
})

result = validator.validate(order, invoice)
print(result)
```

## 📊 Exemplo de Saída

```
======================================================================
RELATÓRIO DE VALIDAÇÃO - Premium Sushi Bar
Encomenda: ORD-2024-006 | Fatura: INV-2024-006
======================================================================

RESUMO: ✗ 4 erro(s) detectado(s) - Crítico: 2, Médio: 1, Baixo: 1 | Impacto: €377.50

ERROS DETECTADOS:
----------------------------------------------------------------------
1. [CRÍTICO] product_missing - Arroz Sushi Premium (ARZ-003)
  Produto pedido mas não faturado

2. [CRÍTICO] product_extra - Polvo Congelado (POL-006)
  Produto faturado sem ter sido pedido (Impacto: €330.0)

3. [MÉDIO] quantity_mismatch - Salmão Fresco (SAL-001)
  Quantidade divergente (10.0% diferença) (Impacto: €62.50)

4. [MÉDIO] price_anomaly - Atum Congelado (ATM-002)
  Preço anômalo (66.7% variação) (Impacto: €300.0)

----------------------------------------------------------------------
IMPACTO FINANCEIRO TOTAL: €692.50

AÇÃO RECOMENDADA:
⚠ AÇÃO URGENTE: Corrigir 2 erro(s) crítico(s) antes de enviar. Impacto financeiro: €692.50
======================================================================
```

## ⚙️ Configuração

### Tolerâncias e Limites

```python
validator = OrderValidator(
    quantity_tolerance=0.02,          # 2% tolerância em quantidades
    price_variance_threshold=0.15     # 15% variação de preço aceitável
)
```

### Preços de Referência

```python
# Definir preço individual
validator.set_price_reference("SAL-001", Decimal("12.50"))

# Carregar tabela de preços
price_table = {
    "SAL-001": Decimal("12.50"),
    "ATM-002": Decimal("15.00"),
    "CAM-005": Decimal("18.00"),
    "ARZ-003": Decimal("8.00")
}
validator.load_price_references(price_table)
```

## 🔧 Tipos de Erros Detectados

| Tipo | Descrição | Nível Típico |
|------|-----------|--------------|
| `QUANTITY_MISMATCH` | Divergência de quantidade | Variável (baixo/médio/crítico) |
| `PRODUCT_MISSING` | Produto pedido mas não faturado | Crítico |
| `PRODUCT_EXTRA` | Produto faturado sem pedido | Crítico |
| `PRICE_ANOMALY` | Preço fora do padrão | Médio/Crítico |
| `CLIENT_MISMATCH` | Cliente não corresponde | Crítico |

## 📦 Modelos de Dados

### Order (Encomenda)
```python
@dataclass
class Order:
    order_id: str
    client_name: str
    client_code: str
    items: List[OrderItem]
    date: datetime
    notes: str
```

### Invoice (Fatura)
```python
@dataclass
class Invoice:
    invoice_number: str
    order_id: str
    client_name: str
    client_code: str
    items: List[InvoiceItem]
    date: datetime
    notes: str
```

### ValidationResult
```python
@dataclass
class ValidationResult:
    order_id: str
    invoice_number: str
    client_name: str
    errors: List[ValidationError]
    total_financial_impact: Decimal
    validation_passed: bool
```

## 🧪 Executar Exemplos

```bash
# Exemplo básico com vários cenários
python -m order_validation_agent.examples.example_basic

# Exemplo com parsers (JSON)
python -m order_validation_agent.examples.example_with_parsers
```

## 🎓 Casos de Uso

### 1. Validação Diária de Encomendas
Automatize a validação de todas as encomendas do dia antes do envio.

### 2. Auditoria de Faturas
Revise faturas mensais para identificar padrões de erros.

### 3. Alerta em Tempo Real
Integre com sistemas de notificação para alertas imediatos.

### 4. Relatórios Gerenciais
Gere relatórios de qualidade das operações.

## 🔐 Integração

### WhatsApp Business API
```python
# Webhook handler
@app.route('/webhook/whatsapp', methods=['POST'])
def whatsapp_webhook():
    data = request.json
    order = WhatsAppParser.parse_order(data)
    # ... processar encomenda
```

### Sage API
```python
# Buscar fatura do Sage
sage_response = sage_api.get_invoice(invoice_id)
invoice = SageParser.parse_invoice(sage_response)
# ... validar
```

## 📈 Benefícios

- ✅ Redução de erros de faturação
- ✅ Economia de tempo na conferência manual
- ✅ Melhoria na satisfação do cliente
- ✅ Redução de perdas financeiras
- ✅ Auditoria automática
- ✅ Rastreabilidade completa

## 🤝 Contribuindo

Para adicionar novos tipos de validação:
1. Adicione o tipo de erro em `ErrorType`
2. Implemente a lógica em `OrderValidator`
3. Adicione exemplos de uso
4. Atualize documentação

## 📝 Licença

Propriedade da empresa. Uso interno apenas.

## 📞 Suporte

Para questões ou sugestões, contacte a equipe de desenvolvimento.

---

**Order Validation Agent** - Garantindo precisão nas operações B2B 🎯
