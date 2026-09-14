from typing import Generator, List, Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


def get_user_roles(user: User) -> List[str]:
    """Helper to extract active role names for a user."""
    return [ur.role.name for ur in user.user_roles if ur.role]


def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(reusable_oauth2),
    authorization: Optional[str] = Header(None),
) -> User:
    """
    Extracts and validates JWT access token from request header.
    Returns the authenticated active user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Extract token from Authorization header if not provided by oauth2 scheme
    jwt_token = token
    if not jwt_token and authorization and authorization.startswith("Bearer "):
        jwt_token = authorization.split(" ")[1]

    if not jwt_token:
        raise credentials_exception

    payload = decode_access_token(jwt_token)
    if not payload:
        raise credentials_exception

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    return user


def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(reusable_oauth2),
    authorization: Optional[str] = Header(None),
) -> Optional[User]:
    """
    Extracts user if valid token is provided, returns None if guest/unauthenticated.
    """
    jwt_token = token
    if not jwt_token and authorization and authorization.startswith("Bearer "):
        jwt_token = authorization.split(" ")[1]
    if not jwt_token:
        return None
    payload = decode_access_token(jwt_token)
    if not payload:
        return None
    user_id_str = payload.get("sub")
    if not user_id_str:
        return None
    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        return None
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        return None
    return user


class RoleChecker:
    """
    Dependency factory enforcing role prerequisites on protected endpoints.
    Superusers automatically bypass role restrictions.
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        # SuperAdmin or is_superuser has root platform bypass
        if current_user.is_superuser:
            return current_user
        
        user_roles = get_user_roles(current_user)
        if "super_admin" in user_roles:
            return current_user

        if not any(role in user_roles for role in self.allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required role: {', '.join(self.allowed_roles)}",
            )
        return current_user


# Reusable Server-Side Role Guards
require_super_admin = RoleChecker(["super_admin"])
require_organizer = RoleChecker(["organizer"])
require_judge = RoleChecker(["judge"])
require_participant = RoleChecker(["participant"])
