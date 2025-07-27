import jwt
from typing import Optional
from core.config import settings
from core.logging_config import get_logger
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions

logger = get_logger("core.auth")

_clerk = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)
_security = HTTPBearer(auto_error=False)

class AuthenticationError(HTTPException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


async def verify_clerk_token(token: str) -> dict:
    try:
        # Authenticate the request using Clerk
        request = httpx.Request(
            method="GET",
            url="https://api.clerk.com/v1/users/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        request_state = _clerk.authenticate_request(
            request,
            AuthenticateRequestOptions()
        )

        if not getattr(request_state, "is_signed_in", False):
            raise AuthenticationError("Invalid or expired token")

        # Extract user_id from JWT claims directly (single step, no fallbacks)
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = payload.get("user_id")
        except Exception:
            user_id = None

        if not user_id:
            raise AuthenticationError("Could not extract user_id from JWT claims")

        user = _clerk.users.get(user_id=user_id)

        return {
            "user_id": user.id,
            "email": user.email_addresses[0].email_address if user.email_addresses else None,
            "name": f"{user.first_name or ''} {user.last_name or ''}".strip() or None,
        }

    except Exception as e:
        logger.error(f"Clerk authentication error: {e}")
        raise AuthenticationError("Invalid or expired token")


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_security)
) -> dict:

    if not credentials or not credentials.credentials:
        raise AuthenticationError("Missing or invalid token")

    user_data = await verify_clerk_token(credentials.credentials)
    logger.info(f"Auth Debug - Current user from token: {user_data}")
    return user_data


async def get_current_user_id(current_user: dict = Depends(get_current_user)) -> str:
    return current_user["user_id"]
