from datetime import datetime

from pydantic import BaseModel

from typing import Literal

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
    participant_count: int

    class Config:
        from_attributes = True
        
        
class HackathonUpdate(BaseModel):
    title: str
    description: str
    registration_start: datetime
    registration_end: datetime
    hackathon_start: datetime
    hackathon_end: datetime
    

class HackathonStatusUpdate(BaseModel):
    status: Literal[
        "published",
        "registration_closed",
        "ongoing",
        "completed",
        "cancelled"
    ]