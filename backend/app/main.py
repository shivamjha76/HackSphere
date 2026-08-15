from fastapi import FastAPI 
from app.routers import users
from app.routers import auth

app = FastAPI(title="HackSphere API")
app.include_router(users.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Welcome to HackSphere API"}

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "HackSphere API is running"
    }