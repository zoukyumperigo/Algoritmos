"""
Templates de mensagens bilíngues (PT/CN)
"""

# Templates em Português
PT_TEMPLATES = {
    "greeting_new": {
        "subject": "Bem-vindo à nossa empresa",
        "full": """Olá {client_name},

Obrigado pelo seu interesse nos nossos produtos.

Somos especialistas em frozen seafood, frozen meat e arroz para sushi de alta qualidade.

Trabalhamos com muitos restaurantes chineses em Portugal e teremos muito gosto em servir o seu restaurante.

Como posso ajudar hoje?

Cumprimentos,
{sales_person}""",
        "short": """Olá {client_name},

Obrigado pelo interesse!

Somos especialistas em seafood, meat e arroz para sushi.

Como posso ajudar?

Cumprimentos,
{sales_person}"""
    },

    "greeting_regular": {
        "subject": "Olá novamente",
        "full": """Olá {client_name},

Espero que esteja tudo bem!

Sempre um prazer falar consigo.

Em que posso ajudar hoje?

Cumprimentos,
{sales_person}""",
        "short": """Olá {client_name}!

Como posso ajudar hoje?

Cumprimentos,
{sales_person}"""
    },

    "quotation": {
        "subject": "Orçamento - {products}",
        "full": """Olá {client_name},

Aqui está o orçamento solicitado:

{product_list}

Valor total: €{total_value}
{discount_info}

Produtos frescos e de alta qualidade.
Entrega rápida em Portugal.

Quer fazer o pedido?

Cumprimentos,
{sales_person}""",
        "short": """Olá {client_name},

Orçamento:
{product_list}

Total: €{total_value}
{discount_info}

Confirma o pedido?

Cumprimentos,
{sales_person}"""
    },

    "follow_up": {
        "subject": "A pensar em si",
        "full": """Olá {client_name},

Espero que esteja tudo bem!

Vi que não fazemos negócios há {days} dias.

Tem interesse em fazer um novo pedido?

{special_offer}

Estou à disposição.

Cumprimentos,
{sales_person}""",
        "short": """Olá {client_name}!

Há {days} dias sem contacto.

Precisa de algo?

Cumprimentos,
{sales_person}"""
    },

    "upsell": {
        "subject": "Sugestão especial para si",
        "full": """Olá {client_name},

Vi o seu pedido de {current_products}.

Posso sugerir também:
{upsell_products}

{bundle_benefit}

Quer adicionar ao pedido?

Cumprimentos,
{sales_person}""",
        "short": """Olá {client_name},

Sugestão: adicionar {upsell_products}?

{bundle_benefit}

Cumprimentos,
{sales_person}"""
    },

    "discount_offer": {
        "subject": "Oferta especial",
        "full": """Olá {client_name},

Tenho uma oferta especial para si:

{discount_description}

Esta oferta é válida até {expiry_date}.

Quer aproveitar?

Cumprimentos,
{sales_person}""",
        "short": """Olá {client_name}!

Oferta: {discount_description}

Válida até {expiry_date}.

Cumprimentos,
{sales_person}"""
    },

    "negotiation_accept": {
        "subject": "Acordo feito!",
        "full": """Olá {client_name},

Ótima notícia!

Posso confirmar o preço de €{final_price}.

{details}

Confirma o pedido?

Cumprimentos,
{sales_person}""",
        "short": """Olá {client_name}!

Confirmado: €{final_price}

Pode pedir?

Cumprimentos,
{sales_person}"""
    },

    "negotiation_counter": {
        "subject": "Contra-proposta",
        "full": """Olá {client_name},

Obrigado pela sua proposta.

Infelizmente, não posso fazer €{requested_price}.

Mas posso oferecer €{counter_price}.

{justification}

O que acha?

Cumprimentos,
{sales_person}""",
        "short": """Olá {client_name},

Não consigo €{requested_price}.

Posso fazer €{counter_price}.

Aceita?

Cumprimentos,
{sales_person}"""
    },

    "thank_you": {
        "subject": "Obrigado!",
        "full": """Olá {client_name},

Muito obrigado pelo seu pedido!

Vamos preparar tudo com muito cuidado.

Entrega prevista: {delivery_date}

Até breve!

Cumprimentos,
{sales_person}""",
        "short": """Olá {client_name}!

Obrigado pelo pedido!

Entrega: {delivery_date}

Cumprimentos,
{sales_person}"""
    }
}

