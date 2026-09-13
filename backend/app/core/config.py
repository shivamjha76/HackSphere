import json
import os
from pathlib import Path
from typing import List, Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "HackSphere API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "HackSphere - One Platform for Complete Hackathon Management"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    HOST: str = "127.0.0.1"
    PORT: int = 8000

    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return [str(i) for i in v]
        return []

    # Database Settings
    DATABASE_URL: Optional[str] = None
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    POSTGRES_PORT: int = 5432

    # JWT Authentication Settings
    SECRET_KEY: str = "hacksphere-super-secure-production-ready-jwt-secret-key-2026-xyz-token-generator"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for dev

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        if self.POSTGRES_SERVER and self.POSTGRES_USER:
            password = f":{self.POSTGRES_PASSWORD}" if self.POSTGRES_PASSWORD else ""
            db = f"/{self.POSTGRES_DB}" if self.POSTGRES_DB else ""
            return f"postgresql://{self.POSTGRES_USER}{password}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}{db}"
        
        # Default local SQLite database file in repository root /database/
        base_dir = Path(__file__).resolve().parent.parent.parent.parent
        db_path = base_dir / "database" / "hacksphere.db"
        db_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{db_path.as_posix()}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
