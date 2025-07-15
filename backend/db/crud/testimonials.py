import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from pymongo.errors import DuplicateKeyError
from fastapi import HTTPException, status
from db.mongo import mongodb
from core.utils import convert_objectid_to_str, validate_object_id, paginate_query
from core.controller import map_id_field, paginate_and_fetch
from models.testimonial import TestimonialCreate, TestimonialUpdate, Testimonial, TestimonialWithUser

logger = logging.getLogger(__name__)


class TestimonialCRUD:

    async def create_testimonial(self, testimonial_data: TestimonialCreate, from_user: str) -> Testimonial:
        """Create a new testimonial"""
        try:
            # Prevent self-testimonials
            if from_user == testimonial_data.to_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot create testimonial for yourself"
                )
            
            # Check if to_user exists
            to_user = await mongodb.users.find_one({"user_id": testimonial_data.to_user})
            if not to_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Target user not found"
                )
            
            # Create testimonial document
            testimonial_doc = {
                "from_user": from_user,
                "to_user": testimonial_data.to_user,
                "content": testimonial_data.content,
                "created_at": datetime.now(timezone.utc)
            }
            
            result = await mongodb.testimonials.insert_one(testimonial_doc)
            
            created_testimonial = await mongodb.testimonials.find_one({"_id": result.inserted_id})
            return Testimonial(**convert_objectid_to_str(created_testimonial))
            
        except DuplicateKeyError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already left a testimonial for this user"
            )
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
            return Testimonial(**map_id_field(testimonial)) if testimonial else None
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching testimonial {testimonial_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch testimonial"
            )

    async def get_user_testimonials(self, user_id: str, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get testimonials for a specific user with pagination"""
        try:
            # Verify user exists
            user = await mongodb.users.find_one({"user_id": user_id})
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            query = {"to_user": user_id}
            pagination = paginate_query(page, limit)
            
            cursor = mongodb.testimonials.find(query).sort("created_at", -1)
            total = await mongodb.testimonials.count_documents(query)
            
            testimonials = await paginate_and_fetch(cursor, pagination)
            
            enriched_testimonials = []
            for testimonial in testimonials:
                testimonial_data = map_id_field(testimonial)
                
                from_user = await mongodb.users.find_one({"user_id": testimonial["from_user"]})
                from_user_name = from_user.get("name", "Unknown User") if from_user else "Unknown User"
                
                testimonial_with_user = TestimonialWithUser(
                    id=testimonial_data["id"],
                    from_user=testimonial_data["from_user"],
                    from_user_name=from_user_name,
                    content=testimonial_data["content"],
                    created_at=testimonial_data["created_at"]
                )
                enriched_testimonials.append(testimonial_with_user)
            
            return {
                "testimonials": enriched_testimonials,
                "total": total,
                "page": pagination["page"],
                "pages": (total + pagination["limit"] - 1) // pagination["limit"],
                "limit": pagination["limit"]
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching user testimonials: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch user testimonials"
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
                return Testimonial(**convert_objectid_to_str(testimonial))
            
            update_dict["updated_at"] = datetime.now(timezone.utc)
            
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
            return Testimonial(**convert_objectid_to_str(updated_testimonial))
            
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

    async def check_testimonial_exists(self, from_user: str, to_user: str) -> bool:
        """Check if testimonial exists between two users"""
        try:
            count = await mongodb.testimonials.count_documents({
                "from_user": from_user,
                "to_user": to_user
            })
            return count > 0
            
        except Exception as e:
            logger.error(f"Error checking testimonial existence: {e}")
            return False

# Global instance
testimonial_crud = TestimonialCRUD()