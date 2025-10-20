"""Simple in-memory rate limiter implementation."""
from collections import defaultdict
import time
from typing import Dict, Tuple

class MemoryRateLimiter:
    def __init__(self, attempts: int = 5, window_minutes: int = 15):
        """Initialize rate limiter.
        
        Args:
            attempts: Maximum number of attempts allowed
            window_minutes: Time window in minutes
        """
        self.max_attempts = attempts
        self.window_minutes = window_minutes
        self.attempts: Dict[str, list] = defaultdict(list)
        
    def _cleanup_old_attempts(self, key: str):
        """Remove attempts older than the window."""
        now = time.time()
        window = self.window_minutes * 60
        self.attempts[key] = [t for t in self.attempts[key] if now - t < window]
        
    def is_allowed(self, key: str) -> bool:
        """Check if request is allowed.
        
        Args:
            key: Identifier for the request (e.g., IP address)
            
        Returns:
            bool: True if request is allowed, False otherwise
        """
        self._cleanup_old_attempts(key)
        return len(self.attempts[key]) < self.max_attempts
        
    def add_attempt(self, key: str):
        """Record an attempt.
        
        Args:
            key: Identifier for the request
        """
        self.attempts[key].append(time.time())
        
    def reset(self, key: str):
        """Reset attempts for a key.
        
        Args:
            key: Identifier to reset
        """
        self.attempts[key] = []
        
    def get_remaining_attempts(self, key: str) -> int:
        """Get number of remaining attempts.
        
        Args:
            key: Identifier to check
            
        Returns:
            int: Number of remaining attempts
        """
        self._cleanup_old_attempts(key)
        return max(0, self.max_attempts - len(self.attempts[key]))
        
    def get_retry_after(self, key: str) -> float:
        """Get seconds until next attempt is allowed.
        
        Args:
            key: Identifier to check
            
        Returns:
            float: Seconds until next attempt
        """
        if self.is_allowed(key):
            return 0
            
        self._cleanup_old_attempts(key)
        if not self.attempts[key]:
            return 0
            
        oldest = min(self.attempts[key])
        return max(0, (oldest + self.window_minutes * 60) - time.time())