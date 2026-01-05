"""
Gerador de follow-ups automáticos
"""
from datetime import datetime, timedelta
from typing import List, Dict
from ..models.sales_context import SalesContext, SalesScenario
from ..models.message import MessageType, BilingualMessage
from .message_generator import MessageGenerator


class FollowUpGenerator:
    """
    Gera follow-ups automáticos baseados em regras
    """

    def __init__(self, sales_person_name: str = "Equipa de Vendas"):
        self.message_generator = MessageGenerator(sales_person_name)

    def should_follow_up(self, days_since_contact: int, client_type: str) -> bool:
        """
        Determina se deve fazer follow-up baseado em dias e tipo de cliente

        Args:
            days_since_contact: Dias desde último contacto
            client_type: Tipo de cliente (new, regular, premium, vip)

        Returns:
            True se deve fazer follow-up
        """
        # Regras de follow-up
        rules = {
            "new": 3,        # Follow-up após 3 dias para novos
            "regular": 7,    # Follow-up após 7 dias para regulares
            "premium": 5,    # Follow-up após 5 dias para premium
            "vip": 3         # Follow-up após 3 dias para VIP
        }

        threshold = rules.get(client_type, 7)
        return days_since_contact >= threshold

    def generate_follow_up(self, context: SalesContext) -> BilingualMessage:
        """
        Gera mensagem de follow-up

        Args:
            context: Contexto de vendas

        Returns:
            BilingualMessage com follow-up
        """
        # Determina razão do follow-up
        reason = self._determine_follow_up_reason(context)

        # Adiciona oferta especial se apropriado
        special_offer = self._create_special_offer(context)

        custom_data = {
            "days": str(context.days_since_contact),
            "special_offer": special_offer
        }

        return self.message_generator.generate(
            context,
            MessageType.FOLLOW_UP,
            custom_data
        )

    def _determine_follow_up_reason(self, context: SalesContext) -> str:
        """Determina a razão do follow-up"""

        if context.days_since_contact > 30:
            return "long_absence"
        elif context.days_since_contact > 14:
            return "regular_check"
        else:
            return "friendly_reminder"

    def _create_special_offer(self, context: SalesContext) -> str:
        """Cria oferta especial para follow-up"""

        if context.days_since_contact > 30:
            # Cliente inativo - oferta agressiva
            if context.preferred_language == "cn":
                return "特别优惠：5%折扣！"
            else:
                return "Oferta especial: 5% desconto!"

        elif context.days_since_contact > 14:
            # Cliente regular - lembrete gentil
            if context.preferred_language == "cn":
                return "新产品到货。"
            else:
                return "Novos produtos disponíveis."

        return ""

    def generate_follow_up_schedule(self,
                                   client_type: str,
                                   start_date: datetime = None) -> List[Dict]:
        """
        Gera cronograma de follow-ups

        Args:
            client_type: Tipo de cliente
            start_date: Data inicial (default: hoje)

        Returns:
            Lista de follow-ups agendados
        """
        if start_date is None:
            start_date = datetime.now()

        # Cronograma por tipo de cliente
        schedules = {
            "new": [3, 7, 14, 30],        # Dias para follow-up
            "regular": [7, 14, 30, 60],
            "premium": [5, 10, 20, 45],
            "vip": [3, 7, 14, 21]
        }

        days_list = schedules.get(client_type, [7, 14, 30])

        follow_ups = []
        for days in days_list:
            follow_up_date = start_date + timedelta(days=days)
            follow_ups.append({
                "days_after": days,
                "date": follow_up_date,
                "reason": self._get_schedule_reason(days)
            })

        return follow_ups

    def _get_schedule_reason(self, days: int) -> str:
        """Retorna razão do follow-up baseado em dias"""
        if days <= 3:
            return "quick_check"
        elif days <= 7:
            return "first_follow_up"
        elif days <= 14:
            return "regular_check"
        elif days <= 30:
            return "monthly_check"
        else:
            return "reactivation"
