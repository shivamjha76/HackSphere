from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models import Hackathon, User
from app.schemas.hackathon import (
    HackathonCreate,
    HackathonUpdate,
    HackathonResponse
)


router = APIRouter(
    prefix="/api/hackathons",
    tags=["Hackathons"]
)


@router.post("/", response_model=HackathonResponse, status_code=201)
def create_hackathon(
    hackathon_data: HackathonCreate,
    current_user: User = Depends(require_role("organizer")),
    db: Session = Depends(get_db)
):
    hackathon = Hackathon(
        title=hackathon_data.title,
        description=hackathon_data.description,
        organizer_id=current_user.id,
        registration_start=hackathon_data.registration_start,
        registration_end=hackathon_data.registration_end,
        hackathon_start=hackathon_data.hackathon_start,
        hackathon_end=hackathon_data.hackathon_end
    )

    db.add(hackathon)
    db.commit()
    db.refresh(hackathon)

    return hackathon

@router.get("/{hackathon_id}", response_model=HackathonResponse)
def get_hackathon(
    hackathon_id: int,
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

    return hackathon

from app.core.hackathon_permissions import get_owned_hackathon
@router.put("/{hackathon_id}", response_model=HackathonResponse)
def update_hackathon(
    hackathon_data: HackathonUpdate,
    hackathon: Hackathon = Depends(get_owned_hackathon),
    current_user: User = Depends(require_role("organizer")),
    db: Session = Depends(get_db)
):
    hackathon.title = hackathon_data.title
    hackathon.description = hackathon_data.description
    hackathon.registration_start = hackathon_data.registration_start
    hackathon.registration_end = hackathon_data.registration_end
    hackathon.hackathon_start = hackathon_data.hackathon_start
    hackathon.hackathon_end = hackathon_data.hackathon_end

    db.commit()
    db.refresh(hackathon)

    return hackathon

@router.delete("/{hackathon_id}", status_code=204)
def delete_hackathon(
    hackathon: Hackathon = Depends(get_owned_hackathon),
    current_user: User = Depends(require_role("organizer")),
    db: Session = Depends(get_db)
):
    db.delete(hackathon)
    db.commit()

    return None