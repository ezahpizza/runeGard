from typing import Dict, Any, List, Optional, TypeVar, Type
from core.utils import convert_objectid_to_str, paginate_query
from core.logging_config import get_logger

logger = get_logger(__name__)

T = TypeVar('T')

def process_document(document: dict) -> dict:
    """
    Standard document processing: convert ObjectIds to strings and map '_id' to 'id'.
    """
    if not document:
        return document
    
    doc = convert_objectid_to_str(document)
    if "_id" in doc:
        doc["id"] = doc.pop("_id")
    return doc

def process_documents(documents: List[dict]) -> List[dict]:
    """Process multiple documents using the standard process_document function."""
    return [process_document(doc) for doc in documents]

def to_model(model_cls: Type[T], document: dict) -> Optional[T]:
    """Convert a single MongoDB document to a model instance."""
    if not document:
        return None
    return model_cls(**process_document(document))

def to_model_list(model_cls: Type[T], documents: List[dict]) -> List[T]:
    """Convert a list of MongoDB documents to model instances."""
    return [model_cls(**process_document(doc)) for doc in documents]

async def fetch_documents(cursor, pagination: Dict[str, Any]) -> List[dict]:
    """
    Standard function to fetch paginated documents from a MongoDB cursor.
    """
    return await cursor.skip(pagination["skip"]).limit(pagination["limit"]).to_list(length=None)

async def execute_paginated_query(
    collection,
    query: Dict[str, Any] = None,
    sort_options: Dict[str, int] = None,
    page: int = 1,
    limit: int = 10
) -> Dict[str, Any]:
    """
    Standard paginated query execution with processed documents.
    Returns a dictionary with processed documents, pagination info, and total count.
    """
    if query is None:
        query = {}
    
    pagination = paginate_query(page, limit)
    
    # Build cursor with query
    cursor = collection.find(query)
    
    # Apply sorting if provided
    if sort_options:
        cursor = cursor.sort(list(sort_options.items()))
    
    # Get total count and documents
    total = await collection.count_documents(query)
    documents = await fetch_documents(cursor, pagination)
    
    return {
        "documents": process_documents(documents),
        "total": total,
        "page": pagination["page"],
        "pages": (total + pagination["limit"] - 1) // pagination["limit"],
        "limit": pagination["limit"]
    }

