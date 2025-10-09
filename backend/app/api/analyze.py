from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from typing import Optional, Union, Dict
import json
import datetime
from ..models.analyzer import AIContentAnalyzer
import io
import docx
from pydantic import BaseModel

router = APIRouter()
analyzer = AIContentAnalyzer()

class AnalyzeTextRequest(BaseModel):
    content: str
    options: Optional[Dict] = None

# For file uploads
@router.post("/analyze/file")
async def analyze_file(
    file: UploadFile = File(...),
    options: Optional[str] = Form(None)
):
    try:
        file_content = await file.read()
        
        if file.content_type == 'text/plain':
            text_content = file_content.decode('utf-8')
        elif file.content_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            doc = docx.Document(io.BytesIO(file_content))
            text_content = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

        analysis_options = json.loads(options) if options else {}
        result = analyzer.analyze_text(text_content)
        
        return {
            "success": True,
            "data": {
                **result,
                "textLength": len(text_content),
                "createdAt": datetime.datetime.now().isoformat(),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# For direct text analysis
@router.post("/analyze")
async def analyze_text(request: AnalyzeTextRequest):
    try:
        if not request.content.strip():
            raise HTTPException(status_code=400, detail="Content cannot be empty")

        result = analyzer.analyze_text(request.content)
        
        return {
            "success": True,
            "data": {
                **result,
                "textLength": len(request.content),
                "createdAt": datetime.datetime.now().isoformat(),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))