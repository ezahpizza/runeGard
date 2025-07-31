from fastapi import APIRouter, HTTPException, Depends, Query, status
from core.auth import get_current_user_id
from db.crud.testimonials import testimonial_crud
from core.logging_config import get_logger

from models.testimonial import (
    TestimonialCreate,
    TestimonialUpdate,
    TestimonialPublic
)

logger = get_logger(__name__)

router = APIRouter()


@router.post("/", response_model=TestimonialPublic, status_code=status.HTTP_201_CREATED)
async def create_testimonial(
    testimonial_data: TestimonialCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new testimonial"""
    try:
        testimonial = await testimonial_crud.create_testimonial(testimonial_data, user_id)
        return testimonial
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating testimonial: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create testimonial"
        )


@router.get("/", response_model=dict)
async def get_all_testimonials(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    """Get all testimonials"""
    try:
        return await testimonial_crud.get_all_testimonials(
            page=page,
            limit=limit
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching testimonials: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch testimonials"
        )


@router.get("/my", response_model=dict)
async def get_my_testimonials(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user_id: str = Depends(get_current_user_id)
):
    """Get testimonials created by the current user"""
    try:
        return await testimonial_crud.get_testimonials_by_author(
            author_user_id=user_id,
            page=page,
            limit=limit
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching my testimonials: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch my testimonials"
        )


@router.get("/project/{project_id}", response_model=dict)
async def get_project_testimonials(
    project_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    """Get testimonials for a specific project"""
    try:
        return await testimonial_crud.get_testimonials_by_project(
            project_id=project_id,
            page=page,
            limit=limit
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching project testimonials: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch project testimonials"
        )


@router.get("/{testimonial_id}", response_model=TestimonialPublic)
async def get_testimonial(testimonial_id: str):
    """Get a specific testimonial by ID"""
    try:
        testimonial = await testimonial_crud.get_testimonial_by_id(testimonial_id)
        if not testimonial:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Testimonial not found"
            )
        return testimonial
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching testimonial: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch testimonial"
        )


@router.put("/{testimonial_id}", response_model=TestimonialPublic)
async def update_testimonial(
    testimonial_id: str,
    update_data: TestimonialUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a testimonial (only by author)"""
    try:
        return await testimonial_crud.update_testimonial(
            testimonial_id=testimonial_id,
            update_data=update_data,
            user_id=user_id
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating testimonial: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update testimonial"
        )


@router.delete("/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_testimonial(
    testimonial_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a testimonial (only by author)"""
    try:
        success = await testimonial_crud.delete_testimonial(
            testimonial_id=testimonial_id,
            user_id=user_id
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Testimonial not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting testimonial: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete testimonial"
        )