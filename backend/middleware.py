# backend/middleware.py
from fastapi import Request, HTTPException
from datetime import datetime, timedelta
from collections import defaultdict
import time
import functools
from typing import Dict, Tuple

# In-memory rate limiter (use Redis in production)
class RateLimiter:
    def __init__(self):
        self.requests: Dict[str, list] = defaultdict(list)
        self.cleanup_interval = 60  # Cleanup old entries every 60 seconds
        self.last_cleanup = time.time()
    
    def is_allowed(self, key: str, max_requests: int = 100, window: int = 60) -> Tuple[bool, int]:
        """
        Check if request is allowed.
        Returns: (is_allowed, remaining_requests)
        """
        current_time = time.time()
        
        # Periodic cleanup
        if current_time - self.last_cleanup > self.cleanup_interval:
            self.cleanup()
        
        # Get requests for this key
        requests = self.requests[key]
        
        # Remove old requests outside the window
        cutoff_time = current_time - window
        requests = [req_time for req_time in requests if req_time > cutoff_time]
        self.requests[key] = requests
        
        # Check if under limit
        if len(requests) < max_requests:
            requests.append(current_time)
            return True, max_requests - len(requests)
        
        return False, 0
    
    def cleanup(self):
        """Remove old entries to prevent memory leak"""
        current_time = time.time()
        keys_to_delete = []
        
        for key, requests in self.requests.items():
            # Remove requests older than 5 minutes
            self.requests[key] = [r for r in requests if current_time - r < 300]
            
            # Mark for deletion if empty
            if not self.requests[key]:
                keys_to_delete.append(key)
        
        for key in keys_to_delete:
            del self.requests[key]
        
        self.last_cleanup = current_time

rate_limiter = RateLimiter()

async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware"""
    
    # Get client identifier (IP or user ID)
    client_id = request.client.host if request.client else "unknown"
    
    # Skip rate limiting for certain paths
    skip_paths = ["/", "/docs", "/redoc", "/openapi.json"]
    if request.url.path in skip_paths:
        return await call_next(request)
    
    # Different limits for different endpoints
    if "chat" in request.url.path or "analyze" in request.url.path:
        max_requests, window = 10, 60  # 10 requests per minute for AI endpoints
    else:
        max_requests, window = 100, 60  # 100 requests per minute for other endpoints
    
    is_allowed, remaining = rate_limiter.is_allowed(
        f"{client_id}:{request.url.path}",
        max_requests,
        window
    )
    
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please slow down.",
            headers={"Retry-After": str(window)}
        )
    
    response = await call_next(request)
    
    # Add rate limit headers
    response.headers["X-RateLimit-Limit"] = str(max_requests)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    
    return response


# Simple cache decorator
cache_store: Dict[str, Tuple[any, float]] = {}

def cache_response(ttl: int = 300):
    """Cache decorator with TTL in seconds"""
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Create cache key
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Check cache
            if cache_key in cache_store:
                cached_value, timestamp = cache_store[cache_key]
                if time.time() - timestamp < ttl:
                    return cached_value
            
            # Call function and cache result
            result = await func(*args, **kwargs)
            cache_store[cache_key] = (result, time.time())
            
            # Cleanup old cache entries (simple LRU)
            if len(cache_store) > 1000:
                oldest_keys = sorted(
                    cache_store.items(),
                    key=lambda x: x[1][1]
                )[:100]
                for key, _ in oldest_keys:
                    del cache_store[key]
            
            return result
        return wrapper
    return decorator
