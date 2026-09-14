import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_header(email: str, password: str) -> dict:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_organization_billing_unauthorized():
    """Unauthenticated requests must return 401."""
    res = client.get("/api/v1/organizations/my/billing")
    assert res.status_code == 401


def test_organization_billing_participant_forbidden():
    """Participant role must receive 403 on billing management endpoints."""
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.get("/api/v1/organizations/my/billing", headers=headers)
    assert res.status_code == 403


def test_organizer_get_billing_overview():
    """Organizer can fetch Pro Plan subscription, 4 usage meters, and invoice history matching Screen #52."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    res = client.get("/api/v1/organizations/my/billing", headers=headers)
    assert res.status_code == 200
    data = res.json()

    # Plan details
    assert "Pro Plan" in data["plan_tier"]
    assert data["plan_price"] == 999.0
    assert data["billing_cycle"] == "monthly"
    assert "12 Jun 2025" in data["next_billing_label"]

    # Usage meters matching Screen #52
    usage = data["usage"]
    assert usage["active_hackathons"] >= 8
    assert usage["max_hackathons"] == 20
    assert usage["participants"] >= 2450
    assert usage["max_participants"] == 10000
    assert usage["submissions"] >= 1245
    assert usage["max_submissions"] == 5000
    assert usage["storage_used_gb"] == 12.4
    assert usage["max_storage_gb"] == 50.0

    # Payment method matching Screen #52
    payment_methods = data["payment_methods"]
    assert len(payment_methods) >= 1
    assert payment_methods[0]["last4"] == "4242"
    assert payment_methods[0]["brand"] == "Visa"
    assert payment_methods[0]["is_default"] is True

    # Invoices history matching Screen #52
    invoices = data["invoices"]
    assert len(invoices) >= 3
    inv_ids = [inv["invoice_id"] for inv in invoices]
    assert "INV-2025-00049" in inv_ids
    assert "INV-2025-00037" in inv_ids
    assert "INV-2025-00026" in inv_ids


def test_organizer_update_billing_profile():
    """Organizer can update billing contact email and billing address."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    payload = {
        "billing_email": "accounts@technovalabs.dev",
        "billing_address": "TechNova Labs HQ, 5th Floor, Cyber Park, Jaipur, India",
    }
    res = client.patch("/api/v1/organizations/my/billing", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["billing_email"] == "accounts@technovalabs.dev"
    assert "Cyber Park" in data["billing_address"]

    # Revert to standard
    client.patch(
        "/api/v1/organizations/my/billing",
        json={
            "billing_email": "billing@technovalabs.dev",
            "billing_address": "TechNova Labs, Jaipur, Rajasthan, India",
        },
        headers=headers,
    )


def test_organizer_get_and_update_profile():
    """Organizer can view and update organization branding profile."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    res = client.get("/api/v1/organizations/my/profile", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "TechNova Labs"
    assert data["is_verified"] is True

    update_res = client.patch(
        "/api/v1/organizations/my/profile",
        json={"website_url": "https://technovalabs.dev"},
        headers=headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["website_url"] == "https://technovalabs.dev"


def test_organizer_download_invoice():
    """Organizer can request downloadable invoice receipt payload."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    res = client.post(
        "/api/v1/organizations/my/billing/invoices/INV-2025-00049/download",
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["invoice_id"] == "INV-2025-00049"
    assert data["download_ready"] is True
    assert "pdf" in data["receipt_url"]
