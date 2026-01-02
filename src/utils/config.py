"""
Configurações da aplicação
"""
import os
import json
from pathlib import Path


class Config:
    """Gestão de configurações da aplicação"""

    # Versão
    VERSION = "1.0.0"
    APP_NAME = "Invoice Confirmation App"

    # Pastas
    BASE_DIR = Path(__file__).parent.parent.parent
    CONFIG_DIR = BASE_DIR / "config"
    RESOURCES_DIR = BASE_DIR / "resources"
    LOGS_DIR = BASE_DIR / "logs"

    # Cores
    COLORS = {
        "SUCCESS": "#4CAF50",
        "WARNING": "#FFC107",
        "ERROR": "#F44336",
        "INFO": "#2196F3",
        "NEUTRAL": "#9E9E9E"
    }

    # Thresholds
    SIMILARITY_THRESHOLD = 0.85  # 85% similaridade para fuzzy match
    QUANTITY_DIFFERENCE_WARNING = 20  # Aviso se diferença > 20%
    QUANTITY_DIFFERENCE_ERROR = 50  # Erro se diferença > 50%

    # Formatos suportados
    WHATSAPP_FORMATS = ['.txt']
    INVOICE_FORMATS = ['.xlsx', '.xls', '.csv', '.pdf']

    @classmethod
    def ensure_directories(cls):
        """Cria diretórios necessários"""
        cls.CONFIG_DIR.mkdir(exist_ok=True)
        cls.LOGS_DIR.mkdir(exist_ok=True)

    @classmethod
    def load_user_config(cls) -> dict:
        """Carrega configurações do utilizador"""
        config_file = cls.CONFIG_DIR / "user_config.json"
        if config_file.exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    @classmethod
    def save_user_config(cls, config: dict):
        """Guarda configurações do utilizador"""
        cls.ensure_directories()
        config_file = cls.CONFIG_DIR / "user_config.json"
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
