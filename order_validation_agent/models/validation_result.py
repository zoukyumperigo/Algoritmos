"""
Resultado da validação e classificação de erros
"""
from dataclasses import dataclass, field
from enum import Enum
from typing import List
from decimal import Decimal


class ErrorLevel(Enum):
    """Níveis de criticidade dos erros"""
    BAIXO = "baixo"
    MEDIO = "médio"
    CRITICO = "crítico"

    def __str__(self):
        return self.value


class ErrorType(Enum):
    """Tipos de erro possíveis"""
    QUANTITY_MISMATCH = "quantity_mismatch"
    PRODUCT_MISSING = "product_missing"
    PRODUCT_EXTRA = "product_extra"
    PRICE_ANOMALY = "price_anomaly"
    CLIENT_MISMATCH = "client_mismatch"

    def __str__(self):
        descriptions = {
            self.QUANTITY_MISMATCH: "Divergência de quantidade",
            self.PRODUCT_MISSING: "Produto faltando na fatura",
            self.PRODUCT_EXTRA: "Produto extra na fatura",
            self.PRICE_ANOMALY: "Preço anômalo",
            self.CLIENT_MISMATCH: "Cliente não corresponde"
        }
        return descriptions.get(self, self.value)


@dataclass
class ValidationError:
    """Erro individual detectado na validação"""
    error_type: ErrorType
    level: ErrorLevel
    product_code: str
    product_name: str
    description: str
    expected_value: str = ""
    actual_value: str = ""
    financial_impact: Decimal = Decimal("0.0")

    def __str__(self):
        impact_str = f" (Impacto: €{self.financial_impact})" if self.financial_impact else ""
        return (f"[{self.level.value.upper()}] {self.error_type} - "
                f"{self.product_name} ({self.product_code})\n"
                f"  {self.description}{impact_str}")


@dataclass
class ValidationResult:
    """Resultado completo da validação"""
    order_id: str
    invoice_number: str
    client_name: str
    errors: List[ValidationError] = field(default_factory=list)
    total_financial_impact: Decimal = Decimal("0.0")
    validation_passed: bool = True

    def add_error(self, error: ValidationError):
        """Adiciona erro ao resultado"""
        self.errors.append(error)
        self.total_financial_impact += error.financial_impact
        self.validation_passed = False

    def get_errors_by_level(self, level: ErrorLevel) -> List[ValidationError]:
        """Retorna erros filtrados por nível"""
        return [err for err in self.errors if err.level == level]

    def get_critical_errors(self) -> List[ValidationError]:
        """Retorna apenas erros críticos"""
        return self.get_errors_by_level(ErrorLevel.CRITICO)

    def get_medium_errors(self) -> List[ValidationError]:
        """Retorna apenas erros médios"""
        return self.get_errors_by_level(ErrorLevel.MEDIO)

    def get_low_errors(self) -> List[ValidationError]:
        """Retorna apenas erros baixos"""
        return self.get_errors_by_level(ErrorLevel.BAIXO)

    def has_critical_errors(self) -> bool:
        """Verifica se há erros críticos"""
        return len(self.get_critical_errors()) > 0

    def get_recommended_action(self) -> str:
        """Retorna ação recomendada baseada nos erros"""
        if not self.errors:
            return "✓ Nenhuma ação necessária - encomenda e fatura estão corretas"

        critical = len(self.get_critical_errors())
        medium = len(self.get_medium_errors())
        low = len(self.get_low_errors())

        if critical > 0:
            return (f"⚠ AÇÃO URGENTE: Corrigir {critical} erro(s) crítico(s) antes de enviar. "
                    f"Impacto financeiro: €{self.total_financial_impact}")
        elif medium > 0:
            return (f"⚡ Revisar {medium} erro(s) médio(s). "
                    f"Recomenda-se correção. Impacto: €{self.total_financial_impact}")
        else:
            return (f"ℹ Verificar {low} erro(s) menor(es). "
                    f"Pode prosseguir com cautela. Impacto: €{self.total_financial_impact}")

    def get_summary(self) -> str:
        """Retorna resumo rápido da validação"""
        if self.validation_passed:
            return f"✓ Validação OK - Encomenda {self.order_id} / Fatura {self.invoice_number}"

        critical = len(self.get_critical_errors())
        medium = len(self.get_medium_errors())
        low = len(self.get_low_errors())
        total = len(self.errors)

        return (f"✗ {total} erro(s) detectado(s) - "
                f"Crítico: {critical}, Médio: {medium}, Baixo: {low} | "
                f"Impacto: €{self.total_financial_impact}")

    def __str__(self):
        """Formatação completa do resultado"""
        lines = []
        lines.append("=" * 70)
        lines.append(f"RELATÓRIO DE VALIDAÇÃO - {self.client_name}")
        lines.append(f"Encomenda: {self.order_id} | Fatura: {self.invoice_number}")
        lines.append("=" * 70)
        lines.append("")
        lines.append(f"RESUMO: {self.get_summary()}")
        lines.append("")

        if self.errors:
            lines.append("ERROS DETECTADOS:")
            lines.append("-" * 70)
            for i, error in enumerate(self.errors, 1):
                lines.append(f"{i}. {error}")
                lines.append("")

            lines.append("-" * 70)
            lines.append(f"IMPACTO FINANCEIRO TOTAL: €{self.total_financial_impact}")
            lines.append("")
            lines.append("AÇÃO RECOMENDADA:")
            lines.append(self.get_recommended_action())
        else:
            lines.append("✓ Nenhum erro detectado. Encomenda e fatura correspondem perfeitamente.")

        lines.append("=" * 70)
        return "\n".join(lines)
