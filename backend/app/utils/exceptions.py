"""Custom exceptions for the AI content detector application."""
from typing import Optional, Any, Dict

class AIDetectorError(Exception):
    """Base exception class for AI content detector."""
    def __init__(self, message: str, code: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)

class ModelError(AIDetectorError):
    """Exceptions related to model operations."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "MODEL_ERROR", details)

class LoadModelError(ModelError):
    """Failed to load the model."""
    def __init__(self, model_name: str, reason: str):
        super().__init__(
            f"Failed to load model '{model_name}': {reason}",
            {"model_name": model_name, "reason": reason}
        )

class ModelNotFoundError(ModelError):
    """Model not found in cache or source."""
    def __init__(self, model_name: str):
        super().__init__(
            f"Model '{model_name}' not found",
            {"model_name": model_name}
        )

class ValidationError(AIDetectorError):
    """Input validation errors."""
    def __init__(self, message: str, field: str, value: Any):
        super().__init__(
            message,
            "VALIDATION_ERROR",
            {"field": field, "value": value}
        )

class TextValidationError(ValidationError):
    """Text input validation errors."""
    def __init__(self, reason: str, text_length: int):
        super().__init__(
            f"Invalid text input: {reason}",
            "text",
            {"reason": reason, "length": text_length}
        )

class DocumentError(AIDetectorError):
    """Document processing errors."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "DOCUMENT_ERROR", details)

class UnsupportedFormatError(DocumentError):
    """Unsupported document format."""
    def __init__(self, mime_type: str):
        super().__init__(
            f"Unsupported document format: {mime_type}",
            {"mime_type": mime_type}
        )

class DocumentProcessingError(DocumentError):
    """Error during document processing."""
    def __init__(self, format_type: str, reason: str):
        super().__init__(
            f"Failed to process {format_type} document: {reason}",
            {"format": format_type, "reason": reason}
        )

class LanguageError(AIDetectorError):
    """Language-related errors."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "LANGUAGE_ERROR", details)

class UnsupportedLanguageError(LanguageError):
    """Language not supported by the system."""
    def __init__(self, lang_code: str, confidence: float):
        super().__init__(
            f"Language '{lang_code}' not supported (confidence: {confidence:.2f})",
            {"language": lang_code, "confidence": confidence}
        )

class RateLimitError(AIDetectorError):
    """Rate limiting errors."""
    def __init__(self, limit: int, reset_time: int):
        super().__init__(
            f"Rate limit exceeded. Try again in {reset_time} seconds",
            "RATE_LIMIT_ERROR",
            {"limit": limit, "reset_in": reset_time}
        )

class SystemError(AIDetectorError):
    """System-level errors."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "SYSTEM_ERROR", details)

class ResourceExhaustedError(SystemError):
    """System resource exhaustion."""
    def __init__(self, resource: str, limit: Any):
        super().__init__(
            f"System resource exhausted: {resource}",
            {"resource": resource, "limit": limit}
        )