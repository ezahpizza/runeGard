from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Database
    MONGODB_URL: str = Field(..., env="MONGODB_URL")
    DATABASE_NAME: str = Field(..., env="DATABASE_NAME")
    
    # Clerk Auth
    CLERK_SECRET_KEY: str = Field(..., env="CLERK_SECRET_KEY")
    CLERK_PUBLISHABLE_KEY: str = Field(..., env="CLERK_PUBLISHABLE_KEY")
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "GradNet API"
    
    # CORS
    CORS_ORIGINS: str = Field(
        default="http://localhost:8080",
        env="CORS_ORIGINS"
    )
    
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()