"""
Gerador de mensagens bilíngues
"""
from decimal import Decimal
from typing import Optional, Dict, Any
from ..models.message import Message, MessageType, Language, BilingualMessage
from ..models.sales_context import SalesContext
from ..templates.message_templates import get_template


class MessageGenerator:
    """
    Gerador principal de mensagens de vendas
    Cria mensagens bilíngues (PT/CN) adaptadas ao contexto
    """

    def __init__(self, sales_person_name: str = "Equipa de Vendas"):
        """
        Args:
            sales_person_name: Nome da pessoa de vendas
        """
        self.sales_person_name = sales_person_name

    def generate(self, context: SalesContext,
                message_type: MessageType,
                custom_data: Optional[Dict[str, Any]] = None) -> BilingualMessage:
        """
        Gera mensagem bilíngue baseada no contexto

        Args:
            context: Contexto de vendas
            message_type: Tipo de mensagem a gerar
            custom_data: Dados customizados adicionais

        Returns:
            BilingualMessage com versões PT e CN
        """
        # Gera versão PT
        pt_message = self._generate_single(context, message_type, Language.PT, custom_data)

        # Gera versão CN
        cn_message = self._generate_single(context, message_type, Language.CN, custom_data)

        return BilingualMessage(
            pt_message=pt_message,
            cn_message=cn_message,
            message_type=message_type
        )

    def _generate_single(self, context: SalesContext,
                        message_type: MessageType,
                        language: Language,
                        custom_data: Optional[Dict[str, Any]] = None) -> Message:
        """Gera uma única versão de mensagem"""

        # Prepara dados para template
        template_data = self._prepare_template_data(context, custom_data)

        # Determina template name
        template_name = self._get_template_name(message_type, context)

        # Obtém templates
        full_template = get_template(template_name, language.value, "full")
        short_template = get_template(template_name, language.value, "short")

        # Formata mensagens
        subject = full_template["subject"].format(**template_data)
        full_version = full_template["body"].format(**template_data)
        short_version = short_template["body"].format(**template_data)

        # Cria versão WhatsApp (mais concisa)
        whatsapp_version = self._create_whatsapp_version(short_version)

        return Message(
            message_type=message_type,
            language=language,
            subject=subject,
            full_version=full_version,
            short_version=short_version,
            whatsapp_version=whatsapp_version,
            tone="formal_friendly",
            urgency=context.urgency,
            has_pricing=(len(context.products) > 0),
            has_products=(len(context.products) > 0),
            has_call_to_action=True
        )

    def _prepare_template_data(self, context: SalesContext,
                              custom_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Prepara dados para preencher template"""

        data = {
            "client_name": context.client_name_cn or context.client_name,
            "sales_person": self.sales_person_name,
            "total_value": f"{context.total_value:.2f}",
            "days": str(context.days_since_contact),
            "products": context.get_product_summary()
        }

        # Adiciona lista de produtos formatada
        if context.products:
            product_list = self._format_product_list(context.products, context.preferred_language)
            data["product_list"] = product_list

        # Adiciona info de desconto
        if context.discount_approved and context.discount_approved > 0:
            discount_info = f"Desconto: {context.discount_approved * 100:.0f}%"
            if context.preferred_language == "cn":
                discount_info = f"折扣: {context.discount_approved * 100:.0f}%"
            data["discount_info"] = discount_info
        else:
            data["discount_info"] = ""

        # Adiciona upsell products
        if context.upsell_products:
            upsell_list = self._format_product_list(context.upsell_products, context.preferred_language)
            data["upsell_products"] = upsell_list

        # Adiciona current products
        if context.products:
            current = context.products[0].product_name
            if context.preferred_language == "cn":
                current = context.products[0].product_name_cn or current
            data["current_products"] = current

        # Bundle benefit
        if context.bundle_opportunity:
            if context.preferred_language == "cn":
                data["bundle_benefit"] = "套餐优惠：省€10"
            else:
                data["bundle_benefit"] = "Pacote: poupa €10"
        else:
            data["bundle_benefit"] = ""

        # Special offer
        data["special_offer"] = ""

        # Merge custom data
        if custom_data:
            data.update(custom_data)

        return data

    def _format_product_list(self, products, language: str = "pt") -> str:
        """Formata lista de produtos"""
        lines = []
        for p in products:
            name = p.product_name_cn if language == "cn" else p.product_name
            price_str = f"€{p.unit_price:.2f}/{p.unit}"

            if p.discount_percentage > 0:
                discount_str = f" (-{p.discount_percentage * 100:.0f}%)"
            else:
                discount_str = ""

            line = f"• {name}: {p.quantity}{p.unit} × {price_str}{discount_str} = €{p.final_price:.2f}"
            lines.append(line)

        return "\n".join(lines)

    def _get_template_name(self, message_type: MessageType, context: SalesContext) -> str:
        """Determina qual template usar baseado no tipo e contexto"""

        # Mapeamento direto para a maioria dos casos
        type_to_template = {
            MessageType.QUOTATION: "quotation",
            MessageType.FOLLOW_UP: "follow_up",
            MessageType.UPSELL: "upsell",
            MessageType.DISCOUNT_OFFER: "discount_offer",
            MessageType.THANK_YOU: "thank_you",
            MessageType.NEGOTIATION: "negotiation_accept",
            MessageType.ORDER_CONFIRMATION: "thank_you"
        }

        # Greeting depende se é novo ou regular
        if message_type == MessageType.GREETING:
            if context.client_type == "new":
                return "greeting_new"
            else:
                return "greeting_regular"

        return type_to_template.get(message_type, "greeting_regular")

    def _create_whatsapp_version(self, short_version: str) -> str:
        """
        Cria versão otimizada para WhatsApp
        Remove linhas extras, mantém só o essencial
        """
        lines = short_version.strip().split("\n")

        # Remove linhas vazias
        lines = [line for line in lines if line.strip()]

        # Mantém máximo de 8 linhas
        if len(lines) > 8:
            lines = lines[:8]

        return "\n".join(lines)

    def generate_greeting(self, context: SalesContext) -> BilingualMessage:
        """Atalho para gerar saudação"""
        return self.generate(context, MessageType.GREETING)

    def generate_quotation(self, context: SalesContext) -> BilingualMessage:
        """Atalho para gerar orçamento"""
        return self.generate(context, MessageType.QUOTATION)

    def generate_thank_you(self, context: SalesContext,
                          delivery_date: str = "2-3 dias") -> BilingualMessage:
        """Atalho para gerar agradecimento"""
        return self.generate(context, MessageType.THANK_YOU, {"delivery_date": delivery_date})
