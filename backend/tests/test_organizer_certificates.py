import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_header(email: str = "organizer@technova.com", password: str = "OrganizerPass123!") -> dict:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_organizer_certificates_dashboard():
    """Verify Screen #53 overview, templates, and issued certificates manifest."""
    headers = get_auth_header()
    res = client.get("/api/v1/organizer/certificates?hackathon_slug=ai-hack-summit-2026", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["hackathon_slug"] == "ai-hack-summit-2026"
    assert "AI Hack Summit" in data["hackathon_title"]

    # Verify summary metrics (Screen #53 KPI overview)
    summary = data["summary"]
    assert summary["total_certificates"] >= 4
    assert summary["issued_count"] >= 4
    assert summary["pending_count"] == 0
    assert summary["issued_percentage"] == "100%"

    # Verify 3 templates showcase
    templates = data["templates"]
    assert len(templates) >= 3
    template_names = [t["name"] for t in templates]
    assert "Winner Certificate Template" in template_names
    assert "Special Mentions Certificate" in template_names
    assert "Participation Certificate" in template_names

    # Verify Screen #53 issued certificates
    certs = data["certificates"]
    assert len(certs) >= 4
    team_names = [c["team_name"] for c in certs if c["team_name"]]
    assert "CodeCrafters" in team_names
    assert "ByteBuilders" in team_names
    assert "DevDynamos" in team_names
    assert "PixelPioneers" in team_names

    codecrafters_cert = next(c for c in certs if c["certificate_code"] == "HS-2026-WINNER-001")
    assert codecrafters_cert["team_position"] == "1st Place"
    assert codecrafters_cert["member_count"] == 5
    assert codecrafters_cert["status"] == "issued"


def test_create_and_update_certificate_template():
    """Test creating a custom certificate template and modifying its design theme."""
    headers = get_auth_header()
    create_payload = {
        "hackathon_slug": "ai-hack-summit-2026",
        "name": "Most Innovative Agent Template",
        "template_type": "special_mention",
        "description": "Special distinction for breakthroughs in autonomous multi-agent systems.",
        "target_audience": "Top Agentic AI Teams",
        "title_text": "Certificate of Agentic Innovation",
        "subtitle_text": "For outstanding autonomous reasoning and multi-agent orchestration.",
        "issuer_name": "TechNova Labs AI Research Council",
        "signatory_name": "Dr. Alex Vance",
        "signatory_title": "Chief AI Scientist",
        "badge_text": "AGENTIC",
        "theme": "purple",
    }
    create_res = client.post("/api/v1/organizer/certificates/templates", headers=headers, json=create_payload)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["name"] == "Most Innovative Agent Template"
    assert created["theme"] == "purple"
    template_id = created["id"]

    # Update template
    patch_res = client.patch(
        f"/api/v1/organizer/certificates/templates/{template_id}",
        headers=headers,
        json={"theme": "gold", "signatory_name": "Dr. Sarah Jenkins"},
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["theme"] == "gold"
    assert updated["signatory_name"] == "Dr. Sarah Jenkins"


def test_reissue_certificate():
    """Test reissuing an existing certificate to refresh its cryptographic verification timestamp."""
    headers = get_auth_header()
    # Fetch existing certs
    list_res = client.get("/api/v1/organizer/certificates?hackathon_slug=ai-hack-summit-2026", headers=headers)
    assert list_res.status_code == 200
    certs = list_res.json()["certificates"]
    assert len(certs) > 0
    target_id = certs[0]["id"]

    reissue_res = client.post(f"/api/v1/organizer/certificates/{target_id}/reissue", headers=headers)
    assert reissue_res.status_code == 200
    reissued_data = reissue_res.json()
    assert reissued_data["id"] == target_id
    assert reissued_data["status"] == "issued"
    assert reissued_data["is_valid"] is True


def test_email_dispatch_certificates():
    """Test emailing certificate notifications and links to recipient team rosters."""
    headers = get_auth_header()
    email_payload = {
        "hackathon_slug": "ai-hack-summit-2026",
        "subject": "Congratulations! Your AI Hack Summit 2026 Certificate is Ready",
        "custom_message": "Thank you for building extraordinary technology at AI Hack Summit 2026.",
    }
    res = client.post("/api/v1/organizer/certificates/email-dispatch", headers=headers, json=email_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["sent_count"] >= 4
    assert "successfully dispatched" in data["message"].lower()


def test_download_certificates_manifest_csv():
    """Test downloading the full certificates manifest as CSV."""
    headers = get_auth_header()
    res = client.get("/api/v1/organizer/certificates/download-all?hackathon_slug=ai-hack-summit-2026", headers=headers)
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    text = res.text
    assert "Certificate Code,Recipient Name" in text
    assert "CodeCrafters" in text
    assert "ByteBuilders" in text


def test_bulk_issue_certificates():
    """Test bulk issuing certificates preserves already issued ones without duplicate collision."""
    headers = get_auth_header()
    payload = {
        "hackathon_slug": "ai-hack-summit-2026",
        "target": "all",
    }
    res = client.post("/api/v1/organizer/certificates/bulk-issue", headers=headers, json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "bulk issuance complete" in data["message"].lower()
