from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from core.logging_config import get_logger

logger = get_logger(__name__)


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def convert_objectid_to_str(data: Dict[str, Any]) -> Dict[str, Any]:
    """Convert ObjectIds to strings and standardize datetime formatting in data."""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, ObjectId):
                data[key] = str(value)
            elif isinstance(value, datetime):
                if value.tzinfo is None:
                    value = value.replace(tzinfo=timezone.utc)
                data[key] = value
            elif isinstance(value, dict):
                data[key] = convert_objectid_to_str(value)
            elif isinstance(value, list):
                data[key] = [
                    convert_objectid_to_str(item) if isinstance(item, dict) 
                    else str(item) if isinstance(item, ObjectId)
                    else item.replace(tzinfo=timezone.utc) if isinstance(item, datetime) and item.tzinfo is None
                    else item
                    for item in value
                ]
    return data


def validate_object_id(id_string: str) -> ObjectId:
    if not ObjectId.is_valid(id_string):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
    return ObjectId(id_string)


def paginate_query(
    page: int = 1,
    limit: int = 10,
    max_limit: int = 100
) -> Dict[str, int]:
    # Ensure minimum values
    page = max(1, page)
    limit = max(1, min(limit, max_limit))
    
    skip = (page - 1) * limit
    
    return {
        "skip": skip,
        "limit": limit,
        "page": page
    }


def build_search_query(
    search_term: Optional[str] = None,
    fields: List[str] = None
) -> Dict[str, Any]:
    if not search_term or not fields:
        return {}
    
    search_pattern = {"$regex": search_term, "$options": "i"}
    
    or_conditions = [
        {field: search_pattern} for field in fields
    ]
    
    return {"$or": or_conditions}


def build_filter_query(filters: Dict[str, Any]) -> Dict[str, Any]:
    query = {}
    
    for key, value in filters.items():
        if value is not None:
            if isinstance(value, list) and value:
                query[key] = {"$in": value}
            elif isinstance(value, str) and value:
                query[key] = value
            elif isinstance(value, (int, float, bool)):
                query[key] = value
    
    return query


class MongoJSONEncoder:
    @staticmethod
    def default(obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        elif isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")