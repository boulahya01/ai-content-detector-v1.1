"""Input validation and sanitization utilities."""
from typing import Dict, Any, Optional, Union
import re
from .exceptions import TextValidationError, ValidationError

class InputValidator:
    """Handles input validation and sanitization."""
    
    # Text validation constants
    MIN_TEXT_LENGTH = 50
    MAX_TEXT_LENGTH = 50000
    MIN_WORDS = 10
    MAX_WORDS = 10000
    
    # File validation constants
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    @staticmethod
    def validate_text(text: str) -> str:
        """Validate and sanitize text input.
        
        Args:
            text: Input text to validate.
            
        Returns:
            Sanitized text.
            
        Raises:
            TextValidationError: If text is invalid.
        """
        if not text or not isinstance(text, str):
            raise TextValidationError("Text cannot be empty", 0)
        
        # Remove null bytes and other control characters
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        text = text.strip()
        
        # Check length constraints
        if len(text) < InputValidator.MIN_TEXT_LENGTH:
            raise TextValidationError(
                f"Text too short (minimum {InputValidator.MIN_TEXT_LENGTH} characters)",
                len(text)
            )
        
        if len(text) > InputValidator.MAX_TEXT_LENGTH:
            raise TextValidationError(
                f"Text too long (maximum {InputValidator.MAX_TEXT_LENGTH} characters)",
                len(text)
            )
        
        # Check word count
        word_count = len(text.split())
        if word_count < InputValidator.MIN_WORDS:
            raise TextValidationError(
                f"Not enough words (minimum {InputValidator.MIN_WORDS} words)",
                word_count
            )
        
        if word_count > InputValidator.MAX_WORDS:
            raise TextValidationError(
                f"Too many words (maximum {InputValidator.MAX_WORDS} words)",
                word_count
            )
        
        return text

    @staticmethod
    def validate_file_size(size: int) -> None:
        """Validate file size.
        
        Args:
            size: File size in bytes.
            
        Raises:
            ValidationError: If file size is invalid.
        """
        if size > InputValidator.MAX_FILE_SIZE:
            raise ValidationError(
                f"File too large (maximum {InputValidator.MAX_FILE_SIZE/1024/1024:.1f}MB)",
                "file_size",
                size
            )

    @staticmethod
    def validate_options(options: Dict[str, Any]) -> Dict[str, Any]:
        """Validate analysis options.
        
        Args:
            options: Dictionary of analysis options.
            
        Returns:
            Validated options dictionary.
            
        Raises:
            ValidationError: If options are invalid.
        """
        valid_options = {}
        
        # Validate return_raw_scores
        if 'return_raw_scores' in options:
            if not isinstance(options['return_raw_scores'], bool):
                raise ValidationError(
                    "return_raw_scores must be a boolean",
                    "return_raw_scores",
                    options['return_raw_scores']
                )
            valid_options['return_raw_scores'] = options['return_raw_scores']
        
        # Validate language code
        if 'lang_code' in options:
            lang_code = options['lang_code']
            if not isinstance(lang_code, str) or not re.match(r'^[a-z]{2}(-[A-Z]{2})?$', lang_code):
                raise ValidationError(
                    "Invalid language code format",
                    "lang_code",
                    lang_code
                )
            valid_options['lang_code'] = lang_code
        
        return valid_options

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename to prevent path traversal.
        
        Args:
            filename: Original filename.
            
        Returns:
            Sanitized filename.
        """
        # Remove path separators and null bytes
        filename = re.sub(r'[/\\:\x00]', '', filename)
        # Limit length
        return filename[:255]