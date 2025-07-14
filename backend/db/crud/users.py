import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from pymongo.errors import DuplicateKeyError
from fastapi import HTTPException, status
from db.mongo import mongodb
from core.utils import convert_objectid_to_str, paginate_query
from models.user import UserCreate, UserUpdate, UserInit, User, UserPublic

logger = logging.getLogger(__name__)


class UserCRUD:
    def __init__(self):
        self.collection = mongodb.users

    async def create_user(self, user_data: UserCreate, user_id: str) -> User:
        """Create a new user profile"""
        try:
            # Convert Pydantic model to dict and add required fields
            user_dict = user_data.model_dump()
            user_dict["user_id"] = user_id
            user_dict["created_at"] = datetime.utcnow()
            user_dict["updated_at"] = datetime.utcnow()
            user_dict["active"] = True
            
            result = await self.collection.insert_one(user_dict)
            
            # Retrieve and return the created user
            created_user = await self.collection.find_one({"_id": result.inserted_id})
            return User(**convert_objectid_to_str(created_user))
            
        except DuplicateKeyError as e:
            detail = "User already exists" if "user_id" in str(e) else "Email already registered"
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )

    async def init_user(self, user_data: UserInit, user_id: str, email: str) -> User:
        """Initialize user profile on first login"""
        try:
            user_dict = user_data.model_dump()
            user_dict["user_id"] = user_id
            user_dict["email"] = email
            user_dict["created_at"] = datetime.utcnow()
            user_dict["updated_at"] = datetime.utcnow()
            user_dict["active"] = True
            
            result = await self.collection.insert_one(user_dict)
            created_user = await self.collection.find_one({"_id": result.inserted_id})
            return User(**convert_objectid_to_str(created_user))
            
        except DuplicateKeyError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already initialized"
            )
        except Exception as e:
            logger.error(f"Error initializing user: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to initialize user"
            )

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by Clerk user_id"""
        try:
            user = await self.collection.find_one({
                "user_id": user_id,
                "active": {"$ne": False}
            })
            return User(**convert_objectid_to_str(user)) if user else None
        except Exception as e:
            logger.error(f"Error fetching user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch user"
            )

    async def get_user_public(self, user_id: str) -> Optional[UserPublic]:
        """Get public user profile"""
        try:
            user = await self.collection.find_one({
                "user_id": user_id,
                "active": {"$ne": False}
            })
            return UserPublic(**convert_objectid_to_str(user)) if user else None
        except Exception as e:
            logger.error(f"Error fetching public user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch user"
            )

    async def update_user(self, user_id: str, update_data: UserUpdate) -> User:
        """Update user profile"""
        try:
            # Convert to dict and filter out None values
            update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
            
            if not update_dict:
                # No updates to apply, return current user
                return await self.get_user_by_id(user_id)
            
            update_dict["updated_at"] = datetime.utcnow()
            
            result = await self.collection.update_one(
                {"user_id": user_id, "active": {"$ne": False}},
                {"$set": update_dict}
            )
            
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            return await self.get_user_by_id(user_id)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user"
            )

    async def delete_user(self, user_id: str) -> bool:
        """Soft delete user"""
        try:
            result = await self.collection.update_one(
                {"user_id": user_id},
                {"$set": {"active": False, "deleted_at": datetime.utcnow()}}
            )
            return result.matched_count > 0
        except Exception as e:
            logger.error(f"Error deleting user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete user"
            )

    async def search_users(
        self,
        search_term: Optional[str] = None,
        skills: Optional[List[str]] = None,
        institute: Optional[str] = None,
        grad_year: Optional[int] = None,
        page: int = 1,
        limit: int = 10
    ) -> Dict[str, Any]:
        """Search users with filters and pagination"""
        try:
            query = {"active": {"$ne": False}}
            
            # Build search query
            if search_term:
                query["$or"] = [
                    {"name": {"$regex": search_term, "$options": "i"}},
                    {"bio": {"$regex": search_term, "$options": "i"}},
                    {"skills": {"$regex": search_term, "$options": "i"}}
                ]
            
            # Apply filters
            if skills:
                query["skills"] = {"$in": skills}
            if institute:
                query["institute"] = institute
            if grad_year:
                query["grad_year"] = grad_year
            
            # Pagination
            pagination = paginate_query(page, limit)
            
            # Execute query
            cursor = self.collection.find(query)
            total = await self.collection.count_documents(query)
            
            users = await cursor.skip(pagination["skip"]).limit(pagination["limit"]).to_list(length=None)
            
            # Convert to UserPublic models
            users = [UserPublic(**convert_objectid_to_str(user)) for user in users]
            
            return {
                "users": users,
                "total": total,
                "page": pagination["page"],
                "pages": (total + pagination["limit"] - 1) // pagination["limit"],
                "limit": pagination["limit"]
            }
            
        except Exception as e:
            logger.error(f"Error searching users: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to search users"
            )

    async def get_users_by_ids(self, user_ids: List[str]) -> List[UserPublic]:
        """Get multiple users by their IDs"""
        try:
            cursor = self.collection.find({
                "user_id": {"$in": user_ids},
                "active": {"$ne": False}
            })
            
            users = await cursor.to_list(length=None)
            return [UserPublic(**convert_objectid_to_str(user)) for user in users]
            
        except Exception as e:
            logger.error(f"Error fetching users by IDs: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch users"
            )

    async def user_exists(self, user_id: str) -> bool:
        """Check if user exists and is active"""
        try:
            count = await self.collection.count_documents({
                "user_id": user_id,
                "active": {"$ne": False}
            })
            return count > 0
        except Exception as e:
            logger.error(f"Error checking user existence {user_id}: {e}")
            return False

    async def get_user_stats(self, user_id: str) -> Dict[str, int]:
        """Get user statistics"""
        try:
            projects_count = await mongodb.projects.count_documents({"created_by": user_id})
            contributed_count = await mongodb.projects.count_documents({
                "contributors": user_id,
                "created_by": {"$ne": user_id}
            })
            testimonials_count = await mongodb.testimonials.count_documents({"to_user": user_id})
            requests_count = await mongodb.teammate_requests.count_documents({"user_id": user_id})
            
            return {
                "projects_created": projects_count,
                "projects_contributed": contributed_count,
                "testimonials_received": testimonials_count,
                "teammate_requests": requests_count
            }
            
        except Exception as e:
            logger.error(f"Error fetching user stats {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch user statistics"
            )


# Global instance
user_crud = UserCRUD()