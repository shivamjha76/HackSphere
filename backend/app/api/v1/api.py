from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, role_guard, hackathons, organizations, dashboard, teams, submissions, certificates

api_router = APIRouter()

# Register endpoint routers
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(role_guard.router, prefix="/protected", tags=["Role Guards"])
api_router.include_router(hackathons.router, prefix="/hackathons", tags=["Hackathons"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(teams.router, prefix="/teams", tags=["Teams"])
api_router.include_router(submissions.router, prefix="/submissions", tags=["Submissions"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["Certificates"])
