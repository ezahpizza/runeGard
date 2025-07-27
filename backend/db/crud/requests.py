from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from fastapi import HTTPException, status
from db.mongo import mongodb
from core.utils import validate_object_id, build_search_query, utc_now
from core.controller import to_model, to_model_list, execute_paginated_query
from core.logging_config import get_logger
from models.request import TeammateRequestCreate, TeammateRequestUpdate, TeammateRequest, TeammateRequestPublic, TeammateRequestPublic

logger = get_logger(__name__)


class TeammateRequestCRUD:

    async def create_request(self, request_data: TeammateRequestCreate, user_id: str) -> TeammateRequest:
        """Create a new teammate request"""
        try:
            request_dict = request_data.model_dump()
            request_dict["user_id"] = user_id
            request_dict["created_at"] = utc_now()
            
            result = await mongodb.teammate_requests.insert_one(request_dict)
            
            created_request = await mongodb.teammate_requests.find_one({"_id": result.inserted_id})
            return to_model(TeammateRequest, created_request)
            
        except Exception as e:
            logger.error(f"Error creating teammate request: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create teammate request"
            )

    async def get_request_by_id(self, request_id: str) -> Optional[TeammateRequest]:
        """Get teammate request by ID"""
        try:
            object_id = validate_object_id(request_id)
            request = await mongodb.teammate_requests.find_one({"_id": object_id})
            return to_model(TeammateRequest, request) if request else None
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching teammate request {request_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch teammate request"
            )

    async def get_requests(
        self,
        tags: Optional[List[str]] = None,
        search: Optional[str] = None,
        user_id: Optional[str] = None,
        project_id: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> Dict[str, Any]:
        """Get teammate requests with filters and pagination"""
        try:
            query = {}
            if tags:
                query["tags"] = {"$in": tags}
            if user_id:
                query["user_id"] = user_id
            if project_id:
                query["project_id"] = project_id
            if search:
                search_query = build_search_query(search, ["looking_for", "description"])
                query.update(search_query)
                
            result = await execute_paginated_query(
                mongodb.teammate_requests, query, 
                sort_options={"created_at": -1}, 
                page=page, limit=limit
            )
            public_requests = to_model_list(TeammateRequestPublic, result["documents"])
            
            return {
                "requests": public_requests,
                "total": result["total"],
                "page": result["page"],
                "pages": result["pages"],
                "limit": result["limit"]
            }
            
        except Exception as e:
            logger.error(f"Error fetching teammate requests: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch teammate requests"
            )

    async def get_user_requests(self, user_id: str, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get teammate requests created by a specific user"""
        try:
            query = {"user_id": user_id}
            result = await execute_paginated_query(
                mongodb.teammate_requests, query, 
                sort_options={"created_at": -1}, 
                page=page, limit=limit
            )
            public_requests = to_model_list(TeammateRequestPublic, result["documents"])
            
            return {
                "requests": public_requests,
                "total": result["total"],
                "page": result["page"],
                "pages": result["pages"],
                "limit": result["limit"]
            }
            
        except Exception as e:
            logger.error(f"Error fetching user requests: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch user requests"
            )

    async def update_request(self, request_id: str, update_data: TeammateRequestUpdate, user_id: str) -> TeammateRequest:
        """Update teammate request (only by owner)"""
        try:
            object_id = validate_object_id(request_id)
            
            # Check ownership
            request = await mongodb.teammate_requests.find_one({"_id": object_id})
            if not request:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Teammate request not found"
                )
            
            if request["user_id"] != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only request owner can update the request"
                )
            
            # Convert to dict and filter out None values
            update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
            
            if not update_dict:
                return to_model(TeammateRequest, request)
            
            update_dict["updated_at"] = utc_now()
            
            result = await mongodb.teammate_requests.update_one(
                {"_id": object_id},
                {"$set": update_dict}
            )
            
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Teammate request not found"
                )
            
            updated_request = await mongodb.teammate_requests.find_one({"_id": object_id})
            return to_model(TeammateRequest, updated_request)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating teammate request {request_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update teammate request"
            )

    async def delete_request(self, request_id: str, user_id: str) -> bool:
        """Delete teammate request (only by owner)"""
        try:
            object_id = validate_object_id(request_id)
            
            # Check ownership
            request = await mongodb.teammate_requests.find_one({"_id": object_id})
            if not request:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Teammate request not found"
                )
            
            if request["user_id"] != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only request owner can delete the request"
                )
            
            result = await mongodb.teammate_requests.delete_one({"_id": object_id})
            return result.deleted_count > 0
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting teammate request {request_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete teammate request"
            )

    async def get_requests_by_project(self, project_id: str, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get teammate requests for a specific project"""
        try:
            # Validate project exists
            project = await mongodb.projects.find_one({"_id": validate_object_id(project_id)})
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found"
                )
            
            query = {"project_id": project_id}
            
            result = await execute_paginated_query(
                mongodb.teammate_requests, query, 
                sort_options={"created_at": -1}, 
                page=page, limit=limit
            )
            public_requests = to_model_list(TeammateRequestPublic, result["documents"])
            
            return {
                "requests": public_requests,
                "total": result["total"],
                "page": result["page"],
                "pages": result["pages"],
                "limit": result["limit"]
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching project requests: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch project requests"
            )

    async def get_recent_requests(self, limit: int = 10) -> List[TeammateRequestPublic]:
        """Get most recent teammate requests"""
        try:
            cursor = mongodb.teammate_requests.find({}).sort("created_at", -1).limit(limit)
            requests = await cursor.to_list(length=None)
            public_requests = to_model_list(TeammateRequestPublic, requests)
            return public_requests
            
        except Exception as e:
            logger.error(f"Error fetching recent requests: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch recent requests"
            )

    async def get_requests_by_tags(self, tags: List[str], limit: int = 10) -> List[TeammateRequestPublic]:
        """Get teammate requests matching specific tags"""
        try:
            query = {"tags": {"$in": tags}}
            cursor = mongodb.teammate_requests.find(query).sort("created_at", -1).limit(limit)
            requests = await cursor.to_list(length=None)
            public_requests = to_model_list(TeammateRequestPublic, requests)
            return public_requests
            
        except Exception as e:
            logger.error(f"Error fetching requests by tags: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch requests by tags"
            )


# Global instance
teammate_request_crud = TeammateRequestCRUD()