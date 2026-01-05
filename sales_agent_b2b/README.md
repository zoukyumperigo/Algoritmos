# Sales Agent B2B 💬

Sistema inteligente de vendas **bilíngue (PT/CN)** para empresa B2B de **frozen seafood**, **frozen meat** e **arroz para sushi**, especializado em atender **restaurantes chineses em Portugal**.

## 🎯 Missão

Responder clientes, negociar sem perder margem, sugerir upsell e criar follow-ups - tudo em **Português** e **Chinês (Mandarim Simplificado)**.

## 🌟 Funcionalidades

### 1. Mensagens Bilíngues (PT + 中文)
- ✅ **Português**: Mensagens profissionais em português europeu
- ✅ **Chinês**: 中文简体 (Mandarim Simplificado)
- ✅ Geração automática de ambas as versões
- ✅ Nomes de produtos traduzidos

### 2. Três Versões por Mensagem
- **Completa**: Versão detalhada e formal
- **Curta**: Versão concisa e direta
- **WhatsApp**: Otimizada para mensagens rápidas

### 3. Tipos de Mensagem

| Tipo | Descrição | Uso |
|------|-----------|-----|
| **Greeting** | Saudação inicial | Novo cliente ou cliente regular |
| **Quotation** | Orçamento | Resposta a pedido de preço |
| **Follow-up** | Acompanhamento | Cliente inativo ou check-in regular |
| **Upsell** | Sugestão adicional | Oportunidade de venda cruzada |
| **Discount Offer** | Oferta especial | Promoções e campanhas |
| **Negotiation** | Negociação | Aceitar ou contra-proposta |
| **Thank You** | Agradecimento | Confirmação de pedido |

### 4. Verificação Automática de Margem
- 🔒 **Integração com Pricing & Margin Agent**
- 🔒 Verifica margem antes de aprovar desconto
- 🔒 Sugere desconto máximo seguro
- 🔒 Contra-proposta automática se necessário

### 5. Sugestões Inteligentes de Upsell
- 🎯 Detecta oportunidades de venda cruzada
- 🎯 Produtos complementares automáticos
- 🎯 Bundles com desconto
- 🎯 Respeita margem mínima

### 6. Sistema de Follow-up
- 📅 Cronograma automático por tipo de cliente
- 📅 Ofertas especiais para reativação
- 📅 Tom adequado à situação

## 🏗️ Estrutura do Projeto

```
sales_agent_b2b/
├── __init__.py
├── models/
│   ├── message.py            # Message, BilingualMessage, MessageType
│   └── sales_context.py      # SalesContext, ProductOffer, SalesScenario
├── templates/
│   └── message_templates.py  # Templates PT/CN
├── generators/
│   ├── message_generator.py  # Gerador principal
│   ├── follow_up_generator.py # Follow-ups
│   └── upsell_generator.py   # Sugestões de upsell
├── utils/
│   └── pricing_integration.py # Integração com Pricing Agent
├── examples/
│   └── example_basic.py      # Exemplos de uso
└── main.py                   # Script principal
```

## 🚀 Uso Rápido

### Exemplo Básico: Orçamento Bilíngue

```python
from sales_agent_b2b import (
    SalesContext, ProductOffer, MessageGenerator, Language
)
from decimal import Decimal

# 1. Criar contexto
context = SalesContext(
    client_name="Restaurante Dragão Dourado",
    client_name_cn="金龙餐厅",
    client_type="premium",
    preferred_language="both"  # PT + CN
)

# 2. Adicionar produtos
context.add_product(ProductOffer(
    product_code="SAL-001",
    product_name="Salmão Fresco Noruega",
    product_name_cn="挪威新鲜三文鱼",
    quantity=50.0,
    unit="kg",
    unit_price=Decimal("14.50"),
    total_price=Decimal("725.00")
))

# 3. Gerar orçamento
generator = MessageGenerator(sales_person_name="Maria Silva")
message = generator.generate_quotation(context)

# 4. Exibir versões
print(message.get_message(Language.PT, "full"))    # PT completa
print(message.get_message(Language.CN, "short"))   # CN curta
print(message.get_message(Language.PT, "whatsapp")) # PT WhatsApp
```

### Exemplo: Follow-up Automático

