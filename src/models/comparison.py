"""
Modelo de dados para resultado de comparação
"""
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class DivergenceType(Enum):
    """Tipos de divergências possíveis"""
    CUSTOMER_MISMATCH = "CLIENTE_DIFERENTE"
    DISTRIBUTOR_MISMATCH = "DISTRIBUIDOR_DIFERENTE"
    PRODUCT_MISSING = "PRODUTO_EM_FALTA"
    PRODUCT_EXTRA = "PRODUTO_NAO_PEDIDO"
    QUANTITY_MISMATCH = "QUANTIDADE_DIFERENTE"


class Severity(Enum):
    """Níveis de severidade"""
    CRITICAL = "CRITICO"  # Cliente/distribuidor errado
    ERROR = "ERRO"  # Produto em falta ou a mais
    WARNING = "AVISO"  # Quantidade diferente
    INFO = "INFO"  # Informação adicional


@dataclass
class Divergence:
    """Representa uma divergência encontrada"""
    divergence_type: DivergenceType
    severity: Severity
    description: str
    product_name: str = ""
    expected_value: any = None
    actual_value: any = None
    confidence: float = 1.0  # 0.0 a 1.0

    @property
    def severity_color(self) -> str:
        """Retorna cor associada à severidade"""
        colors = {
            Severity.CRITICAL: "#F44336",  # Vermelho
            Severity.ERROR: "#F44336",  # Vermelho
            Severity.WARNING: "#FFC107",  # Amarelo
            Severity.INFO: "#2196F3"  # Azul
        }
        return colors.get(self.severity, "#9E9E9E")

    @property
    def severity_icon(self) -> str:
        """Retorna ícone associado à severidade"""
        icons = {
            Severity.CRITICAL: "🔴",
            Severity.ERROR: "🔴",
            Severity.WARNING: "🟡",
            Severity.INFO: "🔵"
        }
        return icons.get(self.severity, "⚪")

    def __str__(self):
        if self.product_name:
            return (f"{self.severity_icon} {self.severity.value}: {self.description}\n"
                   f"  Produto: {self.product_name}\n"
                   f"  Esperado: {self.expected_value}\n"
                   f"  Obtido: {self.actual_value}")
        else:
            return f"{self.severity_icon} {self.severity.value}: {self.description}"


@dataclass
class ComparisonResult:
    """Resultado completo da comparação"""
    order_valid: bool = True
    divergences: List[Divergence] = field(default_factory=list)
    confidence_score: float = 100.0  # 0-100%
    compared_at: datetime = field(default_factory=datetime.now)
    operator_name: str = ""

    # Referências aos objetos comparados
    order_reference: Optional[object] = None
    invoice_reference: Optional[object] = None

    @property
    def status(self) -> str:
        """Status geral da comparação"""
        if not self.divergences:
            return "OK"
        elif any(d.severity == Severity.CRITICAL for d in self.divergences):
            return "ERRO_CRITICO"
        elif any(d.severity == Severity.ERROR for d in self.divergences):
            return "ERRO"
        elif any(d.severity == Severity.WARNING for d in self.divergences):
            return "AVISO"
        else:
            return "OK"

    @property
    def status_color(self) -> str:
        """Cor do status"""
        status_colors = {
            "OK": "#4CAF50",  # Verde
            "AVISO": "#FFC107",  # Amarelo
            "ERRO": "#F44336",  # Vermelho
            "ERRO_CRITICO": "#C62828"  # Vermelho escuro
        }
        return status_colors.get(self.status, "#9E9E9E")

    @property
    def critical_count(self) -> int:
        return sum(1 for d in self.divergences if d.severity == Severity.CRITICAL)

    @property
    def error_count(self) -> int:
        return sum(1 for d in self.divergences if d.severity == Severity.ERROR)

    @property
    def warning_count(self) -> int:
        return sum(1 for d in self.divergences if d.severity == Severity.WARNING)

    def add_divergence(self, divergence: Divergence):
        """Adiciona uma divergência e recalcula score"""
        self.divergences.append(divergence)
        self.order_valid = self.status in ["OK", "AVISO"]
        self._recalculate_confidence()

    def _recalculate_confidence(self):
        """Recalcula score de confiança baseado nas divergências"""
        if not self.divergences:
            self.confidence_score = 100.0
            return

        # Pesos por severidade
        weights = {
            Severity.CRITICAL: 50,  # Erro crítico reduz 50%
            Severity.ERROR: 15,  # Erro reduz 15%
            Severity.WARNING: 5,  # Aviso reduz 5%
            Severity.INFO: 1  # Info reduz 1%
        }

        penalty = sum(weights.get(d.severity, 0) for d in self.divergences)
        self.confidence_score = max(0.0, 100.0 - penalty)

    def get_summary(self) -> str:
        """Retorna resumo textual da comparação"""
        if not self.divergences:
            return "✅ Pedido e fatura estão 100% corretos"

        lines = [f"Status: {self.status} ({self.confidence_score:.0f}% de confiança)"]
        lines.append(f"Total de divergências: {len(self.divergences)}")

        if self.critical_count:
            lines.append(f"  🔴 Críticos: {self.critical_count}")
        if self.error_count:
            lines.append(f"  🔴 Erros: {self.error_count}")
        if self.warning_count:
            lines.append(f"  🟡 Avisos: {self.warning_count}")

        return "\n".join(lines)

    def __str__(self):
        lines = [self.get_summary(), ""]
        for i, div in enumerate(self.divergences, 1):
            lines.append(f"\nDivergência #{i}:")
            lines.append(str(div))
        return "\n".join(lines)
