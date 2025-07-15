from typing import Optional
from core.config import settings
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
import httpx
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions

logger = logging.getLogger(__name__)
clerk = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)
security = HTTPBearer(auto_error=False)  

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
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> dict:
    if settings.ENVIRONMENT == "development":
        return {
            "user_id": "mock_user_123",
            "email": "mock_user@fakemail.com",
            "name": "Test User"
        }

    if not credentials or not credentials.credentials:
        raise AuthenticationError("Missing or invalid token")

    return await verify_clerk_token(credentials.credentials)

async def get_current_user_id(current_user: dict = Depends(get_current_user)) -> str:
    return current_user["user_id"]
