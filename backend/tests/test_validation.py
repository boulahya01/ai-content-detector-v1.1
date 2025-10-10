"""Tests for input validation functionality."""
import pytest
from app.utils.validation import InputValidator
from app.utils.exceptions import TextValidationError, FileValidationError
import os
import tempfile

@pytest.fixture
def validator():
    """Create an InputValidator instance."""
    return InputValidator()

def test_validate_text_free_tier():
    """Test text validation for free tier."""
    # Valid text with enough words
    text = "This is a valid text with enough words to pass the minimum word count requirement for our test."
    result = InputValidator.validate_text(text, "free")
    assert result == text
    
    # Too short
    with pytest.raises(TextValidationError) as exc:
        InputValidator.validate_text("Short", "free")
    assert "too short" in str(exc.value)
    
    # Too long for free tier
    text = " ".join(["word"] * 10000) + "extra"  # Create text with many words
    with pytest.raises(TextValidationError) as exc:
        InputValidator.validate_text(text, "free")
    assert "too long" in str(exc.value)
    assert "free tier" in str(exc.value)

def test_validate_text_paid_tier():
    """Test text validation for paid tier."""
    # Valid text for paid tier with enough words
    base_text = "This is a valid text segment that we will repeat to create a long text. "
    text = base_text * 1000  # Create long text with proper words
    result = InputValidator.validate_text(text, "paid")
    assert result == text
    
    # Too long even for paid tier
    text = " ".join(["word"] * 50000)  # Much longer than paid tier limit
    with pytest.raises(TextValidationError) as exc:
        InputValidator.validate_text(text, "paid")
    assert "too long" in str(exc.value)
    assert "paid tier" in str(exc.value)

def test_text_sanitization():
    """Test text sanitization features."""
    # Test XSS prevention with enough words
    text = '<script>alert("XSS")</script> ' + "word " * 15  # Add enough words
    result = InputValidator.validate_text(text, "free")
    assert '<script>' not in result
    
    # Test malicious pattern removal
    text = "javascript:alert(1) " + "This is additional text to meet the minimum word count requirement for testing."
    result = InputValidator.validate_text(text, "free")
    assert 'javascript:' not in result

@pytest.fixture
def temp_text_file():
    """Create a temporary text file."""
    with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as f:
        f.write(b"Sample text content")
    yield f.name
    os.unlink(f.name)

@pytest.fixture
def temp_pdf_file():
    """Create a temporary PDF-like file."""
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
        f.write(b"%PDF-1.5\nSample PDF content")
    yield f.name
    os.unlink(f.name)

def test_file_validation_size(validator, temp_text_file):
    """Test file size validation."""
    # Create file larger than limit
    with open(temp_text_file, 'wb') as f:
        f.write(b'A' * (InputValidator.MAX_FILE_SIZE + 1))
    
    with pytest.raises(FileValidationError) as exc:
        validator.validate_file(temp_text_file)
    assert "too large" in str(exc.value)

def test_file_validation_mime_type(validator, temp_text_file, temp_pdf_file):
    """Test MIME type validation."""
    # Valid text file
    result = validator.validate_file(temp_text_file)
    assert result["mime_type"] == "text/plain"
    assert result["extension"] == ".txt"
    
    # Valid PDF file
    result = validator.validate_file(temp_pdf_file)
    assert result["mime_type"] == "application/pdf"
    assert result["extension"] == ".pdf"
    
    # Invalid extension
    with tempfile.NamedTemporaryFile(suffix='.xyz') as f:
        f.write(b"Sample content")
        f.flush()
        with pytest.raises(FileValidationError) as exc:
            validator.validate_file(f.name)
        assert "Invalid file extension" in str(exc.value)

def test_is_valid_file_type(validator):
    """Test MIME type checking."""
    assert validator.is_valid_file_type("text/plain") is True
    assert validator.is_valid_file_type("application/pdf") is True
    assert validator.is_valid_file_type("application/x-executable") is False