from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models import Hackathon, Registration, User
from app.schemas.registration import RegistrationResponse


router = APIRouter(
    prefix="/api/hackathons",
    tags=["Hackathon Registrations"]
)


@router.post(
    "/{hackathon_id}/register",
    response_model=RegistrationResponse,
    status_code=201
)
def register_for_hackathon(
    hackathon_id: int,
    current_user: User = Depends(require_role("participant")),
    db: Session = Depends(get_db)
):
    hackathon = db.query(Hackathon).filter(
        Hackathon.id == hackathon_id
    ).first()

    if not hackathon:
        raise HTTPException(
            status_code=404,
            detail="Hackathon not found"
        )

    if hackathon.status != "published":
        raise HTTPException(
            status_code=400,
            detail="Registration is not open for this hackathon"
        )

    existing_registration = db.query(Registration).filter(
        Registration.hackathon_id == hackathon_id,
        Registration.participant_id == current_user.id
    ).first()

    if existing_registration:
        raise HTTPException(
            status_code=409,
            detail="Already registered for this hackathon"
        )

    registration = Registration(
        hackathon_id=hackathon_id,
        participant_id=current_user.id
    )

    db.add(registration)

    try:
        db.commit()
        db.refresh(registration)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Already registered for this hackathon"
        )

    return registration


@router.get(
    "/{hackathon_id}/registration",
    response_model=RegistrationResponse
)
def get_my_registration(
    hackathon_id: int,
    current_user: User = Depends(require_role("participant")),
    db: Session = Depends(get_db)
):
    registration = db.query(Registration).filter(
        Registration.hackathon_id == hackathon_id,
        Registration.participant_id == current_user.id
    ).first()

    if not registration:
        raise HTTPException(
            status_code=404,
            detail="Registration not found"
        )

    return registration