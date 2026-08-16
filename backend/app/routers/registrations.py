from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from datetime import datetime
from zoneinfo import ZoneInfo
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models import Hackathon, Registration, User
from app.schemas.registration import RegistrationResponse
from app.schemas.hackathon import HackathonResponse
from app.core.hackathon_permissions import get_owned_hackathon

from app.models import Registration, User
from app.schemas.registration import RegistrationResponse

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models import Hackathon, Registration, User

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

    now = datetime.now(
        ZoneInfo("Asia/Kolkata")
    ).replace(tzinfo=None)

    if now < hackathon.registration_start:
        raise HTTPException(
            status_code=400,
            detail="Registration has not started yet"
        )

    if now > hackathon.registration_end:
        raise HTTPException(
            status_code=400,
            detail="Registration has closed"
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

    participant_count = db.query(Registration).filter(
        Registration.hackathon_id == hackathon_id
    ).count()

    if participant_count >= hackathon.max_participants:
        raise HTTPException(
            status_code=400,
            detail="Hackathon has reached its maximum participant capacity"
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

@router.delete(
    "/{hackathon_id}/registration",
    status_code=204
)
def cancel_registration(
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
            detail="Registration cannot be cancelled at this stage"
        )

    db.delete(registration)
    db.commit()

    return None

@router.get(
    "/my",
    response_model=list[RegistrationResponse]
)
def get_my_registrations(
    current_user: User = Depends(require_role("participant")),
    db: Session = Depends(get_db)
):
    return (
        db.query(Registration)
        .filter(
            Registration.participant_id == current_user.id
        )
        .order_by(Registration.registered_at.desc())
        .all()
    )
    
@router.get(
    "/hackathon/{hackathon_id}",
    response_model=list[RegistrationResponse]
)
def get_hackathon_registrations(
    hackathon_id: int,
    current_user: User = Depends(require_role("organizer")),
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

    if hackathon.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not own this hackathon"
        )

    registrations = (
    db.query(
        Registration.id,
        Registration.hackathon_id,
        Registration.participant_id,
        User.name.label("participant_name"),
        User.email.label("participant_email"),
        Registration.registered_at
    )
    .join(
        User,
        User.id == Registration.participant_id
    )
    .filter(
        Registration.hackathon_id == hackathon_id
    )
    .order_by(Registration.registered_at.desc())
    .all()
)

    return registrations