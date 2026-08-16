from datetime import datetime,timezone

from pydantic import BaseModel, model_validator

from typing import Literal

class HackathonCreate(BaseModel):
    title: str
    description: str
    registration_start: datetime
    registration_end: datetime
    hackathon_start: datetime
    hackathon_end: datetime
    max_participants: int = 100

    @model_validator(mode="after")
    def validate_dates(self):
        if self.registration_start >= self.registration_end:
            raise ValueError(
                "Registration end must be after registration start"
            )

        if self.registration_end > self.hackathon_start:
            raise ValueError(
                "Hackathon must start after registration ends"
            )

        if self.hackathon_start >= self.hackathon_end:
            raise ValueError(
                "Hackathon end must be after hackathon start"
            )

        return self


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
    max_participants: int

    class Config:
        from_attributes = True
        
        
class HackathonUpdate(BaseModel):
    title: str
    description: str
    registration_start: datetime
    registration_end: datetime
    hackathon_start: datetime
    hackathon_end: datetime
    max_participants: int

    @model_validator(mode="after")
    def validate_dates(self):
        if self.registration_start >= self.registration_end:
            raise ValueError(
                "Registration end must be after registration start"
            )

        if self.registration_end > self.hackathon_start:
            raise ValueError(
                "Hackathon must start after registration ends"
            )

        if self.hackathon_start >= self.hackathon_end:
            raise ValueError(
                "Hackathon end must be after hackathon start"
            )

        return self
    

class HackathonStatusUpdate(BaseModel):
    status: Literal[
        "published",
        "registration_closed",
        "ongoing",
        "completed",
        "cancelled"
    ]