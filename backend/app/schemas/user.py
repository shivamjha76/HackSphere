from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=150)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)
    bio: Optional[str] = None
    skills: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    phone: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class UserOut(UserBase):
    id: int
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    xp: int = 0
    level: int = 1
    is_active: bool = True
    is_superuser: bool = False
    roles: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
