"""Analyze API endpoints.

This module exposes:
 - GET /analyze/model-status
 - POST /analyze        (text)
 - POST /analyze/file   (file upload)

It uses existing project services: AIContentAnalyzer, DocumentProcessor,
InputValidator and ShobeisService. Errors are raised as the project's
custom exceptions so callers (and tests) can handle them consistently.
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
import asyncio
import json
import logging
import time

from app.models.analyzer import AIContentAnalyzer
from app.utils.document_processor import DocumentProcessor
from app.utils.exceptions import ValidationError, DocumentError, LanguageError, SystemError
from app.utils.validation import InputValidator
from app.utils.database import SessionLocal
from app.services.shobeis_service import ShobeisService, InsufficientShobeisError
from app.api.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)
validator = InputValidator()

# Create a single analyzer instance; model loading is performed lazily inside
# the analyzer implementation to avoid heavy work at import time.
analyzer = AIContentAnalyzer()
_model_lock = asyncio.Lock()


async def _ensure_model_ready(model_name: Optional[str] = None):
    """Ensure the model is loaded without blocking the event loop."""
    if getattr(analyzer, 'model_loaded', False):
        return
    async with _model_lock:
        if getattr(analyzer, 'model_loaded', False):
            return
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, analyzer._load_model, model_name)


@router.get("/analyze/model-status")
async def model_status():
    try:
        return {
            "model_loaded": getattr(analyzer, 'model_loaded', False),
            "model_name": getattr(analyzer, 'model_name', None),
            "device": str(getattr(analyzer, 'device', None)),
        }
    except Exception as e:
        logger.exception("Failed to get model status")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/analyze")
async def analyze_text(request: Request, current_user=Depends(get_current_user)):
    """Analyze plain text. Expects JSON {"content": "...", "is_test": false}
    Charges the user via ShobeisService unless is_test is true.
    """
    try:
        payload = await request.json()
    except Exception as e:
        raise ValidationError("Invalid JSON payload", "body", None)

    content = payload.get('content')
    is_test = bool(payload.get('is_test', False))

    if content is None:
        raise ValidationError("Content is required", "content", None)

    # Validate / sanitize
    text = validator.validate_text(content)

    # Ensure model is available (lazy load)
    try:
        await _ensure_model_ready()
    except Exception as e:
        logger.exception("Model load failure")
        raise SystemError("Model not ready", {"cause": str(e)})

    db = SessionLocal()
    try:
        sh = ShobeisService(db)
        if not is_test:
            try:
                sh.process_charge(user=current_user, action_type='word_analysis', quantity=len(text.split()))
            except InsufficientShobeisError as err:
                logger.warning("Insufficient balance for user %s: %s", getattr(current_user, 'id', None), err)
                return JSONResponse(status_code=402, content={"success": False, "error": "Insufficient balance (monthly, bonus, and main)"})

        start = time.time()
        result = analyzer.analyze_text(text)
        duration = time.time() - start

        if not isinstance(result, dict):
            logger.error("Analyzer returned unexpected value: %r", result)
            raise SystemError("Invalid analysis result")

        # Return analysis result plus lightweight metrics
        return {"success": True, "data": result, "metrics": {"inference_ms": round(duration * 1000, 2)}}

    finally:
        db.close()


@router.post("/analyze/file")
async def analyze_file(
    request: Request,
    file: UploadFile = File(...),
    options: Optional[str] = Form(None),
    current_user=Depends(get_current_user)
) -> Dict[str, Any]:
    """Analyze uploaded file. Validates file type and extracts text before analysis."""
    # Sanitize filename
    filename = validator.sanitize_filename(file.filename)

    # Validate content type via DocumentProcessor
    if not DocumentProcessor.is_supported_format(file.content_type):
        raise DocumentError("Unsupported file type", {"mime": file.content_type})

    content = await file.read()
    validator.validate_file_size(len(content))

    opts = {}
    if options:
        try:
            opts = json.loads(options)
        except Exception:
            raise ValidationError("Invalid options JSON", "options", None)

    try:
        await _ensure_model_ready()
    except Exception as e:
        logger.exception("Model load failure for file analysis")
        raise SystemError("Model not ready", {"cause": str(e)})

    # Extract text
    doc = DocumentProcessor().process_document_bytes(content, file.content_type)
    text = doc.get('text') or ''
    if not text.strip():
        raise DocumentError("No text extracted from document", {"file": filename})

    text = validator.validate_text(text)

    db = SessionLocal()
    try:
        sh = ShobeisService(db)
        try:
            sh.process_charge(user=current_user, action_type='word_analysis', quantity=len(text.split()))
        except InsufficientShobeisError:
            raise HTTPException(status_code=402, detail="Insufficient balance")

        start = time.time()
        analysis = analyzer.analyze_text(text, **validator.validate_options(opts) if opts else {})
        duration = time.time() - start

        if not isinstance(analysis, dict):
            logger.error("Analyzer returned unexpected value for file: %r", analysis)
            raise SystemError("Invalid analysis result")

        analysis["metrics"] = {"inference_ms": round(duration * 1000, 2)}
        analysis["documentInfo"] = {"fileName": filename, "fileType": file.content_type, "metadata": doc.get('metadata', {})}

        return {"success": True, "data": analysis}

    finally:
        db.close()
