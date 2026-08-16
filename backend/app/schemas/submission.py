from datetime import datetime

from pydantic import BaseModel, HttpUrl


class SubmissionCreate(BaseModel):
    title: str
    description: str
    github_url: HttpUrl | None = None
    demo_url: HttpUrl | None = None


class SubmissionResponse(BaseModel):
    id: int
    hackathon_id: int
    team_id: int
    title: str
    description: str
    github_url: str | None
    demo_url: str | None
    submitted_at: datetime
    status: str

    class Config:
        from_attributes = True