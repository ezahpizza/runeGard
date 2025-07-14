from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, HttpUrl
from datetime import datetime
from .shared import TimeStampMixin, ProjectStatus


class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    abstract: str = Field(..., min_length=10, max_length=2000)
    tech_stack: List[str] = Field(..., min_items=1, max_items=20)
    github_link: HttpUrl
    demo_link: Optional[HttpUrl] = None
    report_url: Optional[HttpUrl] = None
    contributors: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list, max_items=10)
    status: ProjectStatus = Field(default=ProjectStatus.OPEN)
    
    @field_validator('tech_stack', 'tags', 'contributors')
    @classmethod
    def validate_arrays(cls, v):
        return [item.strip() for item in v if item.strip()]
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        return v.strip()
    
    @field_validator('abstract')
    @classmethod
    def validate_abstract(cls, v):
        return v.strip()


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    abstract: Optional[str] = Field(None, min_length=10, max_length=2000)
    tech_stack: Optional[List[str]] = Field(None, min_items=1, max_items=20)
    github_link: Optional[HttpUrl] = None
    demo_link: Optional[HttpUrl] = None
    report_url: Optional[HttpUrl] = None
    contributors: Optional[List[str]] = None
    tags: Optional[List[str]] = Field(None, max_items=10)
    status: Optional[ProjectStatus] = None
    
    @field_validator('tech_stack', 'tags', 'contributors')
    @classmethod
    def validate_arrays(cls, v):
        if v is not None:
            return [item.strip() for item in v if item.strip()]
        return v
    
    @field_validator('title', 'abstract')
    @classmethod
    def validate_strings(cls, v):
        if v:
            return v.strip()
        return v


class Project(ProjectBase, TimeStampMixin):
    id: Optional[str] = Field(None, alias="_id")
    created_by: str = Field(..., description="User ID of project creator")
    upvotes: int = Field(default=0, ge=0)
    featured: bool = Field(default=False)
    upvoted_by: List[str] = Field(default_factory=list)
    
    class Config:
        from_attributes = True
        populate_by_name = True


class ProjectPublic(BaseModel):
    id: str
    title: str
    abstract: str
    tech_stack: List[str]
    github_link: str
    demo_link: Optional[str] = None
    report_url: Optional[str] = None
    created_by: str
    contributors: List[str]
    tags: List[str]
    status: ProjectStatus
    upvotes: int
    featured: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProjectSummary(BaseModel):
    id: str
    title: str
    abstract: str
    tech_stack: List[str]
    created_by: str
    upvotes: int
    featured: bool
    status: ProjectStatus
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProjectUpvote(BaseModel):
    project_id: str
    upvoted: bool
    upvotes_count: int