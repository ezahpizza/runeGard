from typing import Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from .shared import TimeStampMixin


class TestimonialBase(BaseModel):
    content: str = Field(..., min_length=10, max_length=500)
    
    @field_validator('content')
    @classmethod
    def validate_content(cls, v):
        return v.strip()


class TestimonialCreate(TestimonialBase):
    to_user: str = Field(..., description="User ID receiving the testimonial")


class TestimonialUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=10, max_length=500)
    
    @field_validator('content')
    @classmethod
    def validate_content(cls, v):
        if v:
            return v.strip()
        return v


class Testimonial(TestimonialBase, TimeStampMixin):
    id: Optional[str] = Field(None, alias="_id")
    from_user: str = Field(..., description="User ID giving the testimonial")
    to_user: str = Field(..., description="User ID receiving the testimonial")
    
    class Config:
        from_attributes = True
        populate_by_name = True


class TestimonialPublic(BaseModel):
    id: str
    from_user: str
    to_user: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class TestimonialWithUser(BaseModel):
    id: str
    from_user: str
    from_user_name: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True