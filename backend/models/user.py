from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, EmailStr
from datetime import datetime
from .shared import TimeStampMixin


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    bio: Optional[str] = Field(None, max_length=500)
    skills: List[str] = Field(default_factory=list)
    institute: str = Field(..., min_length=1, max_length=200)
    grad_year: int = Field(..., ge=2020, le=2030)
    
    @field_validator('skills')
    @classmethod
    def validate_skills(cls, v):
        if v and len(v) > 20:
            raise ValueError('Maximum 20 skills allowed')
        return [skill.strip() for skill in v if skill.strip()]
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        return v.strip()
    
    @field_validator('institute')
    @classmethod
    def validate_institute(cls, v):
        return v.strip()


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    skills: Optional[List[str]] = None
    institute: Optional[str] = Field(None, min_length=1, max_length=200)
    grad_year: Optional[int] = Field(None, ge=2020, le=2030)
    
    @field_validator('skills')
    @classmethod
    def validate_skills(cls, v):
        if v and len(v) > 20:
            raise ValueError('Maximum 20 skills allowed')
        return [skill.strip() for skill in v if skill.strip()]
    
    @field_validator('name', 'institute')
    @classmethod
    def validate_strings(cls, v):
        if v:
            return v.strip()
        return v


class UserInit(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    institute: str = Field(..., min_length=1, max_length=200)
    grad_year: int = Field(..., ge=2020, le=2030)
    skills: Optional[List[str]] = Field(default_factory=list)
    bio: Optional[str] = Field(None, max_length=500)
    
    @field_validator('skills')
    @classmethod
    def validate_skills(cls, v):
        if v and len(v) > 20:
            raise ValueError('Maximum 20 skills allowed')
        return [skill.strip() for skill in v if skill.strip()]
    
    @field_validator('name', 'institute')
    @classmethod
    def validate_strings(cls, v):
        return v.strip()


class User(UserBase, TimeStampMixin):
    user_id: str = Field(..., description="Clerk user ID")
    
    class Config:
        from_attributes = True


class UserPublic(BaseModel):
    user_id: str
    name: str
    bio: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    institute: str
    grad_year: int
    created_at: datetime
    
    class Config:
        from_attributes = True

