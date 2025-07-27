from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Query, status
from core.auth import get_current_user_id
from db.crud.requests import teammate_request_crud
from core.logging_config import get_logger
from models.request import (
    TeammateRequestCreate,
    TeammateRequestUpdate,
    TeammateRequestPublic,
)
logger = get_logger(__name__)


router = APIRouter()


@router.post("/", response_model=TeammateRequestPublic, status_code=status.HTTP_201_CREATED)
async def create_teammate_request(
    request_data: TeammateRequestCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new teammate request"""
    try:
        request = await teammate_request_crud.create_request(request_data, user_id)
        return request
    except Exception as e:
        logger.error(f"Error creating teammate request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create teammate request"
        )


@router.get("/", response_model=dict)
async def get_teammate_requests(
    tags: Optional[List[str]] = Query(None),
    search: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    """Get teammate requests with optional filters"""
    try:
        return await teammate_request_crud.get_requests(
            tags=tags,
            search=search,
            project_id=project_id,
            page=page,
            limit=limit
        )
    except Exception as e:
        logger.error(f"Error fetching teammate requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch teammate requests"
        )


@router.get("/my", response_model=dict)
async def get_my_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user_id: str = Depends(get_current_user_id)
):
    """Get current user's teammate requests"""
    try:
        return await teammate_request_crud.get_user_requests(
            user_id=user_id,
            page=page,
            limit=limit
        )
    except Exception as e:
        logger.error(f"Error fetching user requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user requests"
        )


@router.get("/recent", response_model=List[TeammateRequestPublic])
async def get_recent_requests(
    limit: int = Query(10, ge=1, le=50)
):
    """Get recent teammate requests"""
    try:
        return await teammate_request_crud.get_recent_requests(limit=limit)
    except Exception as e:
        logger.error(f"Error fetching recent requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recent requests"
        )


@router.get("/by-tags", response_model=List[TeammateRequestPublic])
async def get_requests_by_tags(
    tags: List[str] = Query(...),
    limit: int = Query(10, ge=1, le=50)
):
    """Get teammate requests by specific tags"""
    try:
        return await teammate_request_crud.get_requests_by_tags(
            tags=tags,
            limit=limit
        )
    except Exception as e:
        logger.error(f"Error fetching requests by tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch requests by tags"
        )


@router.get("/project/{project_id}", response_model=dict)
async def get_project_requests(
    project_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    """Get teammate requests for a specific project"""
    try:
        return await teammate_request_crud.get_requests_by_project(
            project_id=project_id,
            page=page,
            limit=limit
        )
    except Exception as e:
        logger.error(f"Error fetching project requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch project requests"
        )


@router.get("/{request_id}", response_model=TeammateRequestPublic)
async def get_teammate_request(request_id: str):
    """Get a specific teammate request by ID"""
    try:
        request = await teammate_request_crud.get_request_by_id(request_id)
        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teammate request not found"
            )
        return request
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching teammate request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch teammate request"
        )


@router.put("/{request_id}", response_model=TeammateRequestPublic)
async def update_teammate_request(
    request_id: str,
    update_data: TeammateRequestUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a teammate request (only by owner)"""
    try:
        return await teammate_request_crud.update_request(
            request_id=request_id,
            update_data=update_data,
            user_id=user_id
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating teammate request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update teammate request"
        )


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_teammate_request(
    request_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a teammate request (only by owner)"""
    try:
        success = await teammate_request_crud.delete_request(
            request_id=request_id,
            user_id=user_id
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teammate request not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting teammate request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete teammate request"
        )