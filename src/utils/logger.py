"""
Sistema de logging
"""
import logging
import sys
from pathlib import Path
from datetime import datetime


class Logger:
    """Wrapper para logging"""

    _instance = None
    _logger = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._logger is None:
            self._setup_logger()

    def _setup_logger(self):
        """Configura o logger"""
        from .config import Config

        Config.ensure_directories()

        # Nome do ficheiro de log
        log_file = Config.LOGS_DIR / f"app_{datetime.now().strftime('%Y%m%d')}.log"

        # Criar logger
        self._logger = logging.getLogger(Config.APP_NAME)
        self._logger.setLevel(logging.DEBUG)

        # Remover handlers existentes
        self._logger.handlers.clear()

        # Handler para ficheiro
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)

        # Handler para console
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)

        # Formato
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)

        self._logger.addHandler(file_handler)
        self._logger.addHandler(console_handler)

    def debug(self, message):
        self._logger.debug(message)

    def info(self, message):
        self._logger.info(message)

    def warning(self, message):
        self._logger.warning(message)

    def error(self, message):
        self._logger.error(message)

    def critical(self, message):
        self._logger.critical(message)


# Singleton instance
logger = Logger()
