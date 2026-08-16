from pydantic import BaseModel
from typing import Literal

class RoleUpdate(BaseModel):
    role: Literal["participant", "organizer", "super_admin", "judge"]