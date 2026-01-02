"""
Entry point da aplicação Invoice Confirmation App
"""
import sys
from pathlib import Path

# Adicionar src ao path
sys.path.insert(0, str(Path(__file__).parent))

from PySide6.QtWidgets import QApplication
from PySide6.QtGui import QIcon
from gui.main_window import MainWindow
from utils.config import Config
from utils.logger import logger


def main():
    """Função principal"""
    try:
        # Garantir que diretórios existem
        Config.ensure_directories()

        logger.info("═" * 50)
        logger.info(f"{Config.APP_NAME} v{Config.VERSION}")
        logger.info("═" * 50)

        # Criar aplicação Qt
        app = QApplication(sys.argv)
        app.setApplicationName(Config.APP_NAME)
        app.setApplicationVersion(Config.VERSION)

        # Criar e mostrar janela principal
        window = MainWindow()
        window.show()

        logger.info("Interface gráfica iniciada")

        # Executar aplicação
        sys.exit(app.exec())

    except Exception as e:
        logger.critical(f"Erro fatal: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
