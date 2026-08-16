from fastapi import FastAPI 
from app.routers import users
from app.routers import auth
from app.routers import hackathons
from app.routers import registrations
from app.routers import teams
from app.routers import submissions

app = FastAPI(title="HackSphere API")
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(hackathons.router)
app.include_router(registrations.router)
app.include_router(teams.router)
app.include_router(submissions.router)

@app.get("/")
def root():
    return {"message": "Welcome to HackSphere API"}

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "HackSphere API is running"
    }