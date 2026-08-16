from pydantic import BaseModel


class JudgeCreate(BaseModel):
    judge_id: int


class JudgeResponse(BaseModel):
    id: int
    hackathon_id: int
    judge_id: int

    class Config:
        from_attributes = True