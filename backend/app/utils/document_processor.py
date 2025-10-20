"""Document processing utilities for handling various file formats."""
from typing import Dict, List, Optional, BinaryIO, Union, Tuple
import docx
import pdfplumber
import io
import logging
import magic
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class DocumentValidationError(Exception):
    """Base exception for document validation errors."""
    pass

class FileSizeError(DocumentValidationError):
    """Raised when file size exceeds the limit."""
    pass

class FileTypeError(DocumentValidationError):
    """Raised when file type is not supported."""
    pass

class DocumentProcessor:
    def process_document_bytes(self, file_content: bytes, mime_type: str) -> Dict[str, Union[str, Dict]]:
        """Process document from bytes and mime type (for API uploads)."""
        format_id = self.get_format_from_mime(mime_type)
        if format_id == 'docx':
            return DocumentProcessor.extract_text_from_docx(file_content)
        elif format_id == 'pdf':
            return DocumentProcessor.extract_text_from_pdf(file_content)
        elif format_id == 'txt':
            text = file_content.decode('utf-8')
            return {
                "text": text,
                "metadata": {
                    "format": "txt",
                    "words": len(text.split())
                }
            }
        raise ValueError(f"Unsupported format: {format_id}")
    """Handles processing of various document formats."""
    
    SUPPORTED_FORMATS = {
        'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'pdf': ['application/pdf'],
        'txt': ['text/plain', 'text/x-python', 'text/html']  # Include common text variants
    }

    # File size limits (in bytes)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    def __init__(self):
        """Initialize the DocumentProcessor with magic MIME type detector."""
        self.mime = magic.Magic(mime=True)
    
    def validate_file(self, file_path: Union[str, Path]) -> Tuple[str, str]:
        """Validate file type and size.
        
        Args:
            file_path: Path to the file.
            
        Returns:
            Tuple[str, str]: MIME type and format identifier.
            
        Raises:
            FileNotFoundError: If file doesn't exist.
            FileSizeError: If file is too large.
            FileTypeError: If file type is not supported.
        """
        file_path = Path(file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
            
        # Check file size
        size = file_path.stat().st_size
        if size > self.MAX_FILE_SIZE:
            raise FileSizeError(f"File size ({size} bytes) exceeds maximum limit of {self.MAX_FILE_SIZE} bytes")
            
        # Get and validate MIME type
        try:
            mime_type = self.mime.from_file(str(file_path))
            logger.debug(f"Detected MIME type: {mime_type} for file: {file_path}")
        except Exception as e:
            logger.error(f"Error detecting MIME type: {str(e)}")
            raise FileTypeError(f"Could not detect file type: {str(e)}")
            
        # Check if MIME type is in supported formats
        supported = False
        for format_types in self.SUPPORTED_FORMATS.values():
            if mime_type in format_types:
                supported = True
                break
                
        if not supported:
            raise FileTypeError(f"Unsupported file type: {mime_type}")
            
        format_id = self.get_format_from_mime(mime_type)
        return mime_type, format_id
    
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
    def extract_text_from_docx(file_content: Union[BinaryIO, bytes], chunk_size: int = 1000) -> Dict[str, Union[str, List[Dict]]]:
        """Extract text and metadata from DOCX file with memory-efficient processing.
        
        Args:
            file_content: File-like object or bytes containing the DOCX file.
            chunk_size: Number of paragraphs to process at once for memory efficiency.
            
        Returns:
            Dict containing extracted text and metadata.
        """
        try:
            if isinstance(file_content, bytes):
                file_content = io.BytesIO(file_content)
                
            doc = docx.Document(file_content)
            
            # Initialize containers
            paragraphs = []
            full_text = []
            total_words = 0
            current_chunk = []
            
            # Process paragraphs in chunks for memory efficiency
            for para in doc.paragraphs:
                if para.text.strip():
                    # Create paragraph info with safe attribute access
                    para_info = {
                        "text": para.text,
                        "style": para.style.name if para.style else "Normal",
                        "alignment": str(para.alignment) if para.alignment else "LEFT",
                        "font_size": (para.style.font.size if para.style and para.style.font else None),
                        "is_bold": bool(para.style and para.style.font and para.style.font.bold),
                        "is_italic": bool(para.style and para.style.font and para.style.font.italic),
                    }
                    
                    current_chunk.append(para_info)
                    total_words += len(para.text.split())
                    
                    # Process chunk if it reaches the chunk size
                    if len(current_chunk) >= chunk_size:
                        paragraphs.extend(current_chunk)
                        full_text.extend(p["text"] for p in current_chunk)
                        current_chunk = []
            
            # Process remaining paragraphs
            if current_chunk:
                paragraphs.extend(current_chunk)
                full_text.extend(p["text"] for p in current_chunk)
            
            # Extract extended metadata
            core_properties = doc.core_properties
            sections = doc.sections
            metadata = {
                "document_info": {
                    "author": str(core_properties.author) if core_properties.author else "Unknown",
                    "created": str(core_properties.created) if core_properties.created else "Unknown",
                    "modified": str(core_properties.modified) if core_properties.modified else "Unknown",
                    "title": str(core_properties.title) if core_properties.title else "Unknown",
                    "subject": str(core_properties.subject) if core_properties.subject else "Unknown",
                    "keywords": str(core_properties.keywords) if core_properties.keywords else "Unknown",
                    "category": str(core_properties.category) if core_properties.category else "Unknown",
                    "comments": str(core_properties.comments) if core_properties.comments else "Unknown",
                },
                "statistics": {
                    "paragraphs": len(paragraphs),
                    "words": total_words,
                    "sections": len(sections),
                    "has_headers": any(s.header.is_linked_to_previous for s in sections),
                    "has_footers": any(s.footer.is_linked_to_previous for s in sections),
                },
                "formatting": {
                    "page_height": str(sections[0].page_height) if sections else "Unknown",
                    "page_width": str(sections[0].page_width) if sections else "Unknown",
                    "orientation": "portrait" if sections and sections[0].page_width < sections[0].page_height else "landscape",
                }
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
    def extract_text_from_pdf(file_content: Union[BinaryIO, bytes], chunk_size: int = 5) -> Dict[str, Union[str, List[Dict]]]:
        """Extract text and metadata from PDF file with memory-efficient processing.
        
        Args:
            file_content: File-like object or bytes containing the PDF file.
            chunk_size: Number of pages to process at once for memory efficiency.
            
        Returns:
            Dict containing extracted text and metadata.
        """
        try:
            if isinstance(file_content, bytes):
                file_content = io.BytesIO(file_content)

            with pdfplumber.open(file_content) as pdf:
                pages = []
                full_text = []
                total_words = 0
                total_chars = 0
                total_tables = 0
                total_images = 0
                total_fonts = set()

                for page_num, page in enumerate(pdf.pages, start=1):
                    # Extract text
                    page_text = ""
                    try:
                        extracted = page.extract_text()
                        if extracted:
                            page_text = str(extracted)
                    except Exception as e:
                        logger.warning(f"Error extracting text from page {page_num}: {e}")

                    # Extract tables
                    page_tables = 0
                    try:
                        tables = page.extract_tables()
                        if tables:
                            page_tables = len(tables)
                    except Exception as e:
                        logger.warning(f"Error extracting tables from page {page_num}: {e}")

                    # Extract images
                    page_images = 0
                    try:
                        images = getattr(page, 'images', None)
                        page_images = len(images) if images else 0
                    except Exception as e:
                        logger.warning(f"Error extracting images from page {page_num}: {e}")

                    # Fonts (best-effort)
                    try:
                        if hasattr(page, '_page_fonts') and page._page_fonts:
                            total_fonts.update(f.get('name') for f in page._page_fonts if isinstance(f, dict) and 'name' in f)
                    except Exception:
                        pass

                    # Metrics
                    total_tables += page_tables
                    total_images += page_images
                    total_chars += len(page_text)
                    words = len(page_text.split()) if page_text else 0
                    total_words += words

                    page_info = {
                        "page_number": page_num,
                        "text": page_text,
                        "width": getattr(page, 'width', None),
                        "height": getattr(page, 'height', None),
                        "tables": page_tables,
                        "images": page_images,
                        "words": words,
                        "characters": len(page_text)
                    }

                    pages.append(page_info)
                    full_text.append(page_text)

                metadata = {
                    "document_info": {
                        "producer": getattr(pdf.metadata, 'get', lambda k, d: d)('Producer', 'Unknown') if pdf.metadata else 'Unknown',
                        "creator": getattr(pdf.metadata, 'get', lambda k, d: d)('Creator', 'Unknown') if pdf.metadata else 'Unknown',
                        "creation_date": getattr(pdf.metadata, 'get', lambda k, d: d)('CreationDate', 'Unknown') if pdf.metadata else 'Unknown',
                        "modification_date": getattr(pdf.metadata, 'get', lambda k, d: d)('ModDate', 'Unknown') if pdf.metadata else 'Unknown',
                        "author": getattr(pdf.metadata, 'get', lambda k, d: d)('Author', 'Unknown') if pdf.metadata else 'Unknown',
                        "title": getattr(pdf.metadata, 'get', lambda k, d: d)('Title', 'Unknown') if pdf.metadata else 'Unknown',
                        "subject": getattr(pdf.metadata, 'get', lambda k, d: d)('Subject', 'Unknown') if pdf.metadata else 'Unknown',
                        "keywords": getattr(pdf.metadata, 'get', lambda k, d: d)('Keywords', 'Unknown') if pdf.metadata else 'Unknown',
                    },
                    "statistics": {
                        "pages": len(pdf.pages),
                        "words": total_words,
                        "characters": total_chars,
                        "tables": total_tables,
                        "images": total_images,
                        "fonts": list(total_fonts),
                        "average_words_per_page": (total_words / len(pdf.pages)) if pdf.pages else 0
                    },
                    "formatting": {
                        "page_size": {
                            "width": getattr(pdf.pages[0], 'width', None) if pdf.pages else None,
                            "height": getattr(pdf.pages[0], 'height', None) if pdf.pages else None
                        }
                    }
                }

                return {
                    "text": "\n\n".join([p for p in full_text if p]),
                    "metadata": metadata,
                    "pages": pages
                }

        except Exception as e:
            logger.error(f"Error processing PDF file: {e}")
            raise ValueError(f"Failed to process PDF file: {e}")

    def process_document(self, file_path: Union[str, Path]) -> Dict[str, Union[str, Dict]]:
        """Process document and extract text based on file type.
        
        Args:
            file_path: Path to the file to process.
            
        Returns:
            Dict containing extracted text and metadata.
            
        Raises:
            DocumentValidationError: If file validation fails.
            ValueError: If document processing fails.
        """
        # Validate file and get MIME type
        mime_type, format_id = self.validate_file(file_path)
        file_path = Path(file_path)
        
        # Read file content
        with open(file_path, 'rb') as f:
            file_content = f.read()
        
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

    def process_document_bytes(self, content: bytes, content_type: str) -> Dict[str, Union[str, Dict]]:
        """Process document given as bytes and a declared content type.

        This is intended for in-memory uploads where a file path is not available.
        """
        # Validate declared MIME type
        mime_type = content_type
        if not DocumentProcessor.is_supported_format(mime_type):
            raise FileTypeError(f"Unsupported file type: {mime_type}")

        format_id = self.get_format_from_mime(mime_type)
        if format_id == 'docx':
            return DocumentProcessor.extract_text_from_docx(content)
        elif format_id == 'pdf':
            return DocumentProcessor.extract_text_from_pdf(content)
        elif format_id == 'txt':
            text = content.decode('utf-8')
            return {
                "text": text,
                "metadata": {"format": "txt", "words": len(text.split())}
            }

        raise ValueError(f"Unsupported format: {format_id}")