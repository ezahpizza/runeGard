import logging
from contextlib import asynccontextmanager

from typing import Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from db.mongo import mongodb
from api.routes import projects, requests, testimonials, users


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    logger.info("Starting runeGard API...")
    
    try:
        # Connect to MongoDB
        await mongodb.connect()
        logger.info("MongoDB connection established")   
        logger.info("runeGard started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down runeGard API...")
    
    try:
        # Disconnect from MongoDB
        await mongodb.disconnect()
        logger.info("MongoDB connection closed")
        
        logger.info("runeGard API shutdown complete")
        
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_V1_STR,
    description=settings.API_DESCRIPTION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include route modules
app.include_router(projects.router, prefix="/projects", tags=["Project management"])
app.include_router(requests.router, prefix="/requests", tags=["Team requests"])
app.include_router(testimonials.router, prefix="/testimonials", tags=["Testimonials"])
app.include_router(users.router, prefix="/users", tags=["User management"])


@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint."""
    return {
        "message": "runeGard API",
        "version": settings.API_V1_STR,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        database_connected = False
        try:
            await mongodb.admin.command('ping')
            database_connected = True
        except Exception as e:
            logger.warning(f"Database health check failed: {e}")

        return {
            "status": "healthy" if database_connected else "degraded",
            "database_connected": database_connected,
            "version": settings.API_V1_STR
        }

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")