```python
from sales_agent_b2b import FollowUpGenerator

context = SalesContext(
    client_name="Restaurante Panda",
    client_name_cn="熊猫餐厅",
    client_type="regular",
    days_since_contact=15
)

follow_up_gen = FollowUpGenerator()

# Verificar se deve fazer follow-up
if follow_up_gen.should_follow_up(context.days_since_contact, context.client_type):
    message = follow_up_gen.generate_follow_up(context)
    print(message)
```

### Exemplo: Upsell com Verificação de Margem

```python
from sales_agent_b2b import UpsellGenerator
from sales_agent_b2b.utils.pricing_integration import PricingIntegration

# Produto principal
context.add_product(ProductOffer(
    product_code="SAL-001",
    product_name="Salmão",
    product_name_cn="三文鱼",
    quantity=80.0,
    unit="kg",
    unit_price=Decimal("14.00"),
    total_price=Decimal("1120.00")
))

# Gerar sugestões de upsell
upsell_gen = UpsellGenerator()
suggestions = upsell_gen.generate_upsell_suggestions(context)

# Verificar margem antes de sugerir
pricing = PricingIntegration()
for sugg in suggestions:
    is_safe, margin, _ = pricing.check_margin_safe(
        sugg.product_code, sugg.product_name,
        Decimal("6.00"), sugg.unit_price, sugg.quantity
    )
    if is_safe:
        context.add_upsell(sugg)

# Gerar mensagem de upsell
message = upsell_gen.generate_upsell_message(context)
```

## 📊 Exemplo de Saída

### Orçamento (Português)
```
Olá Restaurante Grande Muralha,

Aqui está o orçamento solicitado:

• Salmão Fresco Noruega: 50kg × €14.50/kg = €725.00
• Atum Congelado Premium: 30kg × €16.00/kg = €480.00

Valor total: €1205.00

Produtos frescos e de alta qualidade.
Entrega rápida em Portugal.

Quer fazer o pedido?

Cumprimentos,
Maria Silva
```

### Orçamento (中文)
```
您好 长城大酒楼，

这是您要的报价：

• 挪威新鲜三文鱼: 50kg × €14.50/kg = €725.00
• 优质冷冻金枪鱼: 30kg × €16.00/kg = €480.00

总价：€1205.00

产品新鲜，质量高。
葡萄牙快速配送。

要下单吗？

祝好，
Maria Silva
```

### Versão WhatsApp (Otimizada)
```
Olá Restaurante Grande Muralha,
Orçamento:
• Salmão: 50kg × €14.50/kg = €725.00
• Atum: 30kg × €16.00/kg = €480.00
Total: €1205.00
Confirma o pedido?
Cumprimentos,
Maria Silva
```

## 🔐 Integração com Pricing Agent

### Verificar Margem Antes de Desconto

```python
from sales_agent_b2b.utils.pricing_integration import PricingIntegration

pricing = PricingIntegration()

# Verificar se pode oferecer desconto
is_safe, margin, recommendation = pricing.check_margin_safe(
    product_code="SAL-001",
    product_name="Salmão",
    cost=Decimal("11.00"),
    proposed_price=Decimal("14.50"),
    quantity=50.0,
    discount=Decimal("0.10"),  # 10%
    client_type="premium"
)

print(f"Margem: {margin * 100:.1f}%")
print(f"Seguro: {is_safe}")
print(f"Recomendação: {recommendation}")
```

### Sugerir Desconto Máximo Seguro

```python
max_discount = pricing.suggest_safe_discount(
    cost=Decimal("11.00"),
    base_price=Decimal("14.50"),
    client_type="premium"
)

print(f"Desconto máximo: {max_discount * 100:.0f}%")
```

### Negociar Preço

```python
can_accept, counter_price, justification = pricing.negotiate_price(
    cost=Decimal("11.00"),
    requested_price=Decimal("12.00"),  # Cliente pediu
    client_type="regular"
)

if can_accept:
    print(f"✓ Aceitar €{requested_price}")
else:
    print(f"✗ Contra-proposta: €{counter_price}")
    print(f"Justificação: {justification}")
```

## 📋 Regras de Follow-up

| Tipo de Cliente | Intervalo | Ação |
|----------------|-----------|------|
| **Novo** | 3 dias | Follow-up agressivo |
| **Regular** | 7 dias | Check-in normal |
| **Premium** | 5 dias | Atenção especial |
| **VIP** | 3 dias | Prioridade máxima |

