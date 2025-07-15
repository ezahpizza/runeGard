import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from db.mongo import mongodb
from core.utils import convert_objectid_to_str, validate_object_id, build_search_query, paginate_query
from core.controller import map_id_field, paginate_and_fetch
from models.project import ProjectCreate, ProjectUpdate, Project, ProjectSummary

logger = logging.getLogger(__name__)


class ProjectCRUD:
    
    async def create_project(self, project_data: ProjectCreate, user_id: str) -> Project:
        """Create a new project"""
        try:
            project_dict = project_data.model_dump()
            # Convert HttpUrl fields to str
            for url_field in ["github_link", "demo_link", "report_url"]:
                if url_field in project_dict and project_dict[url_field] is not None:
                    project_dict[url_field] = str(project_dict[url_field])
            # Convert status enum to str
            if "status" in project_dict and hasattr(project_dict["status"], "value"):
                project_dict["status"] = project_dict["status"].value

            project_dict.update({
                "created_by": user_id,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "upvotes": 0,
                "upvoted_by": [],
                "featured": False
            })
            if user_id not in project_dict["contributors"]:
                project_dict["contributors"].append(user_id)
            result = await mongodb.projects.insert_one(project_dict)
            created_project = await mongodb.projects.find_one({"_id": result.inserted_id})
            return Project(**convert_objectid_to_str(created_project))
        except Exception as e:
            logger.error(f"Error creating project: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create project"
            )

    async def get_project_by_id(self, project_id: str) -> Optional[Project]:
        """Get project by ID"""
        try:
            object_id = validate_object_id(project_id)
            project = await mongodb.projects.find_one({"_id": object_id})
            if not project:
                return None
            return Project(**convert_objectid_to_str(project))
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching project {project_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch project"
            )

    async def get_projects(
        self,
        tech_stack: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        sort: Optional[str] = None,
        page: int = 1,
        limit: int = 10,
        featured_only: bool = False
    ) -> Dict[str, Any]:
        """Get projects with filters and pagination"""
        try:
            query = self._build_query(tech_stack, tags, status, search, featured_only)
            sort_options = self._get_sort_options(sort)
            pagination = paginate_query(page, limit)
            cursor = mongodb.projects.find(query).sort(list(sort_options.items()))
            total = await mongodb.projects.count_documents(query)
            projects = await paginate_and_fetch(cursor, pagination)
            project_summaries = []
            for project in projects:
                project_data = map_id_field(project)
                project_summaries.append(ProjectSummary(**project_data))
            return {
                "projects": [p.model_dump() for p in project_summaries],
                "total": total,
                "page": pagination["page"],
                "pages": (total + pagination["limit"] - 1) // pagination["limit"],
                "limit": pagination["limit"]
            }
        except Exception as e:
            logger.error(f"Error fetching projects: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch projects"
            )

    async def get_trending_projects(self, limit: int = 10) -> List[ProjectSummary]:
        """Get trending projects based on upvotes and recency"""
        try:
            thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
            pipeline = [
                {"$match": {"created_at": {"$gte": thirty_days_ago}}},
                {
                    "$addFields": {
                        "trending_score": {
                            "$add": [
                                {"$multiply": ["$upvotes", 2]},
                                {
                                    "$divide": [
                                        {"$subtract": ["$created_at", thirty_days_ago]},
                                        1000 * 60 * 60 * 24
                                    ]
                                }
                            ]
                        }
                    }
                },
                {"$sort": {"trending_score": -1}},
                {"$limit": limit}
            ]
            cursor = mongodb.projects.aggregate(pipeline)
            projects = await cursor.to_list(length=None)
            return [
                ProjectSummary(**convert_objectid_to_str(project)) 
                for project in projects
            ]
        except Exception as e:
            logger.error(f"Error fetching trending projects: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch trending projects"
            )

    async def get_user_projects(self, user_id: str, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get projects created by a specific user"""
        try:
            query = {"created_by": user_id}
            pagination = paginate_query(page, limit)
            cursor = mongodb.projects.find(query).sort("created_at", -1)
            total = await mongodb.projects.count_documents(query)
            projects = await paginate_and_fetch(cursor, pagination)
            project_summaries = [ProjectSummary(**map_id_field(project)) for project in projects]
            return {
                "projects": [p.model_dump() for p in project_summaries],
                "total": total,
                "page": pagination["page"],
                "pages": (total + pagination["limit"] - 1) // pagination["limit"],
                "limit": pagination["limit"]
            }
        except Exception as e:
            logger.error(f"Error fetching user projects: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch user projects"
            )

    async def update_project(self, project_id: str, update_data: ProjectUpdate, user_id: str) -> Project:
        """Update project (only by owner)"""
        try:
            object_id = validate_object_id(project_id)
            await self._verify_ownership(object_id, user_id)
            update_dict = update_data.model_dump(exclude_none=True)

            for url_field in ["github_link", "demo_link", "report_url"]:
                if url_field in update_dict and update_dict[url_field] is not None:
                    update_dict[url_field] = str(update_dict[url_field])

            if "status" in update_dict and hasattr(update_dict["status"], "value"):
                update_dict["status"] = update_dict["status"].value

            if not update_dict:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid fields to update"
                )
            update_dict["updated_at"] = datetime.now(timezone.utc)
            result = await mongodb.projects.update_one(
                {"_id": object_id},
                {"$set": update_dict}
            )
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found"
                )
            updated_project = await mongodb.projects.find_one({"_id": object_id})
            return Project(**convert_objectid_to_str(updated_project))
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating project {project_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update project"
            )

    async def delete_project(self, project_id: str, user_id: str) -> bool:
        """Delete project (only by owner)"""
        try:
            object_id = validate_object_id(project_id)
            await self._verify_ownership(object_id, user_id)
            result = await mongodb.projects.delete_one({"_id": object_id})
            return result.deleted_count > 0
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting project {project_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete project"
            )

    async def upvote_project(self, project_id: str, user_id: str) -> Project:
        """Upvote a project (one per user)"""
        try:
            object_id = validate_object_id(project_id)
            existing_upvote = await mongodb.projects.find_one({
                "_id": object_id,
                "upvoted_by": user_id
            })
            if existing_upvote:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Already upvoted"
                )
            result = await mongodb.projects.update_one(
                {"_id": object_id},
                {
                    "$inc": {"upvotes": 1},
                    "$push": {"upvoted_by": user_id}
                }
            )
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found"
                )
            updated_project = await mongodb.projects.find_one({"_id": object_id})
            return Project(**convert_objectid_to_str(updated_project))
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error upvoting project {project_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upvote project"
            )

    async def remove_upvote(self, project_id: str, user_id: str) -> Project:
        """Remove upvote from a project"""
        try:
            object_id = validate_object_id(project_id)
            existing_upvote = await mongodb.projects.find_one({
                "_id": object_id,
                "upvoted_by": user_id
            })
            if not existing_upvote:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Haven't upvoted this project"
                )
            result = await mongodb.projects.update_one(
                {"_id": object_id},
                {
                    "$inc": {"upvotes": -1},
                    "$pull": {"upvoted_by": user_id}
                }
            )
            updated_project = await mongodb.projects.find_one({"_id": object_id})
            return Project(**convert_objectid_to_str(updated_project))
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error removing upvote from project {project_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to remove upvote"
            )

    async def add_contributor(self, project_id: str, contributor_id: str, owner_id: str) -> Project:
        """Add contributor to project (only by owner)"""
        try:
            object_id = validate_object_id(project_id)
            project = await self._verify_ownership(object_id, owner_id)
            if contributor_id in project.get("contributors", []):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User is already a contributor"
                )
            await mongodb.projects.update_one(
                {"_id": object_id},
                {"$push": {"contributors": contributor_id}}
            )
            updated_project = await mongodb.projects.find_one({"_id": object_id})
            return Project(**convert_objectid_to_str(updated_project))
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error adding contributor to project {project_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add contributor"
            )

    # Helper methods
    def _build_query(self, tech_stack, tags, status, search, featured_only):
        """Build MongoDB query from filters"""
        query = {}
        
        if tech_stack:
            query["tech_stack"] = {"$in": tech_stack}
        if tags:
            query["tags"] = {"$in": tags}
        if status:
            query["status"] = status
        if featured_only:
            query["featured"] = True
        if search:
            query.update(build_search_query(search, ["title", "abstract"]))
            
        return query

    def _get_sort_options(self, sort):
        """Get sort options based on sort parameter"""
        sort_mapping = {
            "trending": {"upvotes": -1, "created_at": -1},
            "newest": {"created_at": -1},
            "oldest": {"created_at": 1},
            "upvotes": {"upvotes": -1}
        }
        return sort_mapping.get(sort, {"created_at": -1})

    async def _verify_ownership(self, object_id, user_id):
        """Verify user owns the project"""
        project = await mongodb.projects.find_one({"_id": object_id})
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        if project["created_by"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only project owner can perform this action"
            )
        
        return project


# Global instance
project_crud = ProjectCRUD()