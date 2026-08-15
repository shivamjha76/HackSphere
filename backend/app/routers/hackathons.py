from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models import Hackathon, User
from app.models import Hackathon, User, Registration
from app.schemas.hackathon import (
    HackathonCreate,
    HackathonUpdate,
    HackathonResponse,
    HackathonStatusUpdate
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


@router.get(
    "/my",
    response_model=list[HackathonResponse]
)
def get_my_hackathons(
    current_user: User = Depends(require_role("organizer")),
    db: Session = Depends(get_db)
):
    hackathons = (
        db.query(Hackathon)
        .filter(Hackathon.organizer_id == current_user.id)
        .order_by(Hackathon.created_at.desc())
        .all()
    )

    result = []

    for hackathon in hackathons:
        participant_count = db.query(Registration).filter(
            Registration.hackathon_id == hackathon.id
        ).count()

        result.append({
            "id": hackathon.id,
            "title": hackathon.title,
            "description": hackathon.description,
            "organizer_id": hackathon.organizer_id,
            "status": hackathon.status,
            "registration_start": hackathon.registration_start,
            "registration_end": hackathon.registration_end,
            "hackathon_start": hackathon.hackathon_start,
            "hackathon_end": hackathon.hackathon_end,
            "participant_count": participant_count
        })

    return result
    

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


@router.get("/", response_model=list[HackathonResponse])
def get_hackathons(
    skip: int = 0,
    limit: int = 10,
    search: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Hackathon).filter(
        Hackathon.status == "published"
    )

    if search:
        search_term = f"%{search}%"

        query = query.filter(
            Hackathon.title.ilike(search_term)
            | Hackathon.description.ilike(search_term)
        )

    return (
        query
        .order_by(Hackathon.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


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


@router.patch("/{hackathon_id}/status", response_model=HackathonResponse)
def update_hackathon_status(
    status_data: HackathonStatusUpdate,
    hackathon: Hackathon = Depends(get_owned_hackathon),
    current_user: User = Depends(require_role("organizer")),
    db: Session = Depends(get_db)
):
    current_status = hackathon.status
    new_status = status_data.status

    allowed_transitions = {
        "draft": ["published", "cancelled"],
        "published": ["registration_closed", "cancelled"],
        "registration_closed": ["ongoing", "cancelled"],
        "ongoing": ["completed"],
        "completed": [],
        "cancelled": []
    }

    if new_status not in allowed_transitions.get(current_status, []):
        from fastapi import HTTPException

        raise HTTPException(
            status_code=400,
            detail=f"Cannot change status from '{current_status}' to '{new_status}'"
        )

    hackathon.status = new_status

    db.commit()
    db.refresh(hackathon)

    return hackathon