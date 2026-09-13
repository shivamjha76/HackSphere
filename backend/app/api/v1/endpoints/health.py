from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter
from app.core.config import settings
from app.db.session import check_db_connection

router = APIRouter()


@router.get("/health", response_model=Dict[str, Any], summary="System Health Check")
async def health_check() -> Dict[str, Any]:
    """
    Returns system operational health status, database connection state,
    application version, and server timestamp.
    """
    db_online = check_db_connection()

    return {
        "status": "healthy" if db_online else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "connected" if db_online else "disconnected",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
