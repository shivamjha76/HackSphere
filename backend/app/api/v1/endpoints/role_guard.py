from typing import Dict, Any
from fastapi import APIRouter, Depends
from app.api.deps import (
    require_super_admin,
    require_organizer,
    require_judge,
    require_participant,
)
from app.models.user import User

router = APIRouter()


@router.get("/admin-only", response_model=Dict[str, Any], summary="Super Admin Guard")
def admin_only_endpoint(current_user: User = Depends(require_super_admin)) -> Dict[str, Any]:
    """Protected endpoint accessible exclusively by SuperAdmin."""
    return {
        "access": "granted",
        "portal": "SuperAdmin Management",
        "user": current_user.email,
        "message": "Welcome to the global platform administration governance portal.",
    }


@router.get("/organizer-only", response_model=Dict[str, Any], summary="Organizer Guard")
def organizer_only_endpoint(current_user: User = Depends(require_organizer)) -> Dict[str, Any]:
    """Protected endpoint accessible by Organizers and SuperAdmins."""
    return {
        "access": "granted",
        "portal": "Organizer Workspace",
        "user": current_user.email,
        "message": "Welcome to your organization hackathon management console.",
    }


@router.get("/judge-only", response_model=Dict[str, Any], summary="Judge Guard")
def judge_only_endpoint(current_user: User = Depends(require_judge)) -> Dict[str, Any]:
    """Protected endpoint accessible by Judges and SuperAdmins."""
    return {
        "access": "granted",
        "portal": "Judge Portal",
        "user": current_user.email,
        "message": "Welcome to the hackathon evaluation and scoring rubric portal.",
    }


@router.get("/participant-only", response_model=Dict[str, Any], summary="Participant Guard")
def participant_only_endpoint(current_user: User = Depends(require_participant)) -> Dict[str, Any]:
    """Protected endpoint accessible by Participants and SuperAdmins."""
    return {
        "access": "granted",
        "portal": "Participant Workspace",
        "user": current_user.email,
        "message": "Welcome to your teams and hackathon submissions portal.",
    }
