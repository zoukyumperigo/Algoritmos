"""
Sales Agent B2B - Frozen Seafood, Meat & Sushi Rice
Sistema de vendas e comunicação para restaurantes chineses em Portugal
"""

__version__ = "1.0.0"
__author__ = "Sales Team"

from .models.message import Message, MessageType, Language
from .models.sales_context import SalesContext, SalesScenario
from .generators.message_generator import MessageGenerator
from .generators.follow_up_generator import FollowUpGenerator
from .generators.upsell_generator import UpsellGenerator

__all__ = [
    'Message',
    'MessageType',
    'Language',
    'SalesContext',
    'SalesScenario',
    'MessageGenerator',
    'FollowUpGenerator',
    'UpsellGenerator'
]
