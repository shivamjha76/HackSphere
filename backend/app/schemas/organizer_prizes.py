from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.organizer_teams import ManagedHackathonRef


class PrizeTierItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rank: int
    place_title: str
    amount_summary: str
    amount_in_words: Optional[str] = None
    prize_type: str  # Cash prize, In-kind Prize, etc.
    team_quantity: int = 1
    assigned_team_id: Optional[int] = None
    assigned_team_name: Optional[str] = None
    assigned_team_track: Optional[str] = None
    team_members_count: int = 0
    team_members_names: List[str] = Field(default_factory=list)
    disbursement_status: str = "pending"  # disbursed | pending | ready
    transaction_reference: Optional[str] = None
    disbursed_at: Optional[datetime] = None
    notes: Optional[str] = None


class PrizePoolSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_prize_pool: str = "₹50,000"
    total_cash_amount: float = 50000.0
    currency_symbol: str = "₹"
    total_winners_count: int = 3
    first_place: str = "₹25,000"
    second_place: str = "₹15,000"
    third_place: str = "₹10,000"
    special_mentions: str = "Goodies"
    prizes: List[PrizeTierItemOut] = Field(default_factory=list)


class EligibleTeamRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    track: Optional[str] = None
    members_count: int = 0


class OrganizerWinnersPrizesOverviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hackathon_id: int
    hackathon_title: str
    hackathon_slug: str
    status: str
    managed_hackathons: List[ManagedHackathonRef] = Field(default_factory=list)
    summary: PrizePoolSummaryOut
    available_teams: List[EligibleTeamRef] = Field(default_factory=list)


class UpdatePrizeTierIn(BaseModel):
    place_title: Optional[str] = None
    amount_summary: Optional[str] = None
    amount_in_words: Optional[str] = None
    prize_type: Optional[str] = None
    team_quantity: Optional[int] = None
    assigned_team_id: Optional[int] = None
    notes: Optional[str] = None


class DisbursePrizeIn(BaseModel):
    transaction_reference: str = Field(..., min_length=3, description="Transaction ID or bank wire reference")
    notes: Optional[str] = Field(None, description="Disbursement ledger confirmation note")


class CreatePrizeTierIn(BaseModel):
    place_title: str = Field(..., min_length=2, description="Prize title, e.g. Special Mention: Best UI/UX")
    amount_summary: str = Field(..., min_length=1, description="Prize reward summary, e.g. ₹5,000 or Swag Box")
    amount_in_words: Optional[str] = None
    prize_type: str = Field("Cash prize", description="Cash prize or In-kind Prize")
    team_quantity: int = Field(1, ge=1)
    assigned_team_id: Optional[int] = None
    notes: Optional[str] = None
