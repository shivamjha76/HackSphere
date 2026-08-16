from datetime import datetime

from pydantic import BaseModel


class RegistrationResponse(BaseModel):
    id: int
    hackathon_id: int
    participant_id: int
    registered_at: datetime
    status: str

    class Config:
        from_attributes = True