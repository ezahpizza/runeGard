from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from .shared import TimeStampMixin


class TeammateRequestBase(BaseModel):
    looking_for: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=1000)
    project_id: Optional[str] = None
    tags: List[str] = Field(default_factory=list, max_items=10)
    
    @field_validator('looking_for', 'description')
    @classmethod
    def validate_strings(cls, v):
        return v.strip()
    
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        return [tag.strip() for tag in v if tag.strip()]


class TeammateRequestCreate(TeammateRequestBase):
    pass


class TeammateRequestUpdate(BaseModel):
    looking_for: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    tags: Optional[List[str]] = Field(None, max_items=10)
    
    @field_validator('looking_for', 'description')
    @classmethod
    def validate_strings(cls, v):
        if v:
            return v.strip()
        return v
    
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        if v is not None:
            return [tag.strip() for tag in v if tag.strip()]
        return v


class TeammateRequest(TeammateRequestBase, TimeStampMixin):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str = Field(..., description="User ID of requester")
    
    class Config:
        from_attributes = True
        populate_by_name = True


class TeammateRequestPublic(BaseModel):
    id: str
    user_id: str
    looking_for: str
    description: str
    project_id: Optional[str] = None
    tags: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class TeammateRequestSummary(BaseModel):
    id: str
    user_id: str
    looking_for: str
    tags: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True