# Templates em Chinês (Mandarim Simplificado)
CN_TEMPLATES = {
    "greeting_new": {
        "subject": "欢迎",
        "full": """您好 {client_name}，

感谢您对我们产品的关注。

我们专营高品质冷冻海鲜、冷冻肉类和寿司米。

我们为葡萄牙许多中餐厅提供服务，很高兴为您的餐厅服务。

今天需要什么帮助？

祝好，
{sales_person}""",
        "short": """您好 {client_name}，

感谢关注！

我们专营海鲜、肉类和寿司米。

需要什么？

祝好，
{sales_person}"""
    },

    "greeting_regular": {
        "subject": "您好",
        "full": """您好 {client_name}，

希望一切都好！

很高兴再次联系。

今天需要什么？

祝好，
{sales_person}""",
        "short": """您好 {client_name}！

今天需要什么？

祝好，
{sales_person}"""
    },

    "quotation": {
        "subject": "报价 - {products}",
        "full": """您好 {client_name}，

这是您要的报价：

{product_list}

总价：€{total_value}
{discount_info}

产品新鲜，质量高。
葡萄牙快速配送。

要下单吗？

祝好，
{sales_person}""",
        "short": """您好 {client_name}，

报价：
{product_list}

总价：€{total_value}
{discount_info}

确认订单？

祝好，
{sales_person}"""
    },

    "follow_up": {
        "subject": "想念您",
        "full": """您好 {client_name}，

希望一切都好！

已经{days}天没联系了。

需要新订单吗？

{special_offer}

随时联系我。

祝好，
{sales_person}""",
        "short": """您好 {client_name}！

{days}天没联系了。

需要什么吗？

祝好，
{sales_person}"""
    },

    "upsell": {
        "subject": "特别推荐",
        "full": """您好 {client_name}，

看到您订了{current_products}。

我还建议：
{upsell_products}

{bundle_benefit}

要加到订单吗？

祝好，
{sales_person}""",
        "short": """您好 {client_name}，

建议：加{upsell_products}？

{bundle_benefit}

祝好，
{sales_person}"""
    },

    "discount_offer": {
        "subject": "特别优惠",
        "full": """您好 {client_name}，

我有特别优惠：

{discount_description}

有效期至{expiry_date}。

要吗？

祝好，
{sales_person}""",
        "short": """您好 {client_name}！

优惠：{discount_description}

有效至{expiry_date}。

祝好，
{sales_person}"""
    },

    "negotiation_accept": {
        "subject": "成交！",
        "full": """您好 {client_name}，

好消息！

我可以确认价格€{final_price}。

{details}

确认订单？

祝好，
{sales_person}""",
        "short": """您好 {client_name}！

确认：€{final_price}

可以订吗？

祝好，
{sales_person}"""
    },

    "negotiation_counter": {
        "subject": "反提案",
        "full": """您好 {client_name}，

谢谢您的提议。

不好意思，不能做€{requested_price}。

但可以€{counter_price}。

{justification}

怎么样？

祝好，
{sales_person}""",
        "short": """您好 {client_name}，

不能€{requested_price}。

可以€{counter_price}。

接受吗？

祝好，
{sales_person}"""
    },

    "thank_you": {
        "subject": "谢谢！",
        "full": """您好 {client_name}，

非常感谢您的订单！

我们会仔细准备。

预计送达：{delivery_date}

再见！

祝好，
{sales_person}""",
        "short": """您好 {client_name}！

谢谢订单！

送达：{delivery_date}

祝好，
{sales_person}"""
    }
}


def get_template(template_name: str, language: str = "pt", version: str = "full") -> dict:
    """
    Obtém template de mensagem

    Args:
        template_name: Nome do template
        language: "pt" ou "cn"
        version: "full" ou "short"

    Returns:
        Dict com subject e corpo da mensagem
    """
    templates = PT_TEMPLATES if language == "pt" else CN_TEMPLATES

    if template_name not in templates:
        raise ValueError(f"Template '{template_name}' não encontrado")

    template = templates[template_name]

    return {
        "subject": template["subject"],
        "body": template.get(version, template["full"])
    }
