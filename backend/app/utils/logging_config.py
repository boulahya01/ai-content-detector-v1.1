"""Logging configuration for the application."""
import logging
import logging.handlers
import os
from pathlib import Path
import json
import time
from typing import Any, Dict, Optional
from datetime import datetime
import psutil
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import uuid

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging detailed request metrics."""
    
    async def dispatch(self, request: Request, call_next):
        """Process request and log metrics.
        
        Args:
            request: The incoming request.
            call_next: The next middleware or route handler.
            
        Returns:
            Response from the next handler.
        """
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        # Get request details
        request_details = {
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "client_ip": request.client.host,
            "user_agent": request.headers.get("user-agent", "Unknown"),
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        # Get initial resource usage
        process = psutil.Process()
        initial_memory = process.memory_info().rss
        initial_cpu = process.cpu_percent()
        
        response = None
        try:
            response = await call_next(request)
            
            # Calculate metrics
            duration = time.time() - start_time
            memory_used = process.memory_info().rss - initial_memory
            cpu_used = process.cpu_percent() - initial_cpu
            
            # Log success metrics
            logging.getLogger("request").info(
                "Request completed",
                extra={
                    "details": {
                        **request_details,
                        "status_code": response.status_code,
                        "duration": round(duration * 1000, 2),  # ms
                        "memory_used": memory_used,
                        "cpu_used": cpu_used,
                        "outcome": "success"
                    }
                }
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            return response
            
        except Exception as e:
            # Log error metrics
            duration = time.time() - start_time
            logging.getLogger("request").error(
                "Request failed",
                extra={
                    "details": {
                        **request_details,
                        "duration": round(duration * 1000, 2),  # ms
                        "error": str(e),
                        "outcome": "error"
                    }
                },
                exc_info=True
            )
            raise

class JSONFormatter(logging.Formatter):
    """Custom formatter that outputs logs in JSON format."""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON.
        
        Args:
            record: Log record to format.
            
        Returns:
            JSON formatted log string.
        """
        log_object: Dict[str, Any] = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Add exception info if present
        if record.exc_info:
            log_object["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, "details"):
            log_object["details"] = record.details
        
        return json.dumps(log_object)

def setup_logging(log_dir: str = "logs") -> None:
    """Set up application logging.
    
    Args:
        log_dir: Directory to store log files.
    """
    # Create logs directory if it doesn't exist
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True)
    
    # Create formatters
    json_formatter = JSONFormatter()
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(console_formatter)
    console_handler.setLevel(logging.INFO)
    root_logger.addHandler(console_handler)
    
    # File handlers with different log types
    handlers = {
        'error': {
            'filename': log_path / 'error.log',
            'level': logging.ERROR,
        },
        'info': {
            'filename': log_path / 'info.log',
            'level': logging.INFO,
        },
        'debug': {
            'filename': log_path / 'debug.log',
            'level': logging.DEBUG,
        },
        'request': {
            'filename': log_path / 'request.log',
            'level': logging.INFO,
        },
        'performance': {
            'filename': log_path / 'performance.log',
            'level': logging.INFO,
        }
    }
    
    for handler_config in handlers.values():
        file_handler = logging.handlers.RotatingFileHandler(
            handler_config['filename'],
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        file_handler.setFormatter(json_formatter)
        file_handler.setLevel(handler_config['level'])
        root_logger.addHandler(file_handler)
    
    # Set module-specific log levels
    logging.getLogger('uvicorn').setLevel(logging.INFO)
    logging.getLogger('fastapi').setLevel(logging.INFO)
    
    # Log startup message
    root_logger.info("Logging system initialized")