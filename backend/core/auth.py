import logging
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from clerk_backend_api import Clerk
from clerk_backend_api.security import authenticate_request
from clerk_backend_api.security.types import AuthenticateRequestOptions
from core.config import settings

logger = logging.getLogger(__name__)

# Initialize Clerk client
clerk = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)

# Security scheme for Bearer token
security = HTTPBearer()


class AuthenticationError(HTTPException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


async def verify_clerk_token(token: str) -> dict:
    try:
        request = httpx.Request(
            method="GET",
            url="https://api.clerk.com/v1/users",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        request_state = clerk.authenticate_request(
            request, 
            AuthenticateRequestOptions()
        )
        
        if not request_state.is_signed_in:
            raise AuthenticationError("Invalid or expired token")
        
        user = await clerk.users.get(request_state.user_id)
        
        return {
            "user_id": user.id,
            "email": user.email_addresses[0].email_address if user.email_addresses else None,
            "name": f"{user.first_name or ''} {user.last_name or ''}".strip() or None,
        }
        
    except Exception as e:
        logger.error(f"Clerk authentication error: {e}")
        raise AuthenticationError("Invalid or expired token")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials:
        raise AuthenticationError("No authentication credentials provided")
    
    token = credentials.credentials
    if not token:
        raise AuthenticationError("No token provided")
    
    user_data = await verify_clerk_token(token)
    return user_data


async def get_current_user_id(current_user: dict = Depends(get_current_user)) -> str:

    return current_user["user_id"]