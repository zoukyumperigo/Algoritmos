"""
Gerador de sugestões de upsell e cross-sell
"""
from decimal import Decimal
from typing import List, Dict
from ..models.sales_context import SalesContext, ProductOffer
from ..models.message import MessageType, BilingualMessage
from .message_generator import MessageGenerator


class UpsellGenerator:
    """
    Gera sugestões inteligentes de upsell e cross-sell
    """

    def __init__(self, sales_person_name: str = "Equipa de Vendas"):
        self.message_generator = MessageGenerator(sales_person_name)

        # Regras de complementaridade de produtos
        self.complement_rules = {
            "seafood": ["rice", "vegetables"],
            "meat": ["vegetables", "sauce"],
            "rice": ["seafood", "sauce"]
        }

        # Produtos frequentemente comprados juntos
        self.bundle_products = {
            "SAL-001": ["ARZ-003", "VEG-001"],  # Salmão + Arroz + Vegetais
            "ATM-002": ["ARZ-003"],              # Atum + Arroz
            "CAM-005": ["VEG-001", "SAU-001"]   # Camarão + Vegetais + Molho
        }

    def should_suggest_upsell(self, context: SalesContext) -> bool:
        """
        Determina se deve sugerir upsell

        Args:
            context: Contexto de vendas

        Returns:
            True se deve sugerir upsell
        """
        # Não sugere upsell se:
        # 1. Já tem muitos produtos (> 5)
        if len(context.products) > 5:
            return False

        # 2. Valor total muito baixo (< €50)
        if context.total_value < Decimal("50.0"):
            return False

        # 3. Margem já está no limite
        if not context.margin_safe:
            return False

        return True

    def generate_upsell_suggestions(self, context: SalesContext) -> List[ProductOffer]:
        """
        Gera sugestões de produtos para upsell

        Args:
            context: Contexto de vendas com produtos atuais

        Returns:
            Lista de ProductOffer sugeridos
        """
        suggestions = []

        # Analisa produtos atuais
        current_categories = set()
        current_codes = set()

        for product in context.products:
            # Extrai categoria do código (primeiras 3 letras)
            if len(product.product_code) >= 3:
                category = product.product_code[:3].lower()
                current_categories.add(category)
            current_codes.add(product.product_code)

        # Gera sugestões baseadas em regras
        for product in context.products:
            product_code = product.product_code

            # Verifica bundles predefinidos
            if product_code in self.bundle_products:
                for suggested_code in self.bundle_products[product_code]:
                    if suggested_code not in current_codes:
                        suggestion = self._create_product_suggestion(suggested_code)
                        if suggestion:
                            suggestions.append(suggestion)

        # Remove duplicatas
        unique_suggestions = []
        seen_codes = set()
        for sugg in suggestions:
            if sugg.product_code not in seen_codes:
                unique_suggestions.append(sugg)
                seen_codes.add(sugg.product_code)

        # Limita a 3 sugestões
        return unique_suggestions[:3]

    def _create_product_suggestion(self, product_code: str) -> ProductOffer:
        """Cria ProductOffer sugerido"""

        # Database de produtos (simplificado)
        products_db = {
            "ARZ-003": {
                "name": "Arroz Sushi Premium",
                "name_cn": "高级寿司米",
                "price": Decimal("8.00"),
                "quantity": 20.0,
                "unit": "kg"
            },
            "VEG-001": {
                "name": "Mix Vegetais Congelados",
                "name_cn": "冷冻蔬菜",
                "price": Decimal("5.00"),
                "quantity": 10.0,
                "unit": "kg"
            },
            "SAU-001": {
                "name": "Molho Soja Premium",
                "name_cn": "优质酱油",
                "price": Decimal("3.50"),
                "quantity": 5.0,
                "unit": "L"
            }
        }

        if product_code not in products_db:
            return None

        prod_data = products_db[product_code]

        return ProductOffer(
            product_code=product_code,
            product_name=prod_data["name"],
            product_name_cn=prod_data["name_cn"],
            quantity=prod_data["quantity"],
            unit=prod_data["unit"],
            unit_price=prod_data["price"],
            total_price=prod_data["price"] * Decimal(str(prod_data["quantity"]))
        )

    def generate_upsell_message(self, context: SalesContext) -> BilingualMessage:
        """
        Gera mensagem de upsell

        Args:
            context: Contexto com produtos atuais e sugeridos

        Returns:
            BilingualMessage com sugestão de upsell
        """
        # Gera sugestões se ainda não foram adicionadas
        if not context.upsell_products:
            suggestions = self.generate_upsell_suggestions(context)
            for sugg in suggestions:
                context.add_upsell(sugg)

        # Calcula benefício do bundle
        bundle_benefit = ""
        if len(context.upsell_products) >= 2:
            context.bundle_opportunity = True
            if context.preferred_language == "cn":
                bundle_benefit = "套餐优惠：省€10"
            else:
                bundle_benefit = "Pacote: poupa €10"

        custom_data = {
            "bundle_benefit": bundle_benefit
        }

        return self.message_generator.generate(
            context,
            MessageType.UPSELL,
            custom_data
        )

    def calculate_bundle_discount(self, products: List[ProductOffer]) -> Decimal:
        """
        Calcula desconto de bundle

        Args:
            products: Lista de produtos no bundle

        Returns:
            Valor do desconto
        """
        if len(products) < 2:
            return Decimal("0.0")

        # Regras de desconto
        # 2-3 produtos: €10
        # 4-5 produtos: €20
        # 6+ produtos: €30

        if len(products) <= 3:
            return Decimal("10.0")
        elif len(products) <= 5:
            return Decimal("20.0")
        else:
            return Decimal("30.0")
