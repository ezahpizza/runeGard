import logging
from typing import Optional
from pymongo import AsyncMongoClient, IndexModel, ASCENDING, DESCENDING, TEXT
from core.config import settings

logger = logging.getLogger(__name__)


class MongoDB:
    def __init__(self):
        self.client: Optional[AsyncMongoClient] = None
        self.db = None
        self._collections = {}

    async def connect(self):
        try:
            self.client = AsyncMongoClient(settings.MONGODB_URL)
            self.db = self.client[settings.DATABASE_NAME]
            await self.client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {settings.DATABASE_NAME}")
            
            # Create indexes after connection
            await self._create_indexes()
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    async def disconnect(self):
        if self.client:
            await self.client.close()
            logger.info("Disconnected from MongoDB")

    async def _create_indexes(self):
        try:
            # Users collection indexes
            await self.users.create_indexes([
                IndexModel([("user_id", ASCENDING)], unique=True),
                IndexModel([("email", ASCENDING)], unique=True),
                IndexModel([("skills", ASCENDING)]),
                IndexModel([("institute", ASCENDING)]),
                IndexModel([("grad_year", ASCENDING)]),
            ])
            
            # Projects collection indexes
            await self.projects.create_indexes([
                IndexModel([("created_by", ASCENDING)]),
                IndexModel([("contributors", ASCENDING)]),
                IndexModel([("tech_stack", ASCENDING)]),
                IndexModel([("tags", ASCENDING)]),
                IndexModel([("status", ASCENDING)]),
                IndexModel([("created_at", DESCENDING)]),
                IndexModel([("upvotes", DESCENDING)]),
                IndexModel([("featured", DESCENDING)]),
                IndexModel([("title", TEXT), ("abstract", TEXT)]),
            ])
            
            # Teammate requests collection indexes
            await self.teammate_requests.create_indexes([
                IndexModel([("user_id", ASCENDING)]),
                IndexModel([("project_id", ASCENDING)]),
                IndexModel([("tags", ASCENDING)]),
                IndexModel([("created_at", DESCENDING)]),
            ])
            
            # Testimonials collection indexes
            await self.testimonials.create_indexes([
                IndexModel([("from_user", ASCENDING)]),
                IndexModel([("to_user", ASCENDING)]),
                IndexModel([("created_at", DESCENDING)]),
                IndexModel([("from_user", ASCENDING), ("to_user", ASCENDING)], unique=True),
            ])
            
            logger.info("All indexes created successfully")
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")
            raise

    @property
    def users(self):
        if self.db is None:
            raise RuntimeError("Database not connected")
        return self.db["users"]

    @property
    def projects(self):
        if self.db is None:
            raise RuntimeError("Database not connected")
        return self.db["projects"]

    @property
    def teammate_requests(self):
        if self.db is None:
            raise RuntimeError("Database not connected")
        return self.db["teammate_requests"]

    @property
    def testimonials(self):
        if self.db is None:
            raise RuntimeError("Database not connected")
        return self.db["testimonials"]


# Global MongoDB instance
mongodb = MongoDB()