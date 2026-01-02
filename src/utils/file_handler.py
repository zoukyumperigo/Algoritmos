"""
Utilitários para manipulação de ficheiros
"""
import os
from pathlib import Path
from typing import Optional


class FileHandler:
    """Utilitários para ficheiros"""

    @staticmethod
    def get_file_extension(file_path: str) -> str:
        """Retorna extensão do ficheiro"""
        return Path(file_path).suffix.lower()

    @staticmethod
    def validate_file_exists(file_path: str) -> bool:
        """Verifica se ficheiro existe"""
        return os.path.exists(file_path) and os.path.isfile(file_path)

    @staticmethod
    def validate_whatsapp_file(file_path: str) -> tuple[bool, str]:
        """
        Valida ficheiro WhatsApp.

        Returns:
            (válido, mensagem_erro)
        """
        from .config import Config

        if not FileHandler.validate_file_exists(file_path):
            return (False, "Ficheiro não encontrado")

        ext = FileHandler.get_file_extension(file_path)
        if ext not in Config.WHATSAPP_FORMATS:
            return (False, f"Formato inválido. Esperado: {', '.join(Config.WHATSAPP_FORMATS)}")

        # Verificar se não está vazio
        if os.path.getsize(file_path) == 0:
            return (False, "Ficheiro vazio")

        return (True, "OK")

    @staticmethod
    def validate_invoice_file(file_path: str) -> tuple[bool, str]:
        """
        Valida ficheiro de fatura.

        Returns:
            (válido, mensagem_erro)
        """
        from .config import Config

        if not FileHandler.validate_file_exists(file_path):
            return (False, "Ficheiro não encontrado")

        ext = FileHandler.get_file_extension(file_path)
        if ext not in Config.INVOICE_FORMATS:
            return (False, f"Formato inválido. Esperado: {', '.join(Config.INVOICE_FORMATS)}")

        # Verificar se não está vazio
        if os.path.getsize(file_path) == 0:
            return (False, "Ficheiro vazio")

        return (True, "OK")

    @staticmethod
    def read_text_file(file_path: str) -> Optional[str]:
        """Lê ficheiro de texto"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except UnicodeDecodeError:
            # Tentar com outra codificação
            try:
                with open(file_path, 'r', encoding='latin-1') as f:
                    return f.read()
            except:
                return None
        except:
            return None
