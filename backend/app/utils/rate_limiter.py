"""Rate limiting implementation."""
from typing import Dict, Tuple
import time
from collections import defaultdict
from .exceptions import RateLimitError

class RateLimiter:
    """Rate limiter using token bucket algorithm."""
    
    def __init__(self, requests_per_minute: int = 60, burst_size: int = 10):
        """Initialize rate limiter.
        
        Args:
            requests_per_minute: Number of requests allowed per minute.
            burst_size: Maximum number of requests allowed in burst.
        """
        self.rate = requests_per_minute / 60.0  # tokens per second
        self.burst_size = burst_size
        self.tokens: Dict[str, float] = defaultdict(float)
        self.last_time: Dict[str, float] = defaultdict(float)
    
    def _update_tokens(self, key: str) -> None:
        """Update token count for a key.
        
        Args:
            key: Rate limit key (e.g., IP address).
        """
        now = time.time()
        time_passed = now - self.last_time[key]
        self.tokens[key] = min(
            self.burst_size,
            self.tokens[key] + time_passed * self.rate
        )
        self.last_time[key] = now
    
    def check_rate_limit(self, key: str, cost: float = 1.0) -> None:
        """Check if request is allowed under rate limit.
        
        Args:
            key: Rate limit key (e.g., IP address).
            cost: Cost of the request in tokens.
            
        Raises:
            RateLimitError: If rate limit is exceeded.
        """
        self._update_tokens(key)
        
        if self.tokens[key] < cost:
            wait_time = (cost - self.tokens[key]) / self.rate
            raise RateLimitError(
                limit=int(self.rate * 60),
                reset_time=int(wait_time)
            )
        
        self.tokens[key] -= cost

class APIRateLimiter(RateLimiter):
    """Rate limiter specifically for API endpoints."""
    
    def __init__(self):
        """Initialize API rate limiter with default limits."""
        super().__init__(requests_per_minute=60, burst_size=10)
        
        # Endpoint-specific costs
        self.endpoint_costs = {
            'analyze_text': 1.0,
            'analyze_file': 2.0,
            'batch_analyze': lambda batch_size: max(1.0, batch_size * 0.5)
        }
    
    def check_endpoint_limit(self, key: str, endpoint: str, **kwargs) -> None:
        """Check rate limit for specific endpoint.
        
        Args:
            key: Rate limit key (e.g., IP address).
            endpoint: Name of the endpoint being accessed.
            **kwargs: Additional parameters for cost calculation.
            
        Raises:
            RateLimitError: If rate limit is exceeded.
        """
        cost = self.endpoint_costs.get(endpoint, 1.0)
        if callable(cost):
            cost = cost(**kwargs)
        
        self.check_rate_limit(key, cost)