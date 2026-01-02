"""
Serviço de normalização de texto
Responsável por normalizar nomes de produtos, clientes e distribuidores
"""
import re
import unicodedata
from typing import List, Tuple, Optional


class NormalizationService:
    """Serviço para normalização de strings e fuzzy matching"""

    @staticmethod
    def normalize(text: str) -> str:
        """
        Normaliza texto para comparação.

        Transformações aplicadas:
        - Remove acentos: "CAMARÃO" -> "CAMARAO"
        - Converte para maiúsculas: "Lula" -> "LULA"
        - Remove pontuação: "20/30" -> "20 30"
        - Remove espaços extra: "POTA  LIMPA" -> "POTA LIMPA"
        - Remove artigos comuns: "A LULA" -> "LULA"

        Args:
            text: Texto a normalizar

        Returns:
            Texto normalizado
        """
        if not text:
            return ""

        # Remover acentos
        text = ''.join(
            c for c in unicodedata.normalize('NFD', text)
            if unicodedata.category(c) != 'Mn'
        )

        # Converter para maiúsculas
        text = text.upper()

        # Remover pontuação (manter letras, números e espaços)
        text = re.sub(r'[^A-Z0-9\s]', ' ', text)

        # Remover artigos e palavras comuns no início
        text = re.sub(r'^\s*(O|A|OS|AS|UM|UMA|UNS|UMAS|LDA|SA)\s+', '', text)

        # Remover espaços extra
        text = ' '.join(text.split())

        return text.strip()

    @staticmethod
    def similarity(text1: str, text2: str) -> float:
        """
        Calcula similaridade entre dois textos usando Levenshtein distance.

        Args:
            text1: Primeiro texto
            text2: Segundo texto

        Returns:
            Score de similaridade entre 0.0 e 1.0
        """
        try:
            from Levenshtein import ratio
            return ratio(text1, text2)
        except ImportError:
            # Fallback: similaridade simples baseada em palavras em comum
            words1 = set(text1.split())
            words2 = set(text2.split())

            if not words1 or not words2:
                return 0.0

            common = words1.intersection(words2)
            total = words1.union(words2)

            return len(common) / len(total) if total else 0.0

    @staticmethod
    def find_similar(target: str, candidates: List[str], threshold: float = 0.85) -> Optional[Tuple[str, float]]:
        """
        Encontra o candidato mais similar ao texto alvo.

        Args:
            target: Texto a procurar
            candidates: Lista de candidatos
            threshold: Limiar mínimo de similaridade (0.0 a 1.0)

        Returns:
            Tupla (melhor_match, score) ou None se nenhum match acima do limiar
        """
        best_match = None
        best_score = 0.0

        for candidate in candidates:
            score = NormalizationService.similarity(target, candidate)
            if score > best_score and score >= threshold:
                best_score = score
                best_match = candidate

        return (best_match, best_score) if best_match else None

    @staticmethod
    def normalize_quantity_text(text: str) -> Tuple[int, str]:
        """
        Extrai quantidade e nome do produto de texto.

        Exemplos:
            "5 CAMARÃO 20/30" -> (5, "CAMARÃO 20/30")
            "2 kg POTA LIMPA" -> (2, "POTA LIMPA")

        Args:
            text: Texto com quantidade e produto

        Returns:
            Tupla (quantidade, nome_produto)
        """
        text = text.strip()

        # Regex para capturar número no início
        match = re.match(r'^(\d+(?:[.,]\d+)?)\s*(?:kg|kgs|kg\.?|un|und|unidade|unidades|x)?\s*(.+)$', text, re.IGNORECASE)

        if match:
            qty_str = match.group(1).replace(',', '.')
            quantity = int(float(qty_str))  # Converte para int
            product = match.group(2).strip()
            return (quantity, product)

        # Se não encontrou número, assume quantidade 1
        return (1, text)

    @staticmethod
    def is_valid_product_name(text: str, min_length: int = 2) -> bool:
        """
        Valida se o texto é um nome de produto válido.

        Args:
            text: Texto a validar
            min_length: Comprimento mínimo

        Returns:
            True se válido
        """
        if not text or len(text) < min_length:
            return False

        # Deve conter pelo menos uma letra
        if not re.search(r'[A-Za-z]', text):
            return False

        return True
