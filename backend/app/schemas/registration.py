from datetime import datetime

from pydantic import BaseModel


class RegistrationResponse(BaseModel):
    id: int
    hackathon_id: int
    participant_id: int
    participant_name: str
    participant_email: str
    registered_at: datetime

    class Config:
        from_attributes = True