from fastapi import FastAPI 
from app.routers import users

app = FastAPI(title="HackSphere API")
app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "Welcome to HackSphere API"}

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "HackSphere API is running"
    }