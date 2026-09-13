from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_user_roles
from app.core.security import hash_password, verify_password, create_access_token
from app.db.session import get_db
from app.models.user import User, Role, UserRole
from app.schemas.user import UserCreate, UserOut
from app.schemas.token import Token, LoginRequest

router = APIRouter()


def format_user_out(user: User) -> UserOut:
    """Helper to convert User ORM model to UserOut schema with roles list."""
    roles = get_user_roles(user)
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        bio=user.bio,
        avatar_url=user.avatar_url,
        skills=user.skills,
        github_url=user.github_url,
        linkedin_url=user.linkedin_url,
        portfolio_url=user.portfolio_url,
        xp=user.xp,
        level=user.level,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        roles=roles,
        created_at=user.created_at,
    )


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED, summary="User Registration")
def signup(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """
    Registers a new user account, assigns the default 'participant' role,
    and awards initial +20 XP for registration.
    """
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    # Ensure default 'participant' role exists
    participant_role = db.query(Role).filter_by(name="participant").first()
    if not participant_role:
        participant_role = Role(name="participant", description="Hackathon Participant")
        db.add(participant_role)
        db.flush()

    # Create new user record (+20 XP for registration per Chapter 25)
    new_user = User(
        email=user_in.email.lower(),
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        bio=user_in.bio,
        skills=user_in.skills,
        xp=20,
        level=1,
        is_active=True,
        is_superuser=False,
    )
    db.add(new_user)
    db.flush()

    # Assign participant role mapping
    user_role = UserRole(user_id=new_user.id, role_id=participant_role.id)
    db.add(user_role)
    db.commit()
    db.refresh(new_user)

    # Issue JWT Token
    access_token = create_access_token(new_user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=format_user_out(new_user),
    )


@router.post("/login", response_model=Token, summary="User Authentication & Token Generation")
def login(login_data: LoginRequest, db: Session = Depends(get_db)) -> Any:
    """
    Authenticates user credentials and returns a JWT access token.
    """
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or disabled.",
        )

    access_token = create_access_token(user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=format_user_out(user),
    )


@router.get("/me", response_model=UserOut, summary="Get Current Authenticated User")
def get_me(current_user: User = Depends(get_current_user)) -> Any:
    """
    Returns the authenticated user's profile and active roles.
    """
    return format_user_out(current_user)
