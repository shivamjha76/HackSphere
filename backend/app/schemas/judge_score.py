from pydantic import BaseModel, Field


class JudgeScoreCreate(BaseModel):
    submission_id: int

    innovation: int = Field(ge=0, le=10)
    technical_execution: int = Field(ge=0, le=10)
    impact: int = Field(ge=0, le=10)
    presentation: int = Field(ge=0, le=10)

    feedback: str | None = None


class JudgeScoreResponse(BaseModel):
    id: int
    submission_id: int
    judge_id: int
    innovation: int
    technical_execution: int
    impact: int
    presentation: int
    feedback: str | None

    class Config:
        from_attributes = True