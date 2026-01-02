"""
Modelo de dados para Fatura (SAGE)
"""
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime


@dataclass
class InvoiceItem:
    """Item individual da fatura"""
    product_name: str
    quantity: int
    unit_price: float = 0.0
    total_price: float = 0.0
    normalized_name: str = ""

    def __post_init__(self):
        if not self.normalized_name:
            from ..services.normalization_service import NormalizationService
            self.normalized_name = NormalizationService.normalize(self.product_name)


@dataclass
class Invoice:
    """Fatura completa do SAGE"""
    distributor: str
    customer: str
    items: List[InvoiceItem] = field(default_factory=list)

    # Informações adicionais da fatura
    invoice_number: str = ""
    invoice_date: Optional[datetime] = None
    total_amount: float = 0.0
    tax_amount: float = 0.0

    # Metadados
    source_file: str = ""  # Caminho do ficheiro original
    source_format: str = ""  # excel, csv, pdf
    imported_at: datetime = field(default_factory=datetime.now)

    # Campos normalizados
    normalized_distributor: str = ""
    normalized_customer: str = ""

    def __post_init__(self):
        from ..services.normalization_service import NormalizationService
        if not self.normalized_distributor:
            self.normalized_distributor = NormalizationService.normalize(self.distributor)
        if not self.normalized_customer:
            self.normalized_customer = NormalizationService.normalize(self.customer)

    @property
    def total_items(self) -> int:
        """Total de itens na fatura"""
        return sum(item.quantity for item in self.items)

    @property
    def unique_products(self) -> int:
        """Número de produtos únicos"""
        return len(self.items)

    def get_item_by_name(self, product_name: str) -> InvoiceItem:
        """Buscar item por nome (exato ou normalizado)"""
        from ..services.normalization_service import NormalizationService
        normalized = NormalizationService.normalize(product_name)

        for item in self.items:
            if item.normalized_name == normalized:
                return item
        return None

    def __str__(self):
        lines = [
            f"Fatura Nº: {self.invoice_number or 'N/A'}",
            f"Distribuidor: {self.distributor}",
            f"Cliente: {self.customer}",
            f"Produtos ({len(self.items)}):"
        ]
        for item in self.items:
            lines.append(f"  {item.quantity} {item.product_name}")
        if self.total_amount > 0:
            lines.append(f"Total: €{self.total_amount:.2f}")
        return "\n".join(lines)
