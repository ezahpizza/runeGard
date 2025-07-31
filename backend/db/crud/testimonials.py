from typing import Optional, Dict, Any
from datetime import datetime, timezone
from pymongo.errors import DuplicateKeyError
from fastapi import HTTPException, status
from db.mongo import mongodb
from core.utils import validate_object_id, utc_now
from core.controller import to_model, execute_paginated_query
from core.logging_config import get_logger
from models.testimonial import TestimonialCreate, TestimonialUpdate, Testimonial, TestimonialWithUser, TestimonialWithProject

logger = get_logger(__name__)


class TestimonialCRUD:

    async def create_testimonial(self, testimonial_data: TestimonialCreate, from_user: str) -> Testimonial:
        """Create a new testimonial"""
        try:
            # Validate that the project exists
            project_object_id = validate_object_id(testimonial_data.project_id)
            project = await mongodb.projects.find_one({"_id": project_object_id})
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found"
                )
            
            # Check if user already left a testimonial for this project
            existing_testimonial = await mongodb.testimonials.find_one({
                "from_user": from_user,
                "project_id": testimonial_data.project_id
            })
            if existing_testimonial:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="You have already left a testimonial for this project"
                )
            
            # Create testimonial document
            testimonial_doc = {
                "from_user": from_user,
                "project_id": testimonial_data.project_id,
                "content": testimonial_data.content,
                "created_at": utc_now()
            }
            
            result = await mongodb.testimonials.insert_one(testimonial_doc)
            
            created_testimonial = await mongodb.testimonials.find_one({"_id": result.inserted_id})
            return to_model(Testimonial, created_testimonial)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating testimonial: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create testimonial"
            )

    async def get_testimonial_by_id(self, testimonial_id: str) -> Optional[Testimonial]:
        """Get testimonial by ID"""
        try:
            object_id = validate_object_id(testimonial_id)
            testimonial = await mongodb.testimonials.find_one({"_id": object_id})
            return to_model(Testimonial, testimonial) if testimonial else None
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching testimonial {testimonial_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch testimonial"
            )

    async def get_all_testimonials(self, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get all testimonials with pagination"""
        try:
            query = {}
            result = await execute_paginated_query(
                mongodb.testimonials, query, 
                sort_options={"created_at": -1}, 
                page=page, limit=limit
            )
            
            testimonials_with_info = []
            for testimonial in result["documents"]:
                from_user = await mongodb.users.find_one({"user_id": testimonial["from_user"]})
                from_user_name = from_user.get("name", "Unknown User") if from_user else "Unknown User"
                
                testimonial_with_user = TestimonialWithUser(
                    id=testimonial["id"],
                    from_user=testimonial["from_user"],
                    from_user_name=from_user_name,
                    project_id=testimonial["project_id"],
                    content=testimonial["content"],
                    created_at=testimonial["created_at"]
                )
                testimonials_with_info.append(testimonial_with_user)
            
            return {
                "testimonials": testimonials_with_info,
                "total": result["total"],
                "page": result["page"],
                "pages": result["pages"],
                "limit": result["limit"]
            }
            
        except Exception as e:
            logger.error(f"Error fetching testimonials: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch testimonials"
            )

    async def get_testimonials_by_author(self, author_user_id: str, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get testimonials created by a specific user"""
        try:
            query = {"from_user": author_user_id}
            result = await execute_paginated_query(
                mongodb.testimonials, query, 
                sort_options={"created_at": -1}, 
                page=page, limit=limit
            )
            
            # Enrich testimonials with project information
            testimonials_with_info = []
            for testimonial in result["documents"]:
                # Get project info
                project = await mongodb.projects.find_one({"_id": validate_object_id(testimonial["project_id"])})
                project_title = project.get("title", "Unknown Project") if project else "Unknown Project"
                
                # Get user info
                from_user = await mongodb.users.find_one({"user_id": testimonial["from_user"]})
                from_user_name = from_user.get("name", "Unknown User") if from_user else "Unknown User"
                
                testimonial_with_project = TestimonialWithProject(
                    id=testimonial["id"],
                    from_user=testimonial["from_user"],
                    from_user_name=from_user_name,
                    project_id=testimonial["project_id"],
                    project_title=project_title,
                    content=testimonial["content"],
                    created_at=testimonial["created_at"]
                )
                testimonials_with_info.append(testimonial_with_project)
            
            return {
                "testimonials": testimonials_with_info,
                "total": result["total"],
                "page": result["page"],
                "pages": result["pages"],
                "limit": result["limit"]
            }
            
        except Exception as e:
            logger.error(f"Error fetching author testimonials: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch author testimonials"
            )

    async def get_testimonials_by_project(self, project_id: str, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get testimonials for a specific project"""
        try:
            # Validate that the project exists
            project_object_id = validate_object_id(project_id)
            project = await mongodb.projects.find_one({"_id": project_object_id})
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found"
                )
            
            query = {"project_id": project_id}
            result = await execute_paginated_query(
                mongodb.testimonials, query, 
                sort_options={"created_at": -1}, 
                page=page, limit=limit
            )
            
            testimonials_with_info = []
            for testimonial in result["documents"]:
                from_user = await mongodb.users.find_one({"user_id": testimonial["from_user"]})
                from_user_name = from_user.get("name", "Unknown User") if from_user else "Unknown User"
                
                testimonial_with_user = TestimonialWithUser(
                    id=testimonial["id"],
                    from_user=testimonial["from_user"],
                    from_user_name=from_user_name,
                    project_id=testimonial["project_id"],
                    content=testimonial["content"],
                    created_at=testimonial["created_at"]
                )
                testimonials_with_info.append(testimonial_with_user)
            
            return {
                "testimonials": testimonials_with_info,
                "total": result["total"],
                "page": result["page"],
                "pages": result["pages"],
                "limit": result["limit"]
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching project testimonials: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch project testimonials"
            )

    async def update_testimonial(self, testimonial_id: str, update_data: TestimonialUpdate, user_id: str) -> Testimonial:
        """Update testimonial (only by author)"""
        try:
            object_id = validate_object_id(testimonial_id)
            
            # Check if user is the author
            testimonial = await mongodb.testimonials.find_one({"_id": object_id})
            if not testimonial:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Testimonial not found"
                )
            
            if testimonial["from_user"] != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only testimonial author can update it"
                )
            
            update_dict = {}
            if update_data.content is not None:
                update_dict["content"] = update_data.content
            
            if not update_dict:
                return to_model(Testimonial, testimonial)
            
            update_dict["updated_at"] = utc_now()
            
            result = await mongodb.testimonials.update_one(
                {"_id": object_id},
                {"$set": update_dict}
            )
            
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Testimonial not found"
                )
            
            updated_testimonial = await mongodb.testimonials.find_one({"_id": object_id})
            return to_model(Testimonial, updated_testimonial)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating testimonial {testimonial_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update testimonial"
            )

    async def delete_testimonial(self, testimonial_id: str, user_id: str) -> bool:
        """Delete testimonial (only by author)"""
        try:
            object_id = validate_object_id(testimonial_id)
            
            # Check if user is the author
            testimonial = await mongodb.testimonials.find_one({"_id": object_id})
            if not testimonial:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Testimonial not found"
                )
            
            if testimonial["from_user"] != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only testimonial author can delete it"
                )
            
            result = await mongodb.testimonials.delete_one({"_id": object_id})
            return result.deleted_count > 0
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting testimonial {testimonial_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete testimonial"
            )

# Global instance
testimonial_crud = TestimonialCRUD()