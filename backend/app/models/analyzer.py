from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np

class AIContentAnalyzer:
    def __init__(self):
        model_name = "roberta-base"  # You can replace with your fine-tuned model
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)

    def analyze_text(self, text: str) -> dict:
        # Tokenize and prepare input
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # Get model prediction
        with torch.no_grad():
            outputs = self.model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=1)
            human_prob, ai_prob = probabilities[0].cpu().numpy()

        # Calculate indicators based on text characteristics
        indicators = self._calculate_indicators(text, ai_prob)

        return {
            "authenticityScore": float(1 - ai_prob),  # Higher score means more likely human-written
            "analysisDetails": {
                "aiProbability": round(float(ai_prob) * 100, 2),
                "humanProbability": round(float(human_prob) * 100, 2),
                "indicators": indicators
            }
        }

    def _calculate_indicators(self, text: str, ai_prob: float) -> list:
        indicators = []
        
        # Pattern complexity
        pattern_score = self._analyze_pattern_complexity(text)
        indicators.append({
            "type": "Pattern Complexity",
            "description": "Analysis of writing patterns and structure",
            "confidence": round(pattern_score * 100, 2)
        })

        # Language naturalness
        lang_score = self._analyze_language_naturalness(text)
        indicators.append({
            "type": "Language Naturalness",
            "description": "Evaluation of natural language flow",
            "confidence": round(lang_score * 100, 2)
        })

        return indicators

    def _analyze_pattern_complexity(self, text: str) -> float:
        # Implement pattern complexity analysis
        # This is a simplified version - you can make it more sophisticated
        sentences = text.split('.')
        variations = np.std([len(s.split()) for s in sentences if s.strip()])
        return min(1.0, variations / 10)  # Normalize to 0-1

    def _analyze_language_naturalness(self, text: str) -> float:
        # Implement language naturalness analysis
        # This is a simplified version - you can make it more sophisticated
        words = text.split()
        unique_words = len(set(words))
        total_words = len(words)
        if total_words == 0:
            return 0
        return min(1.0, unique_words / total_words * 2)  # Normalize to 0-1