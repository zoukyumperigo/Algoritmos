"""
Modelos de dados para mensagens
"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class Language(Enum):
    """Idiomas suportados"""
    PT = "pt"  # Português
    CN = "cn"  # Chinês (Mandarim Simplificado)

    def __str__(self):
        return self.value


class MessageType(Enum):
    """Tipos de mensagem"""
    GREETING = "greeting"                    # Saudação inicial
    QUOTATION = "quotation"                  # Orçamento
    FOLLOW_UP = "follow_up"                  # Follow-up
    DISCOUNT_OFFER = "discount_offer"        # Oferta de desconto
    UPSELL = "upsell"                        # Sugestão de upsell
    ORDER_CONFIRMATION = "order_confirmation"  # Confirmação de pedido
    THANK_YOU = "thank_you"                  # Agradecimento
    NEGOTIATION = "negotiation"              # Negociação

    def __str__(self):
        return self.value


@dataclass
class Message:
    """Mensagem gerada pelo Sales Agent"""
    message_type: MessageType
    language: Language
    subject: str
    full_version: str          # Versão completa
    short_version: str         # Versão curta
    whatsapp_version: str      # Versão otimizada para WhatsApp

    tone: str = "formal_friendly"  # Tom da mensagem
    urgency: str = "normal"        # Urgência (low, normal, high)

    # Metadados
    has_pricing: bool = False
    has_products: bool = False
    has_call_to_action: bool = False

    def get_version(self, version: str = "full") -> str:
        """
        Retorna versão específica da mensagem

        Args:
            version: "full", "short", ou "whatsapp"

        Returns:
            Texto da mensagem
        """
        versions = {
            "full": self.full_version,
            "short": self.short_version,
            "whatsapp": self.whatsapp_version
        }
        return versions.get(version, self.full_version)

    def __str__(self):
        return self.full_version


@dataclass
class BilingualMessage:
    """Mensagem bilíngue (PT + CN)"""
    pt_message: Message
    cn_message: Message
    message_type: MessageType

    def get_message(self, language: Language, version: str = "full") -> str:
        """
        Retorna mensagem no idioma desejado

        Args:
            language: Language.PT ou Language.CN
            version: "full", "short", ou "whatsapp"

        Returns:
            Texto da mensagem
        """
        if language == Language.PT:
            return self.pt_message.get_version(version)
        else:
            return self.cn_message.get_version(version)

    def get_both_versions(self, version: str = "full") -> dict:
        """Retorna ambas as versões (PT e CN)"""
        return {
            "pt": self.pt_message.get_version(version),
            "cn": self.cn_message.get_version(version)
        }

    def __str__(self):
        return (f"=== PORTUGUÊS ===\n{self.pt_message.full_version}\n\n"
                f"=== 中文 ===\n{self.cn_message.full_version}")
