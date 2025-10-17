import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.analyzer import AIContentAnalyzer

client = TestClient(app)

def test_analyzer_initialization():
    analyzer = AIContentAnalyzer()
    assert analyzer.tokenizer is not None
    assert analyzer.model is not None

def test_text_analysis():
    analyzer = AIContentAnalyzer()
    test_text = "This is a sample text to analyze the capabilities of our AI content detector."
    result = analyzer.analyze_text(test_text)
    
    # Check response structure
    assert "authenticityScore" in result
    assert "analysisDetails" in result
    assert "aiProbability" in result["analysisDetails"]
    assert "humanProbability" in result["analysisDetails"]
    assert "indicators" in result["analysisDetails"]
    
    # Check value ranges
    assert 0 <= result["authenticityScore"] <= 1
    assert 0 <= result["analysisDetails"]["aiProbability"] <= 100
    assert 0 <= result["analysisDetails"]["humanProbability"] <= 100

def test_api_analyze_endpoint(client: TestClient, auth_headers: dict):
    """Test analyzing text through API endpoint."""
    test_content = "This is a test content for API analysis."
    response = client.post(
        "/api/analyze",
        json={"content": test_content},
        headers=auth_headers
    )
    
    assert response.status_code == 200, f"Analysis failed: {response.json()}"
    result = response.json()
    assert "success" in result
    assert result["success"] == True
    assert "data" in result
    assert "authenticityScore" in result["data"]

def test_api_file_upload(client: TestClient, auth_headers: dict):
    """Test analyzing uploaded file through API endpoint."""
    test_content = b"This is a test file content for analysis."
    files = {
        "file": ("test.txt", test_content, "text/plain")
    }
    response = client.post(
        "/api/analyze/file",
        files=files,
        headers=auth_headers
    )
    
    assert response.status_code == 200, f"File analysis failed: {response.json()}"
    result = response.json()
    assert "success" in result
    assert result["success"] == True
    assert "data" in result