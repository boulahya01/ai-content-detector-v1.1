"""RoBERTa model configuration for AI text detection."""

ROBERTA_CONFIG = {
    "model_name": "roberta-large-openai-detector",
    "tokenizer_config": {
        "padding": True,
        "truncation": True,
        "max_length": 512,
        "return_tensors": "pt",
        "use_fast": True,
        "model_max_length": 512,
    },
    "model_config": {
        "num_labels": 2,
        "trust_remote_code": True,
        "output_hidden_states": False,
        "output_attentions": False,
    },
    "inference_config": {
        "threshold": 0.5,  # Default threshold for AI/human classification
        "batch_size": 8,   # Default batch size for processing
    }
}

# Labels for classification
LABELS = ["HUMAN_WRITTEN", "AI_GENERATED"]

# Model cache configuration
CACHE_CONFIG = {
    "use_cache": True,
    "cache_dir": None,  # Will be set during initialization
    "local_files_only": False,
}