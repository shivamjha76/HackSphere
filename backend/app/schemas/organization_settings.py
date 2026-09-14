from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OrganizationBillingUsageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    active_hackathons: int
    max_hackathons: int
    participants: int
    max_participants: int
    submissions: int
    max_submissions: int
    storage_used_gb: float
    max_storage_gb: float
    reset_date_label: str


class PaymentMethodOut(BaseModel):
    id: str
    brand: str
    last4: str
    exp_month: int
    exp_year: int
    is_default: bool


class InvoiceItemOut(BaseModel):
    invoice_id: str
    date: str
    plan_name: str
    amount: float
    currency: str = "INR"
    status: str = "Paid"
    download_url: str


class OrganizationBillingOverviewOut(BaseModel):
    organization_id: int
    organization_name: str
    is_verified: bool
    plan_tier: str
    plan_price: float
    billing_cycle: str
    next_billing_date: Optional[datetime] = None
    next_billing_label: str
    billing_email: str
    billing_address: str
    usage: OrganizationBillingUsageOut
    payment_methods: List[PaymentMethodOut]
    invoices: List[InvoiceItemOut]


class UpdateBillingProfileIn(BaseModel):
    billing_email: EmailStr
    billing_address: str = Field(..., min_length=5, max_length=500)


class UpdateOrgProfileIn(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = None
    website_url: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None


class OrganizationSettingsProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    org_type: str
    description: Optional[str] = None
    website_url: Optional[str] = None
    official_email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str
    is_verified: bool
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
