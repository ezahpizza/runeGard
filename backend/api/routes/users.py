from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from core.auth import get_current_user, get_current_user_id
from db.crud.users import user_crud
from db.crud.projects import project_crud
from models.user import User, UserInit, UserUpdate, UserPublic
from api.dependencies import get_current_user_profile

router = APIRouter()


@router.post("/init", response_model=User)
async def init_user(
    user_data: UserInit,
    current_user: dict = Depends(get_current_user)
):
    """Initialize user profile on first login"""
    existing_user = await user_crud.get_user_by_id(current_user["user_id"])
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already initialized"
        )
    
    return await user_crud.init_user(
        user_data, 
        current_user["user_id"], 
        current_user["email"]
    )


@router.get("/me", response_model=User)
async def get_current_user_profile_route(
    current_user: User = Depends(get_current_user_profile)
):
    """Get current user's profile"""
    return current_user

@router.delete("/me")
async def delete_current_user(
    current_user_id: str = Depends(get_current_user_id)
):
    """Delete current user and all associated data"""
    success = await user_crud.delete_user(current_user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "User deleted successfully"}

@router.put("/update", response_model=User)
async def update_user(
    update_data: UserUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update user profile"""
    return await user_crud.update_user(current_user_id, update_data)


@router.get("/{user_id}", response_model=UserPublic)
async def get_user_public(user_id: str):
    """Get public user profile"""
    user = await user_crud.get_user_public(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get("/{user_id}/projects")
async def get_user_projects(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50)
):
    """Get user's projects"""
    # Verify user exists
    if not await user_crud.user_exists(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return await project_crud.get_user_projects(user_id, page, limit)


@router.get("/{user_id}/stats")
async def get_user_stats(user_id: str):
    """Get user statistics"""
    if not await user_crud.user_exists(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return await user_crud.get_user_stats(user_id)


@router.get("/", response_model=dict)
async def search_users(
    search: Optional[str] = Query(None),
    skills: Optional[List[str]] = Query(None),
    institute: Optional[str] = Query(None),
    grad_year: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50)
):
    """Search users with filters"""
    return await user_crud.search_users(
        search_term=search,
        skills=skills,
        institute=institute,
        grad_year=grad_year,
        page=page,
        limit=limit
    )

