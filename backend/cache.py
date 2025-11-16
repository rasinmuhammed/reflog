from functools import wraps
from typing import Optional, Callable
import json
import hashlib
from datetime import datetime, timedelta

class SimpleCache:
    """Simple in-memory cache with TTL"""
    
    def __init__(self):
        self._cache = {}
        self._timestamps = {}
    
    def get(self, key: str) -> Optional[any]:
        """Get value from cache if not expired"""
        if key not in self._cache:
            return None
        
        timestamp = self._timestamps.get(key)
        if timestamp and timestamp < datetime.now():
            # Expired
            self.delete(key)
            return None
        
        return self._cache[key]
    
    def set(self, key: str, value: any, ttl_seconds: int = 300):
        """Set value in cache with TTL"""
        self._cache[key] = value
        self._timestamps[key] = datetime.now() + timedelta(seconds=ttl_seconds)
    
    def delete(self, key: str):
        """Delete key from cache"""
        self._cache.pop(key, None)
        self._timestamps.pop(key, None)
    
    def clear(self):
        """Clear entire cache"""
        self._cache.clear()
        self._timestamps.clear()
    
    def invalidate_pattern(self, pattern: str):
        """Invalidate all keys matching pattern"""
        keys_to_delete = [k for k in self._cache.keys() if pattern in k]
        for key in keys_to_delete:
            self.delete(key)

# Global cache instance
cache = SimpleCache()

def cache_key(*args, **kwargs) -> str:
    """Generate cache key from arguments"""
    key_data = f"{args}{kwargs}"
    return hashlib.md5(key_data.encode()).hexdigest()

def cached(ttl_seconds: int = 300, key_prefix: str = ""):
    """Decorator for caching function results"""
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            key = f"{key_prefix}:{func.__name__}:{cache_key(*args, **kwargs)}"
            
            # Try to get from cache
            cached_result = cache.get(key)
            if cached_result is not None:
                return cached_result
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Store in cache
            cache.set(key, result, ttl_seconds)
            
            return result
        
        return wrapper
    return decorator

# Convenience functions for endpoint caching
def cache_dashboard(username: str, data: dict):
    """Cache dashboard data"""
    cache.set(f"dashboard:{username}", data, ttl_seconds=60)

def get_cached_dashboard(username: str) -> Optional[dict]:
    """Get cached dashboard data"""
    return cache.get(f"dashboard:{username}")

def invalidate_user_cache(username: str):
    """Invalidate all cache for a user"""
    cache.invalidate_pattern(username)