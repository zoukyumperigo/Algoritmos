# Pricing & Margin Agent 💰

Sistema inteligente de análise de margens e recomendação de preços para empresa B2B de **frozen seafood**, **frozen meat** e **arroz para sushi**.

## 🎯 Missão

Garantir que nenhuma venda é feita com margem perigosa e sugerir preços ótimos baseados em análise inteligente de custos, cliente e mercado.

## 📊 Funcionalidades

### 1. Cálculo de Margens
- ✅ Margem bruta absoluta e percentual
- ✅ Markup sobre custo
- ✅ Margem por unidade e total
- ✅ Análise de custos detalhados

### 2. Classificação de Risco
O sistema classifica margens em 5 níveis:

- **🟢 EXCELENTE**: Margem acima do premium (>35%)
  - Ótima rentabilidade
  - Aprovação imediata

- **🔵 BOM**: Margem entre target e premium (25-35%)
  - Boa rentabilidade
  - Dentro do esperado

- **🟡 ACEITÁVEL**: Margem entre mínimo e target (15-25%)
  - Rentabilidade aceitável
  - Pode melhorar em futuras negociações

- **🟠 PERIGOSO**: Margem abaixo do mínimo mas positiva (<15%)
  - Rentabilidade baixa
  - Aprovar com ressalvas
  - Requer atenção

- **🔴 CRÍTICO**: Margem negativa ou zero
  - Prejuízo garantido
  - NÃO APROVAR
  - Requer correção imediata

### 3. Recomendações Inteligentes
- ✅ Preços alternativos para margens mínima, alvo e premium
- ✅ Ajustes baseados no tipo de cliente
- ✅ Sugestões de bundles e cross-sell
- ✅ Descontos por volume
- ✅ Justificativas detalhadas

### 4. Análise por Cliente
- **Regular**: Cliente padrão com margem base
- **Premium**: Cliente frequente com desconto moderado
- **VIP**: Cliente de alto valor com benefícios especiais

### 5. Frequência de Compra
- **Occasional**: Compra esporádica
- **Monthly**: Compra mensal
- **Weekly**: Compra semanal (desconto por fidelidade)
- **Daily**: Compra diária (máximo desconto)

## 🏗️ Estrutura do Projeto

```
pricing_margin_agent/
├── __init__.py
├── models/
│   ├── __init__.py
│   ├── client.py          # Modelos de cliente
│   ├── product.py         # Modelos de produto e custo
│   └── pricing.py         # Modelos de pricing e resultado
├── calculators/
│   ├── __init__.py
│   └── pricing_calculator.py  # Calculadora de preços e margens
├── analyzers/
│   ├── __init__.py
│   └── margin_analyzer.py     # Analisador principal
├── examples/
│   ├── example_basic.py       # Exemplos básicos
│   └── example_advanced.py    # Exemplos avançados
└── main.py                    # Script principal
```

## 🚀 Uso Rápido

### Exemplo Básico

```python
from pricing_margin_agent import (
    Product, ProductCost, Client, ClientType, PurchaseFrequency,
    PricingProposal, MarginAnalyzer
)
from decimal import Decimal

# 1. Definir produto
product = Product(
    product_code="SAL-001",
    name="Salmão Fresco Noruega",
    category="seafood",
    cost=ProductCost(
        purchase_cost=Decimal("10.00"),
        storage_cost=Decimal("0.50"),
        handling_cost=Decimal("0.30")
    ),
    minimum_margin=Decimal("0.15"),  # 15%
    target_margin=Decimal("0.25"),   # 25%
    premium_margin=Decimal("0.35")   # 35%
)

# 2. Definir cliente
client = Client(
    client_id="CLI-001",
    name="Restaurante Sakura",
    client_type=ClientType.PREMIUM,
    purchase_frequency=PurchaseFrequency.WEEKLY
)

# 3. Criar proposta de preço
proposal = PricingProposal(
    product=product,
    client=client,
    proposed_price=Decimal("14.00"),
    quantity=50.0
)

# 4. Analisar
analyzer = MarginAnalyzer()
result = analyzer.analyze(proposal)

# 5. Ver resultado
print(result)
```

### Exemplo com Desconto

```python
# Proposta com 10% de desconto
proposal = PricingProposal(
    product=product,
    client=client,
    proposed_price=Decimal("16.00"),
    quantity=100.0,
    discount_percentage=Decimal("0.10")  # 10% desconto
)

result = analyzer.analyze(proposal)
print(result.get_summary())
print(result.recommendation)
```

## 📊 Exemplo de Saída

```
======================================================================
ANÁLISE DE PRICING & MARGEM
Produto: Salmão Fresco Noruega
Cliente: Restaurante Sakura Premium (premium)
======================================================================

RESUMO: 🟡 Margem ACEITÁVEL: 23.5% (€3.20/un) | Total: €256.00

CÁLCULOS:
----------------------------------------------------------------------
Quantidade: 80.0 kg
Preço proposto: €17.00/kg
Desconto: 5.0%
Preço final: €16.15/kg
Custo unitário: €13.30/kg
Margem unitária: €2.85 (23.5%)
Margem total: €228.00
Valor total da venda: €1292.00

CLASSIFICAÇÃO: 🟡 ACEITÁVEL

RECOMENDAÇÃO:
🟡 APROVAR - Margem aceitável mas há espaço para melhoria.

JUSTIFICAÇÃO:
Margem de 23.5% está acima do mínimo mas abaixo do alvo de 25.0%.
Cliente premium - margem adequada para o relacionamento.
Lucro estimado: €228.00.

PREÇOS ALTERNATIVOS SUGERIDOS:
----------------------------------------------------------------------
1. €17.73 (Margem: 25.0%) - Preço alvo recomendado para este produto

OPORTUNIDADES DE BUNDLE:
----------------------------------------------------------------------
1. Bundle: Salmão Fresco Noruega + Arroz Sushi Premium
  Valor: €1679.60 (Desconto: 5.0%)
  Melhoria de margem: 8.0%
  Clientes de seafood geralmente compram arroz. Bundle aumenta ticket e melhora margem geral.

======================================================================
✓ DECISÃO: Pode prosseguir com cautela
======================================================================
```

