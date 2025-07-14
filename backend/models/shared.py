from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum


class ProjectStatus(str, Enum):
    OPEN = "open"
    COMPLETED = "completed"


class SortBy(str, Enum):
    TRENDING = "trending"
    RECENT = "recent"
    UPVOTES = "upvotes"


class ResponseModel(BaseModel):
    success: bool = True
    message: str = "Operation successful"
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=100)


class PaginatedResponse(BaseModel):
    success: bool = True
    data: List[Any]
    pagination: dict = Field(default_factory=dict)
    total: int = 0
    page: int = 1
    limit: int = 10
    total_pages: int = 0


class FilterParams(BaseModel):
    tech_stack: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    status: Optional[ProjectStatus] = None
    search: Optional[str] = None
    sort: Optional[SortBy] = None
    
    @field_validator('tech_stack', 'tags', pre=True)
    @classmethod
    def split_comma_separated(cls, v):
        if isinstance(v, str):
            return [item.strip() for item in v.split(',') if item.strip()]
        return v


class TimeStampMixin(BaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None