**Cronograma Automático:**
- Novo: Dias 3, 7, 14, 30
- Regular: Dias 7, 14, 30, 60
- Premium: Dias 5, 10, 20, 45
- VIP: Dias 3, 7, 14, 21

## 🎁 Regras de Upsell

**Produtos Complementares:**
- Seafood → Arroz, Vegetais
- Meat → Vegetais, Molho
- Rice → Seafood, Molho

**Bundles Predefinidos:**
- Salmão → + Arroz Sushi + Vegetais
- Atum → + Arroz Sushi
- Camarão → + Vegetais + Molho

**Desconto de Bundle:**
- 2-3 produtos: €10
- 4-5 produtos: €20
- 6+ produtos: €30

## 🌍 Suporte a Idiomas

### Português (PT)
- Tom: Formal mas amigável
- Tratamento: "Olá [Nome]"
- Despedida: "Cumprimentos"

### Chinês (CN - 中文简体)
- Tom: Respeitoso e direto
- Tratamento: "您好 [名字]"
- Despedida: "祝好"

## 📱 Templates Disponíveis

### PT Templates
- `greeting_new` - Saudação cliente novo
- `greeting_regular` - Saudação cliente regular
- `quotation` - Orçamento
- `follow_up` - Acompanhamento
- `upsell` - Sugestão de venda
- `discount_offer` - Oferta especial
- `negotiation_accept` - Aceitar proposta
- `negotiation_counter` - Contra-proposta
- `thank_you` - Agradecimento

### CN Templates (中文)
Todos os templates acima com versão em chinês simplificado.

## 🧪 Executar Exemplos

```bash
# Script principal de demonstração
python3 -m sales_agent_b2b.main

# Exemplos básicos (6 cenários)
python3 -m sales_agent_b2b.examples.example_basic
```

## 🔄 Integração com Outros Agentes

### Fluxo Completo de Venda

```python
# 1. Sales Agent - Gerar orçamento
from sales_agent_b2b import MessageGenerator
message = generator.generate_quotation(context)

# 2. Pricing Agent - Verificar margem
from pricing_margin_agent import MarginAnalyzer
result = analyzer.analyze(proposal)

# 3. Order Validation Agent - Validar encomenda
from order_validation_agent import OrderValidator
validation = validator.validate(order, invoice)

# 4. Decisão final
if result.is_safe_to_proceed() and validation.validation_passed:
    print("✓ Aprovar venda")
    # Enviar thank you message
    thank_you = generator.generate_thank_you(context)
```

## 💡 Boas Práticas

### ✅ DO
- Sempre gerar ambas as versões (PT/CN) para clientes chineses
- Verificar margem antes de aprovar desconto
- Usar versão WhatsApp para mensagens rápidas
- Seguir cronograma de follow-up
- Sugerir upsell quando apropriado

### ❌ DON'T
- Não oferecer desconto sem verificar margem
- Não pressionar o cliente
- Não usar tom agressivo
- Não ignorar preferência de idioma
- Não fazer follow-up excessivo

## 📈 Benefícios

- ✅ Comunicação eficaz com restaurantes chineses
- ✅ Mensagens profissionais em 2 idiomas
- ✅ Aumento de vendas com upsell inteligente
- ✅ Proteção de margens
- ✅ Automatização de follow-ups
- ✅ Economia de tempo
- ✅ Consistência na comunicação

## 🎓 Casos de Uso

### 1. Resposta Rápida a Orçamento
Cliente solicita preço → Sistema gera orçamento bilíngue → Envio imediato

### 2. Reativação de Cliente Inativo
Cliente 30 dias sem comprar → Follow-up automático com oferta especial

### 3. Maximizar Ticket Médio
Cliente pede salmão → Sistema sugere arroz e vegetais → Bundle com desconto

### 4. Negociação Segura
Cliente pede desconto → Sistema verifica margem → Aprova ou contra-propõe

## 📞 Suporte

Para questões ou sugestões, contacte a equipa de desenvolvimento.

## 📝 Licença

Propriedade da empresa. Uso interno apenas.

---

**Sales Agent B2B** - Vendas inteligentes em Português e 中文 🌏🇵🇹🇨🇳
