"""
Modelos de dados para Pricing e Resultados
"""
from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
from typing import Optional, List
from .product import Product
from .client import Client


class MarginRisk(Enum):
    """Classificação de risco da margem"""
    EXCELENTE = "excelente"       # Margem acima do premium
    BOM = "bom"                   # Margem entre target e premium
    ACEITAVEL = "aceitável"       # Margem entre mínimo e target
    PERIGOSO = "perigoso"         # Margem abaixo do mínimo mas positiva
    CRITICO = "crítico"           # Margem negativa ou zero

    def __str__(self):
        return self.value

    def get_emoji(self) -> str:
        """Retorna emoji representativo do risco"""
        emojis = {
            self.EXCELENTE: "🟢",
            self.BOM: "🔵",
            self.ACEITAVEL: "🟡",
            self.PERIGOSO: "🟠",
            self.CRITICO: "🔴"
        }
        return emojis.get(self, "⚪")


@dataclass
class PricingProposal:
    """Proposta de preço para análise"""
    product: Product
    client: Client
    proposed_price: Decimal
    quantity: float
    discount_percentage: Decimal = Decimal("0.0")
    notes: str = ""

    @property
    def final_price(self) -> Decimal:
        """Calcula preço final após desconto"""
        discount_amount = self.proposed_price * self.discount_percentage
        return self.proposed_price - discount_amount

    @property
    def total_value(self) -> Decimal:
        """Calcula valor total da venda"""
        return self.final_price * Decimal(str(self.quantity))


@dataclass
class PriceRecommendation:
    """Recomendação de preço alternativo"""
    recommended_price: Decimal
    margin: Decimal
    margin_percentage: Decimal
    reason: str
    priority: int = 1  # 1 = mais recomendado, 2 = alternativa, etc.

    def __str__(self):
        return (f"€{self.recommended_price:.2f} "
                f"(Margem: {self.margin_percentage * 100:.1f}%) - {self.reason}")


@dataclass
class BundleRecommendation:
    """Recomendação de bundle/pacote"""
    products: List[str]  # Lista de product_codes
    description: str
    total_value: Decimal
    discount_offered: Decimal
    margin_improvement: Decimal
    reason: str

    def __str__(self):
        return (f"Bundle: {self.description}\n"
                f"  Valor: €{self.total_value:.2f} "
                f"(Desconto: {self.discount_offered * 100:.1f}%)\n"
                f"  Melhoria de margem: {self.margin_improvement * 100:.1f}%\n"
                f"  {self.reason}")


@dataclass
class PricingResult:
    """Resultado completo da análise de pricing"""
    proposal: PricingProposal

    # Cálculos de margem
    cost_per_unit: Decimal = Decimal("0.0")
    revenue_per_unit: Decimal = Decimal("0.0")
    margin_per_unit: Decimal = Decimal("0.0")
    margin_percentage: Decimal = Decimal("0.0")
    total_margin: Decimal = Decimal("0.0")

    # Classificação
    risk_level: MarginRisk = MarginRisk.ACEITAVEL

    # Recomendações
    recommendation: str = ""
    justification: str = ""
    price_recommendations: List[PriceRecommendation] = field(default_factory=list)
    bundle_recommendations: List[BundleRecommendation] = field(default_factory=list)

    # Alertas
    warnings: List[str] = field(default_factory=list)

    def add_warning(self, warning: str):
        """Adiciona alerta ao resultado"""
        self.warnings.append(warning)

    def add_price_recommendation(self, recommendation: PriceRecommendation):
        """Adiciona recomendação de preço"""
        self.price_recommendations.append(recommendation)
        # Ordena por prioridade
        self.price_recommendations.sort(key=lambda x: x.priority)

    def add_bundle_recommendation(self, bundle: BundleRecommendation):
        """Adiciona recomendação de bundle"""
        self.bundle_recommendations.append(bundle)

    def is_safe_to_proceed(self) -> bool:
        """Verifica se é seguro prosseguir com a venda"""
        return self.risk_level not in [MarginRisk.PERIGOSO, MarginRisk.CRITICO]

    def get_summary(self) -> str:
        """Retorna resumo rápido da análise"""
        emoji = self.risk_level.get_emoji()
        return (f"{emoji} Margem {self.risk_level.value.upper()}: "
                f"{self.margin_percentage * 100:.1f}% "
                f"(€{self.margin_per_unit:.2f}/un) | "
                f"Total: €{self.total_margin:.2f}")

    def __str__(self):
        """Formatação completa do resultado"""
        lines = []
        lines.append("=" * 70)
        lines.append("ANÁLISE DE PRICING & MARGEM")
        lines.append(f"Produto: {self.proposal.product.name}")
        lines.append(f"Cliente: {self.proposal.client.name} ({self.proposal.client.client_type.value})")
        lines.append("=" * 70)
        lines.append("")

        # Resumo
        lines.append(f"RESUMO: {self.get_summary()}")
        lines.append("")

        # Detalhes de cálculo
        lines.append("CÁLCULOS:")
        lines.append("-" * 70)
        lines.append(f"Quantidade: {self.proposal.quantity} {self.proposal.product.unit}")
        lines.append(f"Preço proposto: €{self.proposal.proposed_price:.2f}/{self.proposal.product.unit}")
        if self.proposal.discount_percentage > 0:
            lines.append(f"Desconto: {self.proposal.discount_percentage * 100:.1f}%")
            lines.append(f"Preço final: €{self.proposal.final_price:.2f}/{self.proposal.product.unit}")
        lines.append(f"Custo unitário: €{self.cost_per_unit:.2f}/{self.proposal.product.unit}")
        lines.append(f"Margem unitária: €{self.margin_per_unit:.2f} ({self.margin_percentage * 100:.1f}%)")
        lines.append(f"Margem total: €{self.total_margin:.2f}")
        lines.append(f"Valor total da venda: €{self.proposal.total_value:.2f}")
        lines.append("")

        # Classificação de risco
        emoji = self.risk_level.get_emoji()
        lines.append(f"CLASSIFICAÇÃO: {emoji} {self.risk_level.value.upper()}")
        lines.append("")

        # Alertas
        if self.warnings:
            lines.append("⚠️  ALERTAS:")
            for warning in self.warnings:
                lines.append(f"  • {warning}")
            lines.append("")

        # Recomendação principal
        lines.append("RECOMENDAÇÃO:")
        lines.append(self.recommendation)
        lines.append("")
        lines.append("JUSTIFICAÇÃO:")
        lines.append(self.justification)
        lines.append("")

        # Recomendações de preço alternativo
        if self.price_recommendations:
            lines.append("PREÇOS ALTERNATIVOS SUGERIDOS:")
            lines.append("-" * 70)
            for i, rec in enumerate(self.price_recommendations, 1):
                lines.append(f"{i}. {rec}")
            lines.append("")

        # Recomendações de bundle
        if self.bundle_recommendations:
            lines.append("OPORTUNIDADES DE BUNDLE:")
            lines.append("-" * 70)
            for i, bundle in enumerate(self.bundle_recommendations, 1):
                lines.append(f"{i}. {bundle}")
                lines.append("")

        lines.append("=" * 70)

        # Decisão final
        if self.is_safe_to_proceed():
            lines.append("✓ DECISÃO: Pode prosseguir com cautela")
        else:
            lines.append("✗ DECISÃO: NÃO RECOMENDADO - Revisar pricing!")
        lines.append("=" * 70)

        return "\n".join(lines)
