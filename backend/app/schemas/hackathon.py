from datetime import datetime

from pydantic import BaseModel


class HackathonCreate(BaseModel):
    title: str
    description: str
    registration_start: datetime
    registration_end: datetime
    hackathon_start: datetime
    hackathon_end: datetime


class HackathonResponse(BaseModel):
    id: int
    title: str
    description: str
    organizer_id: int
    status: str
    registration_start: datetime
    registration_end: datetime
    hackathon_start: datetime
    hackathon_end: datetime

    class Config:
        from_attributes = True
        
        
class HackathonUpdate(BaseModel):
    title: str
    description: str
    registration_start: datetime
    registration_end: datetime
    hackathon_start: datetime
    hackathon_end: datetime