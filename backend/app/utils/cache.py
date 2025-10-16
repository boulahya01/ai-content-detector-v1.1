from typing import Any, Optional
import json
from redis import Redis
from datetime import timedelta

class RedisCache:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        value = await self.redis.get(key)
        if value:
            return json.loads(value)
        return None

    async def set(self, key: str, value: Any, expire_seconds: int = None) -> None:
        """Set value in cache with optional expiration"""
        serialized = json.dumps(value)
        if expire_seconds:
            await self.redis.setex(key, timedelta(seconds=expire_seconds), serialized)
        else:
            await self.redis.set(key, serialized)

    async def delete(self, key: str) -> None:
        """Delete value from cache"""
        await self.redis.delete(key)

    async def clear_pattern(self, pattern: str) -> None:
        """Clear all keys matching pattern"""
        keys = await self.redis.keys(pattern)
        if keys:
            await self.redis.delete(*keys)