from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from core.auth import get_current_user_id
from core.middleware import create_rate_limit, search_rate_limit
from db.crud.projects import project_crud
from models.project import (
    ProjectCreate, 
    ProjectUpdate, 
    Project, 
    ProjectSummary,
    ProjectUpvote
)

router = APIRouter()


@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
@create_rate_limit()
async def create_project(
    request: Request,
    project: ProjectCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Create a new project"""
    return await project_crud.create_project(project, current_user_id)


@router.get("/", response_model=dict)
@search_rate_limit()
async def get_projects(
    request: Request,
    tech_stack: Optional[List[str]] = Query(None),
    tags: Optional[List[str]] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    featured_only: bool = Query(False)
):
    """Get projects with filters and pagination"""
    return await project_crud.get_projects(
        tech_stack=tech_stack,
        tags=tags,
        status=status,
        search=search,
        sort=sort,
        page=page,
        limit=limit,
        featured_only=featured_only
    )


@router.get("/trending", response_model=List[ProjectSummary])
async def get_trending_projects(
    limit: int = Query(10, ge=1, le=50)
):
    """Get trending projects"""
    return await project_crud.get_trending_projects(limit)


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Get a specific project by ID"""
    project = await project_crud.get_project_by_id(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update a project (only by owner)"""
    return await project_crud.update_project(
        project_id, 
        project_update, 
        current_user_id
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Delete a project (only by owner)"""
    success = await project_crud.delete_project(project_id, current_user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )


@router.post("/{project_id}/upvote", response_model=ProjectUpvote)
async def upvote_project(
    project_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Upvote a project (toggle upvote/remove upvote)"""
    try:
        # Try to upvote
        updated_project = await project_crud.upvote_project(project_id, current_user_id)
        return ProjectUpvote(
            project_id=project_id,
            upvoted=True,
            upvotes_count=updated_project.upvotes
        )
    except HTTPException as e:
        if e.status_code == status.HTTP_409_CONFLICT:
            # Already upvoted, remove upvote
            updated_project = await project_crud.remove_upvote(project_id, current_user_id)
            return ProjectUpvote(
                project_id=project_id,
                upvoted=False,
                upvotes_count=updated_project.upvotes
            )
        raise


@router.post("/{project_id}/contributors/{contributor_id}", response_model=Project)
async def add_contributor(
    project_id: str,
    contributor_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Add contributor to project (only by owner)"""
    return await project_crud.add_contributor(
        project_id, 
        contributor_id, 
        current_user_id
    )