## 🔧 Calculadora de Preços

O `PricingCalculator` oferece funções úteis:

```python
from pricing_margin_agent import PricingCalculator
from decimal import Decimal

calc = PricingCalculator()

# Calcular margem
margin_abs, margin_pct = calc.calculate_margin(
    cost=Decimal("10.00"),
    price=Decimal("15.00")
)
# Resultado: €5.00 (33.3%)

# Calcular preço para margem alvo
price = calc.price_from_margin(
    cost=Decimal("10.00"),
    target_margin=Decimal("0.25")  # 25%
)
# Resultado: €13.33

# Aplicar desconto por volume
final_price, discount = calc.apply_volume_discount(
    base_price=Decimal("15.00"),
    quantity=150
)
# Resultado: €14.25 (5% desconto para 100+ unidades)

# Ajuste de preço por cliente
adjusted_price, reason = calc.calculate_client_adjusted_price(
    product=product,
    client=client,
    base_price=Decimal("15.00")
)
```

## 📈 Cenários de Uso

### 1. Análise Rápida de Proposta
```python
# Verificação rápida antes de enviar orçamento
summary = analyzer.quick_check(proposal)
print(summary)
```

### 2. Comparação de Cenários
```python
# Comparar diferentes preços ou quantidades
scenarios = [
    (Decimal("14.00"), 50.0),
    (Decimal("15.00"), 75.0),
    (Decimal("16.00"), 100.0)
]

for price, qty in scenarios:
    proposal = PricingProposal(product, client, price, qty)
    result = analyzer.analyze(proposal)
    print(f"Preço €{price} x {qty}kg: {result.get_summary()}")
```

### 3. Otimização de Margem
```python
# Encontrar melhor preço para margem alvo
target_price = product.get_target_price(quantity=100)
proposal = PricingProposal(product, client, target_price, 100)
result = analyzer.analyze(proposal)

if result.risk_level == MarginRisk.BOM:
    print("✓ Preço ótimo encontrado!")
```

## 🎓 Regras de Negócio

### Margens por Categoria
- **Seafood**: Mínimo 15%, Alvo 25%, Premium 35%
- **Meat**: Mínimo 20%, Alvo 30%, Premium 40%
- **Rice**: Mínimo 15%, Alvo 25%, Premium 35%

### Descontos por Cliente
| Tipo | Base | + Frequência | Máximo |
|------|------|--------------|--------|
| Regular | 5% | +0-2% | 7% |
| Premium | 10% | +0-5% | 15% |
| VIP | 15% | +0-8% | 23% |

### Descontos por Volume
| Quantidade | Desconto |
|-----------|----------|
| 100-249 | 5% |
| 250-499 | 10% |
| 500-999 | 15% |
| 1000+ | 20% |

## 🔐 Alertas Automáticos

O sistema gera alertas para:
- ⚠️ Margem negativa (prejuízo)
- ⚠️ Margem abaixo do mínimo
- ⚠️ Quantidade abaixo do mínimo
- ⚠️ Desconto excessivo para tipo de cliente
- ⚠️ Cliente de baixo valor com margem baixa

## 📦 Estrutura de Custos

```python
ProductCost(
    purchase_cost=Decimal("10.00"),    # Custo de aquisição
    storage_cost=Decimal("0.50"),      # Armazenamento
    handling_cost=Decimal("0.30"),     # Manuseio
    transport_cost=Decimal("0.20"),    # Transporte
    other_costs=Decimal("0.10")        # Outros
)
# Custo total: €11.10
```

## 🧪 Executar Exemplos

```bash
# Script principal de demonstração
python3 -m pricing_margin_agent.main

# Exemplos básicos
python3 -m pricing_margin_agent.examples.example_basic

# Exemplos avançados
python3 -m pricing_margin_agent.examples.example_advanced
```

## 🔄 Integração com Order Validation Agent

O Pricing & Margin Agent pode ser usado em conjunto com o Order Validation Agent:

```python
# 1. Validar encomenda vs fatura
from order_validation_agent import OrderValidator
order_result = validator.validate(order, invoice)

# 2. Analisar margem da venda
from pricing_margin_agent import MarginAnalyzer
pricing_result = margin_analyzer.analyze(proposal)

# 3. Decisão final
if order_result.validation_passed and pricing_result.is_safe_to_proceed():
    print("✓ Aprovar venda")
else:
    print("✗ Revisar antes de aprovar")
```

## 💡 Benefícios

- ✅ Elimina vendas com prejuízo
- ✅ Otimiza margens de lucro
- ✅ Recomendações baseadas em dados
- ✅ Análise rápida e automatizada
- ✅ Suporte a decisões comerciais
- ✅ Transparência nos cálculos
- ✅ Justificativas para negociação

## 📝 Licença

Propriedade da empresa. Uso interno apenas.

## 📞 Suporte

Para questões ou sugestões, contacte a equipe de desenvolvimento.

---

**Pricing & Margin Agent** - Maximizando rentabilidade com inteligência 🎯
