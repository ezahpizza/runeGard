from fastapi import Depends, HTTPException, status
from core.auth import get_current_user_id
from db.crud.users import user_crud
from models.user import User


async def get_current_user_profile(
    current_user_id: str = Depends(get_current_user_id)
) -> User:

    user = await user_crud.get_user_by_id(current_user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please initialize your profile first."
        )
    return user


async def verify_user_exists(user_id: str) -> bool:
    user = await user_crud.get_user_by_id(user_id)
    return user is not None