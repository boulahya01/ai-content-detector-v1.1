"""Document processing utilities for handling various file formats."""
from typing import Dict, List, Optional, BinaryIO, Union
import docx
from pdfplumber import PDF
import io
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Handles processing of various document formats."""
    
    SUPPORTED_FORMATS = {
        'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'pdf': ['application/pdf'],
        'txt': ['text/plain']
    }
    
    @staticmethod
    def is_supported_format(mime_type: str) -> bool:
        """Check if the file format is supported.
        
        Args:
            mime_type: MIME type of the file.
            
        Returns:
            bool: True if format is supported, False otherwise.
        """
        return any(mime_type in formats for formats in DocumentProcessor.SUPPORTED_FORMATS.values())

    @staticmethod
    def get_format_from_mime(mime_type: str) -> Optional[str]:
        """Get the format identifier from MIME type.
        
        Args:
            mime_type: MIME type of the file.
            
        Returns:
            str: Format identifier or None if not supported.
        """
        for format_id, mime_types in DocumentProcessor.SUPPORTED_FORMATS.items():
            if mime_type in mime_types:
                return format_id
        return None

    @staticmethod
    def extract_text_from_docx(file_content: Union[BinaryIO, bytes]) -> Dict[str, Union[str, List[Dict]]]:
        """Extract text and metadata from DOCX file.
        
        Args:
            file_content: File-like object or bytes containing the DOCX file.
            
        Returns:
            Dict containing extracted text and metadata.
        """
        try:
            if isinstance(file_content, bytes):
                file_content = io.BytesIO(file_content)
                
            doc = docx.Document(file_content)
            
            # Extract text from paragraphs
            paragraphs = []
            full_text = []
            
            for para in doc.paragraphs:
                if para.text.strip():
                    paragraphs.append({
                        "text": para.text,
                        "style": para.style.name,
                        "alignment": str(para.alignment),
                    })
                    full_text.append(para.text)
            
            # Get document properties
            core_properties = doc.core_properties
            metadata = {
                "author": str(core_properties.author) if core_properties.author else "Unknown",
                "created": str(core_properties.created) if core_properties.created else "Unknown",
                "modified": str(core_properties.modified) if core_properties.modified else "Unknown",
                "paragraphs": len(paragraphs),
                "words": len(" ".join(full_text).split())
            }
            
            return {
                "text": "\n\n".join(full_text),
                "metadata": metadata,
                "paragraphs": paragraphs
            }
            
        except Exception as e:
            logger.error(f"Error processing DOCX file: {str(e)}")
            raise ValueError(f"Failed to process DOCX file: {str(e)}")

    @staticmethod
    def extract_text_from_pdf(file_content: Union[BinaryIO, bytes]) -> Dict[str, Union[str, List[Dict]]]:
        """Extract text and metadata from PDF file.
        
        Args:
            file_content: File-like object or bytes containing the PDF file.
            
        Returns:
            Dict containing extracted text and metadata.
        """
        try:
            if isinstance(file_content, bytes):
                file_content = io.BytesIO(file_content)
                
            with pdfplumber.open(file_content) as pdf:
                pages = []
                full_text = []
                
                # Process each page
                for page_num, page in enumerate(pdf.pages, 1):
                    page_text = page.extract_text()
                    if page_text:
                        pages.append({
                            "page_number": page_num,
                            "text": page_text,
                            "width": page.width,
                            "height": page.height
                        })
                        full_text.append(page_text)
                
                # Extract metadata
                metadata = {
                    "pages": len(pdf.pages),
                    "words": len(" ".join(full_text).split()),
                    "pdf_info": pdf.metadata
                }
                
                return {
                    "text": "\n\n".join(full_text),
                    "metadata": metadata,
                    "pages": pages
                }
                
        except Exception as e:
            logger.error(f"Error processing PDF file: {str(e)}")
            raise ValueError(f"Failed to process PDF file: {str(e)}")

    @staticmethod
    def process_document(file_content: Union[BinaryIO, bytes], mime_type: str) -> Dict[str, Union[str, Dict]]:
        """Process document and extract text based on file type.
        
        Args:
            file_content: File content as bytes or file-like object.
            mime_type: MIME type of the file.
            
        Returns:
            Dict containing extracted text and metadata.
        """
        format_id = DocumentProcessor.get_format_from_mime(mime_type)
        
        if not format_id:
            raise ValueError(f"Unsupported file type: {mime_type}")
        
        if format_id == 'docx':
            return DocumentProcessor.extract_text_from_docx(file_content)
        elif format_id == 'pdf':
            return DocumentProcessor.extract_text_from_pdf(file_content)
        elif format_id == 'txt':
            if isinstance(file_content, bytes):
                text = file_content.decode('utf-8')
            else:
                text = file_content.read()
            return {
                "text": text,
                "metadata": {
                    "format": "txt",
                    "words": len(text.split())
                }
            }
        
        raise ValueError(f"Unsupported format: {format_id}")