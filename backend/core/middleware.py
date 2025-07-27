import logging
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from core.config import settings

logger = logging.getLogger(__name__)

# Create rate limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_REQUESTS}/{settings.RATE_LIMIT_WINDOW}seconds"]
)

def setup_rate_limiting(app):
    """Setup rate limiting for the FastAPI app"""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)
    
    if settings.is_development:
        logger.info(f"Rate limiting configured: {settings.RATE_LIMIT_REQUESTS} requests per {settings.RATE_LIMIT_WINDOW}s")

# Rate limit decorators for different endpoints
def standard_rate_limit():
    """Standard rate limit for most endpoints"""
    return limiter.limit(f"{settings.RATE_LIMIT_REQUESTS}/{settings.RATE_LIMIT_WINDOW}seconds")

def auth_rate_limit():
    """Stricter rate limit for authentication endpoints"""
    auth_limit = max(10, settings.RATE_LIMIT_REQUESTS // 10)  # 10x stricter
    return limiter.limit(f"{auth_limit}/{settings.RATE_LIMIT_WINDOW}seconds")

def create_rate_limit():
    """Rate limit for resource creation endpoints"""
    create_limit = max(20, settings.RATE_LIMIT_REQUESTS // 5)  # 5x stricter
    return limiter.limit(f"{create_limit}/{settings.RATE_LIMIT_WINDOW}seconds")

def search_rate_limit():
    """Rate limit for search endpoints"""
    search_limit = max(30, settings.RATE_LIMIT_REQUESTS // 3)  # 3x stricter
    return limiter.limit(f"{search_limit}/{settings.RATE_LIMIT_WINDOW}seconds")
