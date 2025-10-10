from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
from app.models.analyzer import AIContentAnalyzer
from app.utils.document_processor import DocumentProcessor
from app.utils.exceptions import (
    AIDetectorError, ValidationError, DocumentError,
    LanguageError, RateLimitError, SystemError
)
from app.utils.validation import InputValidator
from app.utils.rate_limiter import APIRateLimiter
from app.utils.monitoring import MetricsCollector, PerformanceMonitor
import json
import logging
import time
from functools import wraps
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)
rate_limiter = APIRateLimiter()
input_validator = InputValidator()

# Initialize monitoring
metrics_collector = MetricsCollector()
performance_monitor = PerformanceMonitor(metrics_collector)

# Initialize analyzer with delayed loading
analyzer = AIContentAnalyzer(model_name="roberta-base", use_cache=True, quantize=True)

# Initialize monitoring
metrics_collector = MetricsCollector()
performance_monitor = PerformanceMonitor(metrics_collector)

def error_handler(func):
    """Decorator for consistent error handling across endpoints."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request = next((arg for arg in args if isinstance(arg, Request)), None)
        start_time = time.time()
        
        try:
            # Rate limiting
            if request:
                client_ip = request.client.host
                rate_limiter.check_endpoint_limit(client_ip, func.__name__)
            
            # Execute endpoint
            result = await func(*args, **kwargs)
            
            # Add execution metrics
            if isinstance(result, dict):
                result['_metrics'] = {
                    'execution_time': round((time.time() - start_time) * 1000, 2)
                }
            
            return result
            
        except ValidationError as e:
            logger.warning(f"Validation error: {e.message}", extra={'details': e.details})
            return JSONResponse(
                status_code=400,
                content={"error": e.message, "code": e.code, "details": e.details}
            )
        except DocumentError as e:
            logger.error(f"Document error: {e.message}", extra={'details': e.details})
            return JSONResponse(
                status_code=400,
                content={"error": e.message, "code": e.code, "details": e.details}
            )
        except LanguageError as e:
            logger.warning(f"Language error: {e.message}", extra={'details': e.details})
            return JSONResponse(
                status_code=400,
                content={"error": e.message, "code": e.code, "details": e.details}
            )
        except RateLimitError as e:
            logger.warning(f"Rate limit exceeded: {e.message}", extra={'details': e.details})
            return JSONResponse(
                status_code=429,
                content={"error": e.message, "code": e.code, "details": e.details}
            )
        except SystemError as e:
            logger.error(f"System error: {e.message}", extra={'details': e.details})
            return JSONResponse(
                status_code=500,
                content={"error": e.message, "code": e.code, "details": e.details}
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={"error": "Internal server error", "code": "INTERNAL_ERROR"}
            )
    
    return wrapper

class AnalyzeRequest(BaseModel):
    content: str

@router.post("/analyze")
@error_handler
async def analyze_text(request: AnalyzeRequest):
    """Analyze plain text content.
    
    Args:
        request: FastAPI request object.
        content: Text content to analyze.
        
    Returns:
        Analysis results.
    """
    # Validate input
    validated_text = input_validator.validate_text(request.content)
    
    # Perform analysis with timing
    start_time = time.time()
    result = analyzer.analyze_text(validated_text)
    inference_time = time.time() - start_time

    # Record inference metrics
    performance_monitor.record_inference(
        duration=inference_time,
        model_name="roberta-base"
    )
    
    return {
        "success": True,
        "data": result,
        "metrics": {
            "inference_time": round(inference_time * 1000, 2)  # Convert to milliseconds
        }
    }

@router.post("/analyze/file")
@error_handler
async def analyze_file(
    request: Request,
    file: UploadFile = File(...),
    options: Optional[str] = Form(None)
) -> Dict[str, Any]:
    """Analyze content from various file formats.
    
    Args:
        request: FastAPI request object.
        file: Uploaded file.
        options: JSON string of analysis options.
        
    Returns:
        Analysis results with document information.
    """
    # Validate file name
    file.filename = input_validator.sanitize_filename(file.filename)
    
    # Validate file type
    if not DocumentProcessor.is_supported_format(file.content_type):
        raise DocumentError(
            f"Unsupported file type: {file.content_type}",
            {"supported_formats": list(DocumentProcessor.SUPPORTED_FORMATS.keys())}
        )
    
    # Read and validate file content
    content = await file.read()
    input_validator.validate_file_size(len(content))
    
    # Parse and validate options
    analysis_options = {}
    if options:
        try:
            options_dict = json.loads(options)
            analysis_options = input_validator.validate_options(options_dict)
        except json.JSONDecodeError as e:
            raise ValidationError("Invalid JSON in options", "options", str(e))
    
    # Process document
    doc_result = DocumentProcessor.process_document(content, file.content_type)
    
    # Validate extracted text
    text_content = doc_result["text"]
    if not text_content.strip():
        raise DocumentError(
            "No text content found in document",
            {"file_name": file.filename}
        )
    
    validated_text = input_validator.validate_text(text_content)
    
    # Perform analysis with timing
    start_time = time.time()
    analysis_result = analyzer.analyze_text(
        validated_text,
        **analysis_options
    )
    inference_time = time.time() - start_time

    # Record inference metrics
    performance_monitor.record_inference(
        duration=inference_time,
        model_name="roberta-base"
    )

    # Add metrics to result
    analysis_result["metrics"] = {
        "inference_time": round(inference_time * 1000, 2)  # Convert to milliseconds
    }
    
    # Combine results
    return {
        "success": True,
        "data": {
            **analysis_result,
            "documentInfo": {
                "fileType": file.content_type,
                "fileName": file.filename,
                "metadata": doc_result.get("metadata", {}),
            }
        }
    }