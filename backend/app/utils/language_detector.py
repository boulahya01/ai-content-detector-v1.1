"""Language detection and handling utilities."""
from typing import Dict, List, Optional, Tuple
from langdetect import detect, detect_langs, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException
import logging
from collections import defaultdict
import re
import unicodedata

# Set seed for consistent language detection
DetectorFactory.seed = 0

logger = logging.getLogger(__name__)

class LanguageDetector:
    """Handles language detection and validation."""
    
    # Supported languages and their models
    SUPPORTED_LANGUAGES = {
        'en': 'roberta-base-openai-detector',
        'fr': 'roberta-base-openai-detector-french',
        'de': 'roberta-base-openai-detector-german',
        'es': 'roberta-base-openai-detector-spanish',
        # Add more languages as they become available
    }
    
    # Language-specific preprocessing rules
    LANGUAGE_RULES = {
        'en': {
            'min_length': 50,  # Minimum text length for reliable detection
            'ascii_threshold': 0.9,  # Minimum ratio of ASCII characters
        },
        'fr': {
            'min_length': 50,
            'ascii_threshold': 0.8,
        },
        'de': {
            'min_length': 50,
            'ascii_threshold': 0.8,
        },
        'es': {
            'min_length': 50,
            'ascii_threshold': 0.8,
        }
    }

    @staticmethod
    def detect_language(text: str) -> Tuple[str, float]:
        """Detect the language of the given text with confidence score.
        
        Args:
            text: Input text to analyze.
            
        Returns:
            Tuple of (language_code, confidence_score).
        """
        try:
            # Get language probabilities
            langs = detect_langs(text)
            if not langs:
                return ('unknown', 0.0)
            
            # Return most probable language and its confidence
            primary_lang = langs[0]
            return (primary_lang.lang, primary_lang.prob)
            
        except LangDetectException as e:
            logger.warning(f"Language detection failed: {str(e)}")
            return ('unknown', 0.0)

    @staticmethod
    def analyze_language_characteristics(text: str) -> Dict:
        """Analyze various characteristics of the text related to language.
        
        Args:
            text: Input text to analyze.
            
        Returns:
            Dictionary containing language analysis metrics.
        """
        # Count character types
        char_counts = defaultdict(int)
        total_chars = 0
        
        for char in text:
            total_chars += 1
            # Get character category
            category = unicodedata.category(char)
            char_counts[category] += 1
            
            # Count ASCII vs non-ASCII
            if ord(char) < 128:
                char_counts['ascii'] += 1
        
        # Calculate ratios
        ratios = {
            'ascii_ratio': char_counts['ascii'] / max(total_chars, 1),
            'letter_ratio': sum(char_counts[cat] for cat in ['Lu', 'Ll', 'Lt', 'Lm', 'Lo']) / max(total_chars, 1),
            'digit_ratio': sum(char_counts[cat] for cat in ['Nd', 'Nl', 'No']) / max(total_chars, 1),
            'punctuation_ratio': sum(char_counts[cat] for cat in ['Pc', 'Pd', 'Ps', 'Pe', 'Pi', 'Pf', 'Po']) / max(total_chars, 1),
        }
        
        return {
            'character_counts': dict(char_counts),
            'ratios': ratios,
            'total_characters': total_chars,
            'unique_characters': len(set(text))
        }

    @staticmethod
    def validate_language_support(lang_code: str, confidence: float) -> Tuple[bool, Optional[str]]:
        """Check if detected language is supported and meets confidence threshold.
        
        Args:
            lang_code: Detected language code.
            confidence: Detection confidence score.
            
        Returns:
            Tuple of (is_supported, model_name).
        """
        if lang_code in LanguageDetector.SUPPORTED_LANGUAGES and confidence > 0.8:
            return True, LanguageDetector.SUPPORTED_LANGUAGES[lang_code]
        return False, None

    @staticmethod
    def get_language_specific_metrics(text: str, lang_code: str) -> Dict:
        """Calculate language-specific metrics for the text.
        
        Args:
            text: Input text to analyze.
            lang_code: Language code of the text.
            
        Returns:
            Dictionary containing language-specific metrics.
        """
        metrics = {
            'length': len(text),
            'word_count': len(text.split()),
            'sentence_count': len(re.split(r'[.!?]+', text)),
        }
        
        # Add language-specific metrics
        if lang_code == 'en':
            metrics.update(LanguageDetector._get_english_metrics(text))
        elif lang_code == 'fr':
            metrics.update(LanguageDetector._get_french_metrics(text))
        elif lang_code == 'de':
            metrics.update(LanguageDetector._get_german_metrics(text))
        elif lang_code == 'es':
            metrics.update(LanguageDetector._get_spanish_metrics(text))
            
        return metrics

    @staticmethod
    def _get_english_metrics(text: str) -> Dict:
        """Calculate English-specific metrics."""
        words = text.lower().split()
        return {
            'avg_word_length': sum(len(w) for w in words) / max(len(words), 1),
            'contraction_count': len(re.findall(r"\w+'(?:s|t|ve|ll|re|d)\b", text)),
            'common_english_words': len([w for w in words if w in {'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that'}])
        }

    @staticmethod
    def _get_french_metrics(text: str) -> Dict:
        """Calculate French-specific metrics."""
        return {
            'accent_ratio': len(re.findall(r'[éèêëàâäôöûüçîïù]', text)) / max(len(text), 1),
            'french_articles': len(re.findall(r'\b(le|la|les|un|une|des)\b', text.lower()))
        }

    @staticmethod
    def _get_german_metrics(text: str) -> Dict:
        """Calculate German-specific metrics."""
        return {
            'compound_words': len([w for w in text.split() if len(w) > 20]),
            'umlauts': len(re.findall(r'[äöüß]', text))
        }

    @staticmethod
    def _get_spanish_metrics(text: str) -> Dict:
        """Calculate Spanish-specific metrics."""
        return {
            'inverted_punctuation': len(re.findall(r'[¡¿]', text)),
            'spanish_articles': len(re.findall(r'\b(el|la|los|las|un|una|unos|unas)\b', text.lower()))
        }