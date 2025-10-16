"""Rate limiting implementation with subscription-based limits and Redis backend."""
from typing import Dict, Tuple, Optional
import time
from collections import defaultdict
from .exceptions import RateLimitError
import redis
import json
from datetime import datetime, timedelta

class RateLimiter:
    """Rate limiter using token bucket algorithm with Redis backend."""
    
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        """Initialize rate limiter with Redis backend.
        
        Args:
            redis_url: Redis connection URL
        """
        self.redis = redis.from_url(redis_url)
        
        # Plan-based rate limits
        self.plan_limits = {
            'free': {
                'rate': 30/60.0,  # 30 requests per minute
                'burst': 5,
                'daily_limit': 1000
            },
            'basic': {
                'rate': 60/60.0,  # 60 requests per minute
                'burst': 10,
                'daily_limit': 5000
            },
            'pro': {
                'rate': 120/60.0,  # 120 requests per minute
                'burst': 20,
                'daily_limit': 20000
            },
            'enterprise': {
                'rate': 240/60.0,  # 240 requests per minute
                'burst': 40,
                'daily_limit': 50000
            }
        }
    
    def _get_token_key(self, key: str) -> str:
        """Generate Redis key for token bucket."""
        return f"rate_limit:tokens:{key}"
        
    def _get_time_key(self, key: str) -> str:
        """Generate Redis key for last update time."""
        return f"rate_limit:time:{key}"
        
    def _get_daily_key(self, key: str) -> str:
        """Generate Redis key for daily counter."""
        return f"rate_limit:daily:{key}:{datetime.utcnow().strftime('%Y-%m-%d')}"
    
    def _update_tokens(self, key: str, plan: str) -> Tuple[float, float]:
        """Update token count for a key.
        
        Args:
            key: Rate limit key (e.g., user ID)
            plan: Subscription plan name
            
        Returns:
            Tuple of (current_tokens, last_update_time)
        """
        now = time.time()
        token_key = self._get_token_key(key)
        time_key = self._get_time_key(key)
        
        # Get current values
        pipe = self.redis.pipeline()
        pipe.get(token_key)
        pipe.get(time_key)
        results = pipe.execute()
        
        current_tokens = float(results[0] or 0)
        last_time = float(results[1] or now)
        
        # Calculate new token count
        plan_config = self.plan_limits[plan]
        time_passed = now - last_time
        new_tokens = min(
            plan_config['burst'],
            current_tokens + time_passed * plan_config['rate']
        )
        
        # Update values
        pipe = self.redis.pipeline()
        pipe.set(token_key, str(new_tokens))
        pipe.set(time_key, str(now))
        pipe.execute()
        
        return new_tokens, now
    
    async def check_rate_limit(
        self,
        key: str,
        plan: str,
        cost: float = 1.0,
        action: Optional[str] = None
    ) -> None:
        """Check if request is allowed under rate limit.
        
        Args:
            key: Rate limit key (e.g., user ID)
            plan: Subscription plan name
            cost: Cost of the request in tokens
            action: Optional action type for logging
            
        Raises:
            RateLimitError: If rate limit is exceeded
        """
        plan_config = self.plan_limits.get(plan, self.plan_limits['free'])
        current_tokens, _ = self._update_tokens(key, plan)
        
        # Check token bucket limit
        if current_tokens < cost:
            wait_time = (cost - current_tokens) / plan_config['rate']
            raise RateLimitError(
                limit=int(plan_config['rate'] * 60),
                reset_time=int(wait_time)
            )
        
        # Check daily limit
        daily_key = self._get_daily_key(key)
        daily_count = int(self.redis.get(daily_key) or 0)
        
        if daily_count >= plan_config['daily_limit']:
            raise RateLimitError(
                limit=plan_config['daily_limit'],
                reset_time=int(
                    datetime.combine(
                        datetime.utcnow().date() + timedelta(days=1),
                        datetime.min.time()
                    ).timestamp() - time.time()
                )
            )
        
        # Update counters atomically
        pipe = self.redis.pipeline()
        pipe.decr(self._get_token_key(key), float(cost))
        pipe.incr(daily_key)
        pipe.expire(daily_key, 86400)  # 24 hours
        pipe.execute()
        
        # Record request for monitoring
        if action:
            self.record_request(key, action, cost)

    def record_request(self, key: str, action: str, cost: float):
        """Record request details for monitoring.
        
        Args:
            key: Rate limit key (e.g., user ID)
            action: Action type
            cost: Request cost
        """
        now = datetime.utcnow().isoformat()
        request_key = f"request_log:{key}:{now}"
        
        request_data = {
            "timestamp": now,
            "action": action,
            "cost": cost
        }
        
        # Store with 24h expiry
        self.redis.setex(
            request_key,
            86400,  # 24 hours
            json.dumps(request_data)
        )
    
    async def get_usage_stats(self, key: str, plan: str) -> dict:
        """Get current usage statistics.
        
        Args:
            key: Rate limit key (e.g., user ID)
            plan: Subscription plan name
            
        Returns:
            Dict with usage statistics
        """
        current_tokens, _ = self._update_tokens(key, plan)
        daily_count = int(self.redis.get(self._get_daily_key(key)) or 0)
        plan_config = self.plan_limits[plan]
        
        return {
            "available_tokens": current_tokens,
            "daily_requests": daily_count,
            "daily_limit": plan_config['daily_limit'],
            "burst_size": plan_config['burst'],
            "requests_per_minute": int(plan_config['rate'] * 60)
        }

class ShobeisRateLimiter(RateLimiter):
    """Rate limiter specifically for Shobeis API endpoints."""
    
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        """Initialize Shobeis rate limiter with endpoint-specific costs."""
        super().__init__(redis_url)
        
        # Endpoint-specific costs
        self.endpoint_costs = {
            'analyze_text': 1.0,
            'analyze_file': 2.0,
            'batch_analyze': lambda batch_size: max(1.0, batch_size * 0.5),
            'estimate': 0.1,  # Low cost for estimates
            'charge': 1.0,
            'balance': 0.1,   # Low cost for balance checks
            'purchase': 1.0,
            'refund': 1.0
        }
    
    async def check_endpoint_limit(
        self,
        key: str,
        plan: str,
        endpoint: str,
        **kwargs
    ) -> None:
        """Check rate limit for specific Shobeis endpoint.
        
        Args:
            key: Rate limit key (e.g., user ID)
            plan: Subscription plan name
            endpoint: Name of the endpoint being accessed
            **kwargs: Additional parameters for cost calculation
            
        Raises:
            RateLimitError: If rate limit is exceeded
        """
        cost = self.endpoint_costs.get(endpoint, 1.0)
        if callable(cost):
            cost = cost(**kwargs)
        
        await self.check_rate_limit(key, plan, cost, endpoint)