import logging
import sys
from core.config import settings

def setup_logging():
    
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    root_logger = logging.getLogger()
    
    if settings.is_development:
        app_logger = logging.getLogger("api")
        app_logger.setLevel(logging.DEBUG)
        
        core_logger = logging.getLogger("core")
        core_logger.setLevel(logging.DEBUG)
        
        db_logger = logging.getLogger("db")
        db_logger.setLevel(logging.DEBUG)
        
        models_logger = logging.getLogger("models")
        models_logger.setLevel(logging.DEBUG)
        
        logging.getLogger("pymongo").setLevel(logging.WARNING)
        logging.getLogger("httpx").setLevel(logging.WARNING)
        logging.getLogger("httpcore").setLevel(logging.WARNING)
        
    else:

        app_logger = logging.getLogger("api")
        app_logger.setLevel(logging.INFO)
        
        core_logger = logging.getLogger("core")
        core_logger.setLevel(logging.INFO)
        
        db_logger = logging.getLogger("db")
        db_logger.setLevel(logging.INFO)
        
        models_logger = logging.getLogger("models")
        models_logger.setLevel(logging.INFO)
        
        logging.getLogger("pymongo").setLevel(logging.ERROR)
        logging.getLogger("httpx").setLevel(logging.ERROR)
        logging.getLogger("httpcore").setLevel(logging.ERROR)
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    def get_logger(name: str) -> logging.Logger:
        logger = logging.getLogger(name)
        
        original_debug = logger.debug
        
        def env_debug(msg, *args, **kwargs):
            if settings.is_development:
                original_debug(msg, *args, **kwargs)
        
        logger.debug = env_debug
        return logger
    
    return get_logger

get_logger = setup_logging()
