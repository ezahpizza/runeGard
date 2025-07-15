import logging
from typing import Dict, Any, List
from core.utils import convert_objectid_to_str

logger = logging.getLogger(__name__)

def map_id_field(document: dict) -> dict:
    """Convert '_id' to 'id' in a MongoDB document."""
    doc = convert_objectid_to_str(document)
    if "_id" in doc:
        doc["id"] = doc.pop("_id")
    return doc

def to_public_model(model_cls, documents: List[dict]) -> List:
    """Convert a list of MongoDB documents to public models with 'id' field."""
    return [model_cls(**map_id_field(doc)) for doc in documents]

def paginate_and_fetch(cursor, pagination: Dict[str, Any]) -> List[dict]:
    """Paginate and fetch documents from a MongoDB cursor."""
    return cursor.skip(pagination["skip"]).limit(pagination["limit"]).to_list(length=None)
