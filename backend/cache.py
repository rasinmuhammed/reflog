"""
Simple in-memory cache with TTL for fast API responses.
Reduces Neon cold start impact significantly.
"""
import time
from typing import Any, Optional, Dict
from functools import wraps
import hashlib
import json

# Global cache storage
_cache: Dict[str, tuple[Any, float]] = {}

# Default TTL in seconds (5 minutes)
DEFAULT_TTL = 300


def cache_key(*args, **kwargs) -> str:
    """Generate a cache key from args and kwargs"""
    key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True, default=str)
    return hashlib.md5(key_data.encode()).hexdigest()


def get_cached(key: str) -> Optional[Any]:
    """Get value from cache if not expired"""
    if key in _cache:
        value, expires_at = _cache[key]
        if time.time() < expires_at:
            return value
        else:
            # Expired, remove it
            del _cache[key]
    return None


def set_cached(key: str, value: Any, ttl: int = DEFAULT_TTL) -> None:
    """Set value in cache with TTL"""
    expires_at = time.time() + ttl
    _cache[key] = (value, expires_at)


def clear_cache(prefix: str = None) -> None:
    """Clear cache, optionally by prefix"""
    global _cache
    if prefix:
        _cache = {k: v for k, v in _cache.items() if not k.startswith(prefix)}
    else:
        _cache = {}


def cached(ttl: int = DEFAULT_TTL, prefix: str = ""):
    """
    Decorator for caching async function results.
    
    Usage:
        @cached(ttl=60, prefix="user")
        async def get_user(username: str):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Skip certain args that shouldn't be in cache key (like db sessions)
            filtered_kwargs = {
                k: v for k, v in kwargs.items() 
                if not k.endswith('_db') and k not in ['db', 'system_db']
            }
            key = f"{prefix}:{func.__name__}:{cache_key(*args[1:] if args else [], **filtered_kwargs)}"
            
            # Check cache
            cached_value = get_cached(key)
            if cached_value is not None:
                return cached_value
            
            # Call function and cache result
            result = await func(*args, **kwargs)
            set_cached(key, result, ttl)
            return result
        
        return wrapper
    return decorator


def invalidate_user_cache(github_username: str) -> None:
    """Invalidate all cache entries for a user"""
    clear_cache(prefix=f"user:{github_username}")
