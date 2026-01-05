"""
Integração com Pricing & Margin Agent
Verifica margens antes de aprovar descontos ou ofertas
"""
import sys
import os
from decimal import Decimal
from typing import Tuple, Optional

# Adiciona path do Pricing Agent
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

try:
    from pricing_margin_agent.models.product import Product, ProductCost
    from pricing_margin_agent.models.client import Client, ClientType, PurchaseFrequency
    from pricing_margin_agent.models.pricing import PricingProposal, MarginRisk
    from pricing_margin_agent.analyzers.margin_analyzer import MarginAnalyzer
    PRICING_AGENT_AVAILABLE = True
except ImportError:
    PRICING_AGENT_AVAILABLE = False


class PricingIntegration:
    """
    Integra Sales Agent com Pricing & Margin Agent
    Garante que ofertas mantêm margens saudáveis
    """

    def __init__(self):
        if not PRICING_AGENT_AVAILABLE:
            print("⚠️  Pricing & Margin Agent não disponível. Funcionando sem verificação de margem.")
            self.analyzer = None
        else:
            self.analyzer = MarginAnalyzer()

    def check_margin_safe(self,
                         product_code: str,
                         product_name: str,
                         cost: Decimal,
                         proposed_price: Decimal,
                         quantity: float,
                         discount: Decimal = Decimal("0.0"),
                         client_type: str = "regular") -> Tuple[bool, Optional[Decimal], str]:
        """
        Verifica se margem é segura

        Args:
            product_code: Código do produto
            product_name: Nome do produto
            cost: Custo unitário
            proposed_price: Preço proposto
            quantity: Quantidade
            discount: Desconto percentual
            client_type: Tipo de cliente

        Returns:
            Tuple (is_safe, margin_percentage, recommendation)
        """
        if not PRICING_AGENT_AVAILABLE or not self.analyzer:
            # Sem Pricing Agent, faz verificação simples
            final_price = proposed_price * (Decimal("1.0") - discount)
            margin = (final_price - cost) / final_price if final_price > 0 else Decimal("0.0")

            is_safe = margin >= Decimal("0.15")  # 15% mínimo
            recommendation = "OK" if is_safe else "Margem muito baixa"

            return is_safe, margin, recommendation

        # Com Pricing Agent, faz análise completa
        try:
            # Cria produto
            product = Product(
                product_code=product_code,
                name=product_name,
                category="seafood",
                cost=ProductCost(purchase_cost=cost),
                minimum_margin=Decimal("0.15"),
                target_margin=Decimal("0.25")
            )

            # Cria cliente
            client_type_enum = ClientType.REGULAR
            if client_type == "premium":
                client_type_enum = ClientType.PREMIUM
            elif client_type == "vip":
                client_type_enum = ClientType.VIP

            client = Client(
                client_id="TEMP",
                name="Cliente",
                client_type=client_type_enum,
                purchase_frequency=PurchaseFrequency.WEEKLY
            )

            # Cria proposta
            proposal = PricingProposal(
                product=product,
                client=client,
                proposed_price=proposed_price,
                quantity=quantity,
                discount_percentage=discount
            )

            # Analisa
            result = self.analyzer.analyze(proposal)

            # Determina se é seguro
            is_safe = result.is_safe_to_proceed()
            margin_pct = result.margin_percentage
            recommendation = result.recommendation

            return is_safe, margin_pct, recommendation

        except Exception as e:
            # Em caso de erro, retorna conservador
            print(f"⚠️  Erro ao verificar margem: {e}")
            return False, None, "Erro na verificação"

    def suggest_safe_discount(self,
                            cost: Decimal,
                            base_price: Decimal,
                            client_type: str = "regular") -> Decimal:
        """
        Sugere desconto máximo seguro

        Args:
            cost: Custo unitário
            base_price: Preço base
            client_type: Tipo de cliente

        Returns:
            Desconto máximo recomendado
        """
        # Margem mínima por tipo de cliente
        minimum_margins = {
            "new": Decimal("0.20"),      # 20% para novos
            "regular": Decimal("0.18"),  # 18% para regulares
            "premium": Decimal("0.15"),  # 15% para premium
            "vip": Decimal("0.15")       # 15% para VIP
        }

        min_margin = minimum_margins.get(client_type, Decimal("0.18"))

        # Calcula preço mínimo
        min_price = cost / (Decimal("1.0") - min_margin)

        # Calcula desconto máximo
        if base_price > min_price:
            max_discount = (base_price - min_price) / base_price
            # Arredonda para baixo (conservador)
            max_discount = (max_discount * Decimal("100")).quantize(Decimal("1")) / Decimal("100")
            return max_discount
        else:
            return Decimal("0.0")

    def negotiate_price(self,
                       cost: Decimal,
                       requested_price: Decimal,
                       client_type: str = "regular") -> Tuple[bool, Decimal, str]:
        """
        Negocia preço mantendo margem segura

        Args:
            cost: Custo unitário
            requested_price: Preço solicitado pelo cliente
            client_type: Tipo de cliente

        Returns:
            Tuple (can_accept, counter_price, justification)
        """
        # Verifica se pode aceitar preço solicitado
        is_safe, margin, _ = self.check_margin_safe(
            "TEMP", "Produto", cost, requested_price, 1.0, Decimal("0.0"), client_type
        )

        if is_safe:
            # Pode aceitar
            return True, requested_price, "Preço aceito"

        # Não pode aceitar, faz contra-proposta
        # Calcula preço com margem target (25%)
        target_margin = Decimal("0.25")
        counter_price = cost / (Decimal("1.0") - target_margin)

        # Arredonda para cima
        counter_price = counter_price.quantize(Decimal("0.01"))

        justification = (
            f"O preço solicitado resulta em margem muito baixa. "
            f"Posso oferecer €{counter_price:.2f} para manter qualidade do serviço."
        )

        return False, counter_price, justification
