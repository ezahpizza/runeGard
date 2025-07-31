from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from pymongo.errors import DuplicateKeyError
from fastapi import HTTPException, status
from db.mongo import mongodb
from core.utils import utc_now
from core.controller import to_model, to_model_list, execute_paginated_query
from core.logging_config import get_logger
from models.user import UserUpdate, UserInit, User, UserPublic

logger = get_logger(__name__)


class UserCRUD:

    async def init_user(self, user_data: UserInit, user_id: str, email: str) -> User:
        """Initialize user profile on first login"""
        try:
            user_dict = user_data.model_dump()
            user_dict["user_id"] = user_id
            user_dict["email"] = email
            user_dict["created_at"] = utc_now()
            user_dict["updated_at"] = utc_now()
            user_dict["active"] = True
            result = await mongodb.users.insert_one(user_dict)
            created_user = await mongodb.users.find_one({"_id": result.inserted_id})
            # Ensure created_at and updated_at are valid datetimes and format as ISO 8601 Z
            for field in ("created_at", "updated_at"):
                if field in created_user:
                    dt = created_user[field]
                    if not isinstance(dt, datetime):
                        try:
                            dt = datetime.fromisoformat(dt)
                        except Exception:
                            dt = utc_now()
                    # Format as strict ISO 8601 with Z
                    created_user[field] = dt.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
            return to_model(User, created_user)
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
            user = await mongodb.users.find_one({
                "user_id": user_id,
                "active": {"$ne": False}
            })
            if user:
                for field in ("created_at", "updated_at"):
                    if field in user:
                        dt = user[field]
                        if not isinstance(dt, datetime):
                            try:
                                dt = datetime.fromisoformat(dt)
                            except Exception:
                                dt = utc_now()
                        user[field] = dt.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
                return to_model(User, user)
            return None
        except Exception as e:
            logger.error(f"Error fetching user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch user"
            )

    async def get_user_public(self, user_id: str) -> Optional[UserPublic]:
        """Get public user profile"""
        try:
            user = await mongodb.users.find_one({
                "user_id": user_id,
                "active": {"$ne": False}
            })
            if user:
                for field in ("created_at", "updated_at"):
                    if field in user:
                        dt = user[field]
                        if not isinstance(dt, datetime):
                            try:
                                dt = datetime.fromisoformat(dt)
                            except Exception:
                                dt = utc_now()
                        user[field] = dt.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
                return to_model(UserPublic, user)
            return None
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
            
            update_dict["updated_at"] = utc_now()
            
            result = await mongodb.users.update_one(
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
        """Hard delete user and all associated records"""
        try:
            # Delete user's projects
            await mongodb.projects.delete_many({"created_by": user_id})
            
            # Remove user from contributors in other projects
            await mongodb.projects.update_many(
                {"contributors": user_id},
                {"$pull": {"contributors": user_id}}
            )
            
            # Delete user's testimonials (given by this user)
            await mongodb.testimonials.delete_many({"from_user": user_id})
            
            # Delete user's teammate requests
            await mongodb.teammate_requests.delete_many({
                "$or": [
                    {"user_id": user_id},
                    {"requested_by": user_id}
                ]
            })
            
            # Finally, delete the user record
            result = await mongodb.users.delete_one({"user_id": user_id})
            
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"Error hard deleting user {user_id}: {e}")
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
            
            # Use standardized paginated query
            result = await execute_paginated_query(mongodb.users, query, page=page, limit=limit)
            users_public = to_model_list(UserPublic, result["documents"])
            
            return {
                "users": users_public,
                "total": result["total"],
                "page": result["page"],
                "pages": result["pages"],
                "limit": result["limit"]
            }
            
        except Exception as e:
            logger.error(f"Error searching users: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to search users"
            )

    async def user_exists(self, user_id: str) -> bool:
        """Check if user exists and is active"""
        try:
            count = await mongodb.users.count_documents({
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
            testimonials_count = await mongodb.testimonials.count_documents({"from_user": user_id})
            requests_count = await mongodb.teammate_requests.count_documents({"user_id": user_id})
            
            return {
                "projects_created": projects_count,
                "projects_contributed": contributed_count,
                "testimonials_given": testimonials_count,
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