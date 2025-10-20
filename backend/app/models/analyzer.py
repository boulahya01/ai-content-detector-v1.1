import torch
import numpy as np
import gc
from typing import Dict, List, Optional, Any
import re
import logging
import os
import time
import json
from torch.nn.functional import softmax
from pathlib import Path
import tempfile
import traceback
from functools import lru_cache
from contextlib import contextmanager

logger = logging.getLogger(__name__)

@contextmanager
def torch_memory_management():
    """Context manager for torch memory management."""
    try:
        # Clear GPU cache if available
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()
        yield
    finally:
        # Always clean up
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()

class AIContentAnalyzer:
    def __init__(self, model_name: str = "roberta-large-openai-detector", use_cache: bool = True, quantize: bool = True):
        self._initialize(model_name, use_cache, quantize)
            
    def _initialize(self, model_name: str, use_cache: bool, quantize: bool):
        # Lazy initialization method to handle any potential errors during __init__
        """Initialize the AI Content Analyzer with a specific model.
        
        Args:
            model_name: Name of the pre-trained model to use. Defaults to RoBERTa large model fine-tuned for AI text detection.
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
            
            # Initialize but don't load model yet - will be loaded explicitly
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"Device set to {self.device}")
            
            # Initialize components for deferred model loading
            self.tokenizer = None
            self.model = None
            self.model_loaded = False

            # Initialize language detector
            from ..utils.language_detector import LanguageDetector
            self.lang_detector = LanguageDetector()
            
        except Exception as e:
            logger.error(f"Failed to initialize analyzer: {str(e)}")
            raise

    def _load_model(self, model_name: Optional[str] = None):
        """Load the AI detection model with enhanced error handling and caching."""
        # Lazy-import transformers to avoid heavy imports at module import time
        try:
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
        except Exception as e:
            # Re-raise with clearer message
            logger.error(f"Failed to import transformers: {e}")
            raise
        try:
            # Update model name if specified
            if model_name:
                self.model_name = model_name
            elif not self.model_name:
                # Default to the OpenAI detector model
                self.model_name = "roberta-large-openai-detector"
                logger.info(f"No model specified, using {self.model_name}")

            # Configure model paths and cache
            model_cache_dir = self.cache_dir / "models" / self.model_name
            tokenizer_cache_dir = self.cache_dir / "tokenizers" / self.model_name
            model_cache_dir.mkdir(parents=True, exist_ok=True)
            tokenizer_cache_dir.mkdir(parents=True, exist_ok=True)

            # Log system info for debugging
            self._log_system_info()
            
            # Clear CUDA cache if using GPU
            self._clear_gpu_memory()

            # Clear any existing model to ensure fresh load
            if hasattr(self, 'model'):
                try:
                    del self.model
                except AttributeError:
                    pass
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                gc.collect()

            # Reset model loaded state
            self.model_loaded = False
            
                        # Direct tokenizer loading without caching layer
            logger.info(f"Loading tokenizer from {self.model_name}")
            try:
                # Load tokenizer with minimal configuration
                self.tokenizer = AutoTokenizer.from_pretrained(
                    self.model_name,
                    cache_dir=str(tokenizer_cache_dir),
                    local_files_only=False
                )
                
                logger.info("Initial tokenizer load successful")
                
                # Run basic verification
                test_input = "This is a test sentence."
                test_output = self.tokenizer(
                    test_input,
                    return_tensors="pt",
                    padding=True,
                    truncation=True,
                    max_length=512
                )
                logger.info("Tokenizer verification successful")
            except Exception as e:
                logger.error(f"Failed to load or verify tokenizer: {str(e)}")
                raise
            try:
                logger.info("Loading the model...")
                
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    self.model_name,
                    cache_dir=str(model_cache_dir),
                    local_files_only=False,
                    num_labels=2,
                    trust_remote_code=True
                )
                
                # Move to device and prepare for inference
                self.model = self.model.to(self.device)
                self.model.eval()
                
                # Basic verification
                test_input = "Testing model initialization."
                tokens = self.tokenizer(
                    test_input,
                    return_tensors="pt",
                    truncation=True,
                    max_length=512,
                    padding=True
                )
                tokens = {k: v.to(self.device) for k, v in tokens.items()}
                
                with torch.no_grad():
                    outputs = self.model(**tokens)
                    logits = outputs.logits
                    
                if logits.shape != (1, 2):
                    raise ValueError(f"Unexpected output shape: {logits.shape}")
                    
                self.model_loaded = True
                logger.info("Model initialization successful")
                    
            except Exception as e:
                logger.error(f"Model initialization failed: {str(e)}")
                self.model_loaded = False
                raise
            # The model loading process is handled below in the retry logic section

            # Proceed with model loading - using retry logic
            success = False
            for attempt in range(3):
                try:
                    logger.info(f"Loading model from {self.model_name} (attempt {attempt + 1}/3)")
                    
                    # Load the model
                    self.model = AutoModelForSequenceClassification.from_pretrained(
                        self.model_name,
                        cache_dir=str(model_cache_dir),
                        local_files_only=False,
                        num_labels=2,
                        trust_remote_code=True
                    )
                    
                    # Move to device and set eval mode
                    self.model = self.model.to(self.device)
                    self.model.eval()
                    
                    # Optimize model if requested
                    if self.quantize and self.device.type == "cuda":
                        logger.info("Quantizing model for GPU...")
                        self.model = self.model.half()
                        
                    # Test forward pass with tokenized input
                    test_input = "Test sentence for model verification."
                    tokens = self.tokenizer(test_input, return_tensors="pt")
                    tokens = {k: v.to(self.device) for k, v in tokens.items()}
                    
                    with torch.no_grad():
                        outputs = self.model(**tokens)
                        if not hasattr(outputs, 'logits'):
                            raise ValueError("Model output missing logits")
                        if outputs.logits.shape != (1, 2):
                            raise ValueError(f"Unexpected output shape: {outputs.logits.shape}")
                    
                    # Mark as successfully loaded
                    success = True
                    logger.info("Model successfully loaded and verified")
                    break
                    
                except Exception as e:
                    error_msg = str(e)
                    if attempt < 2:  # Still have retries left
                        logger.warning(f"Model load attempt {attempt + 1} failed: {error_msg}")
                        if torch.cuda.is_available():
                            torch.cuda.empty_cache()
                        gc.collect()
                        time.sleep(2)  # Wait between retries
                    else:  # Final attempt failed
                        logger.error(f"All model load attempts failed: {error_msg}")
                        raise RuntimeError(f"Failed to initialize model: {error_msg}")
            
            # Final verification and setup
            if success:
                try:
                    self.model_loaded = True
                    # Remove dummy flag if present
                    if hasattr(self.model, 'is_dummy'):
                        delattr(self.model, 'is_dummy')
                    
                    logger.info(f"Successfully loaded and verified model {self.model_name} on {self.device}")
                    if torch.cuda.is_available():
                        logger.info(f"Final CUDA memory usage: {torch.cuda.memory_allocated() / 1024 / 1024:.2f}MB")
                        
                except Exception as e:
                    logger.error(f"Final model verification failed: {str(e)}")
                    self.model_loaded = False
                    raise
            
        except Exception as e:
            logger.error(f"Failed to load model {self.model_name}: {str(e)}", exc_info=True)
            self.model_loaded = False
            raise RuntimeError(f"Failed to initialize AI detection model: {str(e)}")

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

            # Ensure appropriate model is loaded (deferred)
            if not self.model_loaded or self.model is None or self.tokenizer is None:
                try:
                    self._load_model()
                except Exception as e:
                    logger.error(f"Model loading failed: {str(e)}")
                    # Return a fallback result for placeholder text
                    return {
                        "prediction": "ERROR",
                        "confidence": 0.0,
                        "authenticityScore": 0.0,
                        "analysisDetails": {
                            "aiProbability": 0.0,
                            "humanProbability": 0.0,
                            "textLength": len(processed_text.split()),
                            "indicators": []
                        },
                        "languageInfo": {
                            "detected": None,
                            "confidence": 0.0,
                            "supported": False,
                            "metrics": {},
                            "characteristics": {}
                        },
                        "error": f"Model loading failed: {str(e)}"
                    }

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

            # Ensure model is available
            current_model = self.models.get(model_name, self.model)
            if current_model is None:
                raise RuntimeError("No model available for inference")
                
            # Get model prediction with optimized inference
            with torch.no_grad(), torch.cuda.amp.autocast() if self.device.type == "cuda" else self.nullcontext():
                outputs = current_model(**inputs)
                logits = outputs.logits
                probabilities = softmax(logits, dim=1)
                # Convert numpy types to Python floats
                human_prob = float(probabilities[0, 0].item())
                ai_prob = float(probabilities[0, 1].item())

            # Calculate confidence and indicators
            prediction_confidence = float(max(human_prob, ai_prob))
            is_ai_generated = ai_prob > human_prob
            indicators = self._calculate_indicators(processed_text, ai_prob)

            result = {
                "prediction": "AI_GENERATED" if is_ai_generated else "HUMAN_WRITTEN",
                "confidence": round(prediction_confidence * 100, 2),
                # authenticityScore is a fraction between 0 and 1 (1.0 means fully authentic)
                "authenticityScore": round(float(1 - ai_prob), 4),
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
        return float(min(1.0, complexity_score))

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
        return float(min(1.0, naturalness_score))

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

        # Convert numpy types to Python float 
        result: float = float((start_diversity + punct_consistency) / 2)
        return result

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
        return float(1.0 - min(1.0, np.std(tone_markers)))

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
            if not self.tokenizer:
                raise ValueError("Tokenizer is not initialized")
                
            inputs = self.tokenizer(
                processed_texts,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get predictions for batch
            with torch.no_grad(), torch.cuda.amp.autocast() if self.device.type == "cuda" else self.nullcontext():
                if self.model is None:
                    raise RuntimeError("Model not loaded")
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
                    "authenticityScore": round(float(1 - ai_prob), 4),
                    "analysisDetails": {
                        "aiProbability": round(float(ai_prob) * 100, 2),
                        "humanProbability": round(float(human_prob) * 100, 2),
                        "textLength": len(text.split()),
                        "indicators": indicators
                    }
                })
        
        return results

    def _verify_tokenizer(self) -> None:
        """Verify tokenizer functionality with comprehensive tests."""
        try:
            # Test basic tokenization
            test_input = "This is a test sentence for tokenizer verification."
            tokens = self.tokenizer(test_input, return_tensors="pt")
            
            # Verify required outputs
            required_keys = {"input_ids", "attention_mask"}
            if not all(key in tokens for key in required_keys):
                raise ValueError(f"Tokenizer missing required outputs: {required_keys - set(tokens.keys())}")
                
            # Verify tensor shapes
            if tokens["input_ids"].ndim != 2:
                raise ValueError(f"Unexpected input_ids shape: {tokens['input_ids'].shape}")
                
            # Test special token handling
            special_tokens = {
                "pad_token": self.tokenizer.pad_token,
                "cls_token": getattr(self.tokenizer, "cls_token", None),
                "sep_token": getattr(self.tokenizer, "sep_token", None)
            }
            if not any(special_tokens.values()):
                raise ValueError("No special tokens found in tokenizer")
                
            logger.info("Tokenizer verification completed successfully")
            
        except Exception as e:
            logger.error(f"Tokenizer verification failed: {str(e)}")
            raise ValueError(f"Tokenizer verification failed: {str(e)}")

    def _log_system_info(self) -> None:
        """Log detailed system information for debugging."""
        logger.info("System Configuration:")
        logger.info(f"PyTorch version: {torch.__version__}")
        logger.info(f"CUDA available: {torch.cuda.is_available()}")
        
        if torch.cuda.is_available():
            logger.info(f"CUDA version: {torch.version.cuda}")
            logger.info(f"CUDA device: {torch.cuda.get_device_name()}")
            logger.info(f"CUDA memory allocated: {torch.cuda.memory_allocated() / 1024 / 1024:.2f}MB")
            logger.info(f"CUDA memory reserved: {torch.cuda.memory_reserved() / 1024 / 1024:.2f}MB")
            
        logger.info(f"Model name: {self.model_name}")
        logger.info(f"Cache directory: {self.cache_dir}")
        logger.info(f"Using quantization: {self.quantize}")

    def _clear_gpu_memory(self) -> None:
        """Clear GPU memory and garbage collect."""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()
            logger.info("Cleared GPU memory and garbage collected")

    @staticmethod
    def nullcontext():
        """Context manager that does nothing."""
        class DummyContextManager:
            def __enter__(self): return None
            def __exit__(self, *args): return False
        return DummyContextManager()