from fastapi import FastAPI 

app = FastAPI(title="HackSphere API")

@app.get("/")
def root():
    return {"message": "Welcome to HackSphere API"}