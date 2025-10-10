from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np
from typing import Dict, List, Optional
import re
import logging
import os
from torch.nn.functional import softmax
from pathlib import Path
import tempfile
from functools import lru_cache

logger = logging.getLogger(__name__)

class AIContentAnalyzer:
    def __init__(self, model_name: str = "roberta-base-openai-detector", use_cache: bool = True, quantize: bool = True):
        """Initialize the AI Content Analyzer with a specific model.
        
        Args:
            model_name: Name of the pre-trained model to use. Defaults to RoBERTa model fine-tuned for AI text detection.
            use_cache: Whether to use model caching to disk.
            quantize: Whether to use quantized model for reduced memory usage.
        """
        try:
            self.model_name = model_name
            self.use_cache = use_cache
            self.quantize = quantize
            self.model_loaded = False
            self.cache_dir = Path(tempfile.gettempdir()) / "ai_detector_cache"
            self.cache_dir.mkdir(exist_ok=True)
            
            # Store models for different languages
            self.models = {}
            self.tokenizers = {}
            
            # Delay tokenizer initialization until needed
            self.tokenizer = None
            
            # Determine device
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"Device set to {self.device}")
            
            # Lazy load the model
            self.model = None
            
            # Initialize language detector
            from ..utils.language_detector import LanguageDetector
            self.lang_detector = LanguageDetector()
            
        except Exception as e:
            logger.error(f"Failed to initialize analyzer: {str(e)}")
            raise

    def _load_model(self):
        """Lazy load and optimize the model when needed."""
        if self.model_loaded:
            return

        if self.tokenizer is None:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)

        try:
            cache_path = self.cache_dir / f"{self.model_name.replace('/', '_')}_quantized.pt"
            
            if self.use_cache and cache_path.exists():
                logger.info("Loading quantized model from cache")
                self.model = torch.load(cache_path, map_location=self.device)
            else:
                logger.info("Loading model from transformers")
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    self.model_name, 
                    num_labels=2,
                    torch_dtype=torch.float16 if self.device.type == "cuda" else torch.float32
                )
                
                if self.quantize:
                    logger.info("Quantizing model")
                    if self.device.type == "cuda":
                        # For GPU, use half precision
                        self.model = self.model.half()
                    else:
                        # For CPU, use dynamic quantization
                        self.model = torch.quantization.quantize_dynamic(
                            self.model, {torch.nn.Linear}, dtype=torch.qint8
                        )
                    
                    if self.use_cache:
                        logger.info("Saving quantized model to cache")
                        torch.save(self.model, cache_path)
            
            self.model.to(self.device)
            self.model.eval()
            self.model_loaded = True
            logger.info("Model loaded and optimized successfully")
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise

    def preprocess_text(self, text: str) -> str:
        """Preprocess text before analysis.
        
        Args:
            text: Input text to preprocess.
            
        Returns:
            Preprocessed text.
        """
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove URLs
        text = re.sub(r'http\S+|www.\S+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        
        return text

    def analyze_text(self, text: str, return_raw_scores: bool = False, lang_code: Optional[str] = None) -> Dict:
        """Analyze text for AI generation probability.
        
        Args:
            text: Input text to analyze.
            return_raw_scores: Whether to return raw model scores.
            lang_code: Optional language code. If not provided, will be auto-detected.
            
        Returns:
            Dictionary containing analysis results.
        """
        try:
            # Preprocess text
            processed_text = self.preprocess_text(text)
            if not processed_text:
                raise ValueError("Text is empty after preprocessing")

            # Detect language if not provided
            if not lang_code:
                detected_lang, lang_confidence = self.lang_detector.detect_language(processed_text)
                lang_characteristics = self.lang_detector.analyze_language_characteristics(processed_text)
            else:
                detected_lang = lang_code
                lang_confidence = 1.0
                lang_characteristics = self.lang_detector.analyze_language_characteristics(processed_text)

            # Validate language support
            is_supported, model_name = self.lang_detector.validate_language_support(detected_lang, lang_confidence)
            if not is_supported:
                logger.warning(f"Language {detected_lang} not fully supported, falling back to base model")
                model_name = self.model_name

            # Ensure appropriate model is loaded
            if not self.model_loaded or (is_supported and model_name not in self.models):
                self._load_model(model_name)

            # Get language-specific metrics
            lang_metrics = self.lang_detector.get_language_specific_metrics(processed_text, detected_lang)

            # Tokenize and prepare input with appropriate tokenizer
            tokenizer = self.tokenizers.get(model_name, self.tokenizer)
            inputs = tokenizer(
                processed_text,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            # Get model prediction with optimized inference
            with torch.no_grad(), torch.cuda.amp.autocast() if self.device.type == "cuda" else nullcontext():
                model = self.models.get(model_name, self.model)
                outputs = model(**inputs)
                logits = outputs.logits
                probabilities = softmax(logits, dim=1)
                human_prob, ai_prob = probabilities[0].cpu().numpy()

            # Calculate confidence and indicators
            prediction_confidence = float(max(human_prob, ai_prob))
            is_ai_generated = ai_prob > human_prob
            indicators = self._calculate_indicators(processed_text, ai_prob)

            result = {
                "prediction": "AI_GENERATED" if is_ai_generated else "HUMAN_WRITTEN",
                "confidence": round(prediction_confidence * 100, 2),
                "authenticityScore": round(float(1 - ai_prob) * 100, 2),
                "analysisDetails": {
                    "aiProbability": round(float(ai_prob) * 100, 2),
                    "humanProbability": round(float(human_prob) * 100, 2),
                    "textLength": len(processed_text.split()),
                    "indicators": indicators
                },
                "languageInfo": {
                    "detected": detected_lang,
                    "confidence": round(lang_confidence * 100, 2),
                    "supported": is_supported,
                    "metrics": lang_metrics,
                    "characteristics": lang_characteristics
                }
            }

            if return_raw_scores:
                result["rawScores"] = {
                    "logits": logits[0].cpu().numpy().tolist(),
                    "attention": outputs.attentions[-1][0].cpu().numpy().tolist() if outputs.attentions else None
                }

            return result

        except Exception as e:
            logger.error(f"Error analyzing text: {str(e)}")
            raise

    def _calculate_indicators(self, text: str, ai_prob: float) -> List[Dict]:
        """Calculate various indicators for text analysis.
        
        Args:
            text: Input text to analyze.
            ai_prob: AI probability from the model.
            
        Returns:
            List of indicator dictionaries.
        """
        indicators = []
        
        # Pattern complexity
        pattern_score = self._analyze_pattern_complexity(text)
        indicators.append({
            "type": "Pattern Complexity",
            "description": "Analysis of writing patterns and structure",
            "confidence": round(pattern_score * 100, 2),
            "details": {
                "sentenceVariation": self._get_sentence_variation(text),
                "repetitivePatterns": self._check_repetitive_patterns(text)
            }
        })

        # Language naturalness
        lang_score = self._analyze_language_naturalness(text)
        indicators.append({
            "type": "Language Naturalness",
            "description": "Evaluation of natural language flow",
            "confidence": round(lang_score * 100, 2),
            "details": {
                "vocabularyDiversity": self._calculate_vocabulary_diversity(text),
                "sentenceComplexity": self._analyze_sentence_complexity(text)
            }
        })

        # Style consistency
        style_score = self._analyze_style_consistency(text)
        indicators.append({
            "type": "Style Consistency",
            "description": "Measurement of writing style consistency",
            "confidence": round(style_score * 100, 2),
            "details": {
                "toneConsistency": self._analyze_tone_consistency(text),
                "stylePatterns": self._detect_style_patterns(text)
            }
        })

        return indicators

    def _analyze_pattern_complexity(self, text: str) -> float:
        """Analyze pattern complexity in text.
        
        Args:
            text: Input text to analyze.
            
        Returns:
            Pattern complexity score (0-1).
        """
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        if not sentences:
            return 0.0

        # Calculate sentence length variation
        sent_lengths = [len(s.split()) for s in sentences]
        length_variation = np.std(sent_lengths) if len(sent_lengths) > 1 else 0

        # Calculate structure variation
        structure_patterns = self._get_sentence_structures(sentences)
        structure_variation = len(set(structure_patterns)) / len(sentences)

        # Combine metrics
        complexity_score = (length_variation / 10 + structure_variation) / 2
        return min(1.0, complexity_score)

    def _analyze_language_naturalness(self, text: str) -> float:
        """Analyze natural language characteristics.
        
        Args:
            text: Input text to analyze.
            
        Returns:
            Language naturalness score (0-1).
        """
        words = text.split()
        if not words:
            return 0.0

        # Calculate vocabulary diversity
        vocab_diversity = len(set(words)) / len(words)

        # Calculate word frequency distribution
        word_freq = {}
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1
        freq_variation = np.std(list(word_freq.values()))

        # Combine metrics
        naturalness_score = (vocab_diversity + min(1.0, freq_variation / 5)) / 2
        return min(1.0, naturalness_score)

    def _analyze_style_consistency(self, text: str) -> float:
        """Analyze writing style consistency.
        
        Args:
            text: Input text to analyze.
            
        Returns:
            Style consistency score (0-1).
        """
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        if not sentences:
            return 0.0

        # Analyze sentence beginnings
        sentence_starts = [s.split()[0].lower() if s.split() else '' for s in sentences]
        start_diversity = len(set(sentence_starts)) / len(sentences)

        # Analyze punctuation patterns
        punct_pattern = [len(re.findall(r'[,.!?;]', s)) for s in sentences]
        punct_consistency = 1.0 - (np.std(punct_pattern) / max(max(punct_pattern), 1))

        return (start_diversity + punct_consistency) / 2

    def _get_sentence_variation(self, text: str) -> float:
        """Calculate sentence length variation."""
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        if not sentences:
            return 0.0
        lengths = [len(s.split()) for s in sentences]
        return float(np.std(lengths))

    def _check_repetitive_patterns(self, text: str) -> Dict:
        """Check for repetitive patterns in text."""
        words = text.split()
        bigrams = list(zip(words, words[1:]))
        bigram_freq = {}
        for bg in bigrams:
            bigram_freq[bg] = bigram_freq.get(bg, 0) + 1
        
        return {
            "repeatedPhrases": len([k for k, v in bigram_freq.items() if v > 1]),
            "maxRepetition": max(bigram_freq.values()) if bigram_freq else 0
        }

    def _get_sentence_structures(self, sentences: List[str]) -> List[str]:
        """Get basic sentence structure patterns."""
        patterns = []
        for sent in sentences:
            # Simple structure based on sentence length and punctuation
            words = sent.split()
            pattern = f"{len(words)}_{len([w for w in words if w.istitle()])}"
            patterns.append(pattern)
        return patterns

    def _calculate_vocabulary_diversity(self, text: str) -> Dict:
        """Calculate vocabulary diversity metrics."""
        words = [w.lower() for w in text.split()]
        unique_words = len(set(words))
        total_words = len(words)
        
        return {
            "uniqueWords": unique_words,
            "totalWords": total_words,
            "diversity": round(unique_words / max(total_words, 1), 3)
        }

    def _analyze_sentence_complexity(self, text: str) -> Dict:
        """Analyze sentence complexity."""
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        if not sentences:
            return {"average": 0, "max": 0, "min": 0}
            
        lengths = [len(s.split()) for s in sentences]
        return {
            "average": round(np.mean(lengths), 2),
            "max": max(lengths),
            "min": min(lengths)
        }

    def _analyze_tone_consistency(self, text: str) -> float:
        """Analyze consistency in writing tone."""
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        if not sentences:
            return 0.0
            
        # Simple tone analysis based on punctuation and capitalization
        tone_markers = [
            len(re.findall(r'[!?]', s)) / max(len(s.split()), 1)
            for s in sentences
        ]
        return 1.0 - min(1.0, np.std(tone_markers))

    def _detect_style_patterns(self, text: str) -> Dict:
        """Detect common style patterns in text."""
        return {
            "exclamations": len(re.findall(r'!', text)),
            "questions": len(re.findall(r'\?', text)),
            "ellipsis": len(re.findall(r'\.{3}', text)),
            "quotations": len(re.findall(r'["\']', text)) // 2
        }

    def analyze_batch(self, texts: List[str], batch_size: int = 8) -> List[Dict]:
        """Analyze multiple texts efficiently in batches.
        
        Args:
            texts: List of texts to analyze.
            batch_size: Number of texts to process in each batch.
            
        Returns:
            List of analysis results for each text.
        """
        if not texts:
            return []

        # Ensure model is loaded
        if not self.model_loaded:
            self._load_model()

        results = []
        
        # Process texts in batches
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            
            # Preprocess batch
            processed_texts = [self.preprocess_text(text) for text in batch_texts]
            
            # Tokenize batch
            inputs = self.tokenizer(
                processed_texts,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get predictions for batch
            with torch.no_grad(), torch.cuda.amp.autocast() if self.device.type == "cuda" else nullcontext():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probabilities = softmax(logits, dim=1)
                batch_probs = probabilities.cpu().numpy()
            
            # Process each text in batch
            for j, (text, (human_prob, ai_prob)) in enumerate(zip(processed_texts, batch_probs)):
                if not text:
                    results.append({"error": "Empty text after preprocessing"})
                    continue
                
                prediction_confidence = float(max(human_prob, ai_prob))
                is_ai_generated = ai_prob > human_prob
                indicators = self._calculate_indicators(text, ai_prob)
                
                results.append({
                    "prediction": "AI_GENERATED" if is_ai_generated else "HUMAN_WRITTEN",
                    "confidence": round(prediction_confidence * 100, 2),
                    "authenticityScore": round(float(1 - ai_prob) * 100, 2),
                    "analysisDetails": {
                        "aiProbability": round(float(ai_prob) * 100, 2),
                        "humanProbability": round(float(human_prob) * 100, 2),
                        "textLength": len(text.split()),
                        "indicators": indicators
                    }
                })
        
        return results

    @staticmethod
    def nullcontext():
        """Context manager that does nothing."""
        class DummyContextManager:
            def __enter__(self): return None
            def __exit__(self, *args): return False
        return DummyContextManager()