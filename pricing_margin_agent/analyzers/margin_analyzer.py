"""
Analisador de Margens e Gerador de Recomendações
"""
from decimal import Decimal
from typing import List
from ..models.pricing import (
    PricingProposal, PricingResult, MarginRisk,
    PriceRecommendation, BundleRecommendation
)
from ..calculators.pricing_calculator import PricingCalculator


class MarginAnalyzer:
    """
    Analisador principal de margens e pricing
    Classifica risco e gera recomendações
    """

    def __init__(self):
        self.calculator = PricingCalculator()

    def analyze(self, proposal: PricingProposal) -> PricingResult:
        """
        Analisa uma proposta de preço completa

        Args:
            proposal: Proposta de preço

        Returns:
            PricingResult com análise completa
        """
        result = PricingResult(proposal=proposal)

        # 1. Calcular métricas
        self._calculate_metrics(result)

        # 2. Classificar risco
        self._classify_risk(result)

        # 3. Gerar alertas
        self._generate_warnings(result)

        # 4. Gerar recomendação principal
        self._generate_main_recommendation(result)

        # 5. Gerar recomendações de preço alternativo
        self._generate_price_recommendations(result)

        # 6. Gerar recomendações de bundle (se aplicável)
        self._generate_bundle_recommendations(result)

        return result

    def _calculate_metrics(self, result: PricingResult):
        """Calcula todas as métricas financeiras"""
        proposal = result.proposal
        product = proposal.product

        # Custo por unidade
        result.cost_per_unit = product.cost.cost_per_unit(proposal.quantity)

        # Receita por unidade (com desconto)
        result.revenue_per_unit = proposal.final_price

        # Margem por unidade
        margin_abs, margin_pct = self.calculator.calculate_margin(
            result.cost_per_unit,
            result.revenue_per_unit
        )

        result.margin_per_unit = margin_abs
        result.margin_percentage = margin_pct

        # Margem total
        result.total_margin = margin_abs * Decimal(str(proposal.quantity))

    def _classify_risk(self, result: PricingResult):
        """Classifica o nível de risco da margem"""
        margin_pct = result.margin_percentage
        product = result.proposal.product

        if margin_pct < 0:
            # Margem negativa - CRÍTICO
            result.risk_level = MarginRisk.CRITICO
        elif margin_pct < product.minimum_margin:
            # Abaixo do mínimo - PERIGOSO
            result.risk_level = MarginRisk.PERIGOSO
        elif margin_pct < product.target_margin:
            # Entre mínimo e alvo - ACEITÁVEL
            result.risk_level = MarginRisk.ACEITAVEL
        elif margin_pct < product.premium_margin:
            # Entre alvo e premium - BOM
            result.risk_level = MarginRisk.BOM
        else:
            # Acima do premium - EXCELENTE
            result.risk_level = MarginRisk.EXCELENTE

    def _generate_warnings(self, result: PricingResult):
        """Gera alertas baseados na análise"""
        proposal = result.proposal
        product = proposal.product
        client = proposal.client

        # Alerta de margem crítica
        if result.risk_level == MarginRisk.CRITICO:
            result.add_warning(
                f"MARGEM NEGATIVA! Perda de €{abs(result.margin_per_unit):.2f} por unidade. "
                f"Perda total: €{abs(result.total_margin):.2f}"
            )

        # Alerta de margem perigosa
        elif result.risk_level == MarginRisk.PERIGOSO:
            result.add_warning(
                f"Margem abaixo do mínimo aceitável "
                f"({product.minimum_margin * 100:.1f}%). "
                f"Margem atual: {result.margin_percentage * 100:.1f}%"
            )

        # Alerta de quantidade mínima
        if proposal.quantity < product.minimum_quantity:
            result.add_warning(
                f"Quantidade abaixo do mínimo recomendado "
                f"({product.minimum_quantity} {product.unit})"
            )

        # Alerta de desconto excessivo
        max_discount = client.get_discount_eligibility()
        if proposal.discount_percentage > max_discount:
            result.add_warning(
                f"Desconto de {proposal.discount_percentage * 100:.1f}% "
                f"excede o máximo para este cliente "
                f"({max_discount * 100:.1f}%)"
            )

        # Alerta de cliente de baixo valor com margem baixa
        if not client.is_high_value() and result.risk_level in [MarginRisk.PERIGOSO, MarginRisk.ACEITAVEL]:
            result.add_warning(
                f"Cliente {client.client_type.value} com margem baixa. "
                f"Considere renegociar ou aumentar preço."
            )

    def _generate_main_recommendation(self, result: PricingResult):
        """Gera recomendação e justificação principal"""
        proposal = result.proposal
        product = proposal.product
        client = proposal.client
        risk = result.risk_level

        if risk == MarginRisk.CRITICO:
            result.recommendation = (
                "🔴 NÃO APROVAR - Margem negativa. "
                "Revisar custos ou aumentar preço imediatamente."
            )
            result.justification = (
                f"A venda resultará em prejuízo de €{abs(result.total_margin):.2f}. "
                f"O preço de €{proposal.final_price:.2f} está abaixo do custo de "
                f"€{result.cost_per_unit:.2f} por {product.unit}. "
                f"É necessário ajustar o preço para pelo menos "
                f"€{product.get_minimum_price(proposal.quantity):.2f} "
                f"para garantir a margem mínima."
            )

        elif risk == MarginRisk.PERIGOSO:
            result.recommendation = (
                "🟠 APROVAR COM RESSALVAS - Margem abaixo do mínimo. "
                "Considere aumentar preço ou renegociar."
            )
            result.justification = (
                f"A margem de {result.margin_percentage * 100:.1f}% está abaixo "
                f"do mínimo recomendado de {product.minimum_margin * 100:.1f}%. "
                f"Para cliente {client.client_type.value}, considere "
                f"{'renegociar frequência de compra' if client.purchase_frequency.value == 'occasional' else 'manter relacionamento'}. "
                f"Lucro total desta venda: apenas €{result.total_margin:.2f}."
            )

        elif risk == MarginRisk.ACEITAVEL:
            result.recommendation = (
                "🟡 APROVAR - Margem aceitável mas há espaço para melhoria."
            )
            result.justification = (
                f"Margem de {result.margin_percentage * 100:.1f}% está acima do mínimo "
                f"mas abaixo do alvo de {product.target_margin * 100:.1f}%. "
                f"{'Cliente premium - margem adequada para o relacionamento.' if client.is_high_value() else 'Considere melhorar margem em futuras negociações.'} "
                f"Lucro estimado: €{result.total_margin:.2f}."
            )

        elif risk == MarginRisk.BOM:
            result.recommendation = (
                "🔵 APROVAR - Boa margem, dentro do esperado."
            )
            result.justification = (
                f"Margem de {result.margin_percentage * 100:.1f}% está entre o alvo "
                f"({product.target_margin * 100:.1f}%) e premium "
                f"({product.premium_margin * 100:.1f}%). "
                f"Preço competitivo com boa rentabilidade. "
                f"Lucro esperado: €{result.total_margin:.2f}."
            )

        else:  # EXCELENTE
            result.recommendation = (
                "🟢 APROVAR - Excelente margem!"
            )
            result.justification = (
                f"Margem excepcional de {result.margin_percentage * 100:.1f}%, "
                f"acima do premium ({product.premium_margin * 100:.1f}%). "
                f"{'Aproveite para fortalecer relacionamento com cliente premium.' if client.is_high_value() else 'Ótima oportunidade de lucro.'} "
                f"Lucro total: €{result.total_margin:.2f}."
            )

    def _generate_price_recommendations(self, result: PricingResult):
        """Gera recomendações de preços alternativos"""
        proposal = result.proposal
        product = proposal.product
        current_price = proposal.final_price

        # Se margem está boa/excelente, não precisa recomendar alternativas
        if result.risk_level in [MarginRisk.BOM, MarginRisk.EXCELENTE]:
            return

        # Preço para margem mínima
        if result.risk_level == MarginRisk.CRITICO:
            min_price = product.get_minimum_price(proposal.quantity)
            margin_abs, margin_pct = self.calculator.calculate_margin(
                result.cost_per_unit, min_price
            )
            result.add_price_recommendation(PriceRecommendation(
                recommended_price=min_price,
                margin=margin_abs,
                margin_percentage=margin_pct,
                reason="Preço mínimo para cobrir custos e margem mínima",
                priority=1
            ))

        # Preço para margem alvo
        if result.risk_level in [MarginRisk.CRITICO, MarginRisk.PERIGOSO, MarginRisk.ACEITAVEL]:
            target_price = product.get_target_price(proposal.quantity)
            margin_abs, margin_pct = self.calculator.calculate_margin(
                result.cost_per_unit, target_price
            )
            priority = 1 if result.risk_level != MarginRisk.CRITICO else 2
            result.add_price_recommendation(PriceRecommendation(
                recommended_price=target_price,
                margin=margin_abs,
                margin_percentage=margin_pct,
                reason="Preço alvo recomendado para este produto",
                priority=priority
            ))

        # Preço premium (se cliente for high-value)
        if proposal.client.is_high_value() and result.risk_level == MarginRisk.ACEITAVEL:
            premium_price = product.get_premium_price(proposal.quantity)
            margin_abs, margin_pct = self.calculator.calculate_margin(
                result.cost_per_unit, premium_price
            )
            result.add_price_recommendation(PriceRecommendation(
                recommended_price=premium_price,
                margin=margin_abs,
                margin_percentage=margin_pct,
                reason="Preço premium - cliente de alto valor pode aceitar",
                priority=2
            ))

    def _generate_bundle_recommendations(self, result: PricingResult):
        """Gera recomendações de bundles para melhorar margem"""
        proposal = result.proposal
        product = proposal.product
        client = proposal.client

        # Só recomenda bundles se margem não estiver excelente
        if result.risk_level == MarginRisk.EXCELENTE:
            return

        # Bundle específico para categoria
        if product.category == "seafood":
            # Sugerir combo com arroz para sushi
            bundle = BundleRecommendation(
                products=[product.product_code, "ARZ-003"],
                description=f"{product.name} + Arroz Sushi Premium",
                total_value=proposal.total_value * Decimal("1.30"),
                discount_offered=Decimal("0.05"),
                margin_improvement=Decimal("0.08"),
                reason="Clientes de seafood geralmente compram arroz. Bundle aumenta ticket e melhora margem geral."
            )
            result.add_bundle_recommendation(bundle)

        # Se quantidade é alta, sugerir bundle com produto complementar
        if proposal.quantity >= 50:
            bundle = BundleRecommendation(
                products=[product.product_code, "COMPLEMENTAR"],
                description=f"{product.name} + Produto Complementar",
                total_value=proposal.total_value * Decimal("1.25"),
                discount_offered=Decimal("0.03"),
                margin_improvement=Decimal("0.06"),
                reason="Volume alto - oportunidade de cross-sell com margem melhorada."
            )
            result.add_bundle_recommendation(bundle)

    def quick_check(self, proposal: PricingProposal) -> str:
        """
        Verificação rápida retornando apenas status e recomendação

        Args:
            proposal: Proposta de preço

        Returns:
            String com resumo
        """
        result = self.analyze(proposal)
        return f"{result.get_summary()}\n{result.recommendation}"
