"""
Pricing & Margin Agent - B2B Frozen Seafood, Meat & Sushi Rice
Sistema de análise de margens e recomendação de preços
"""

__version__ = "1.0.0"
__author__ = "Pricing & Margin Team"

from .models.product import Product, ProductCost
from .models.client import Client, ClientType, PurchaseFrequency
from .models.pricing import PricingProposal, PricingResult, MarginRisk
from .analyzers.margin_analyzer import MarginAnalyzer
from .calculators.pricing_calculator import PricingCalculator

__all__ = [
    'Product',
    'ProductCost',
    'Client',
    'ClientType',
    'PurchaseFrequency',
    'PricingProposal',
    'PricingResult',
    'MarginRisk',
    'MarginAnalyzer',
    'PricingCalculator'
]
