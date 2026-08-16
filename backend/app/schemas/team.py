from pydantic import BaseModel


class TeamCreate(BaseModel):
    name: str
    max_members: int = 4


class TeamResponse(BaseModel):
    id: int
    hackathon_id: int
    name: str
    leader_id: int
    max_members: int

    class Config:
        from_attributes = True