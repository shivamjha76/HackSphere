import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_header(email: str, password: str) -> dict:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_my_certificates_unauthenticated_returns_401():
    res = client.get("/api/v1/certificates/my")
    assert res.status_code == 401


def test_get_my_certificates_authenticated():
    """Verify participant can view their issued certificates."""
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.get("/api/v1/certificates/my", headers=headers)
    assert res.status_code == 200
    certs = res.json()
    assert len(certs) >= 1
    shivam_cert = next((c for c in certs if c["certificate_code"] == "HS-2026-WINNER-001"), None)
    assert shivam_cert is not None
    assert shivam_cert["recipient_name"] == "Shivam Jha"
    assert shivam_cert["is_valid"] is True
    assert "TechNova Labs" in shivam_cert["org_name"]


def test_public_credential_verification_valid_code():
    """
    Verify public verification endpoint does not require authentication
    and confirms authentic credentials per Chapter 24.
    """
    res = client.get("/api/v1/certificates/verify/HS-2026-WINNER-001")
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid"] is True
    assert data["certificate_code"] == "HS-2026-WINNER-001"
    assert data["recipient_name"] == "Shivam Jha"
    assert "TechNova Labs" in data["org_name"]
    assert "Verified Authentic" in data["verification_message"]


def test_public_credential_verification_invalid_code_returns_404():
    """Unregistered or invalid certificate codes should return 404."""
    res = client.get("/api/v1/certificates/verify/FAKE-CODE-NONEXISTENT")
    assert res.status_code == 404


def test_issue_and_verify_new_certificate():
    """Test issuing a certificate and immediately verifying it publicly."""
    admin_headers = get_auth_header("admin@hacksphere.dev", "AdminPass123!")

    # Fetch hackathon and user Rahul
    from app.db.session import SessionLocal
    from app.models.user import User
    from app.models.hackathon import Hackathon
    from app.models.certificate import Certificate

    db = SessionLocal()
    rahul = db.query(User).filter_by(email="rahul@example.com").first()
    hack = db.query(Hackathon).first()
    assert rahul is not None
    assert hack is not None
    rahul_id = rahul.id
    hack_id = hack.id
    db.close()

    issue_res = client.post(
        "/api/v1/certificates/issue",
        headers=admin_headers,
        json={
            "hackathon_id": hack_id,
            "user_id": rahul_id,
            "certificate_type": "runner_up",
            "title": "Certificate of Excellence — Runner Up",
        },
    )
    assert issue_res.status_code == 200
    cert_data = issue_res.json()
    new_code = cert_data["certificate_code"]
    assert "HS-" in new_code

    # Verify publicly with no auth
    verify_res = client.get(f"/api/v1/certificates/verify/{new_code}")
    assert verify_res.status_code == 200
    assert verify_res.json()["recipient_name"] == "Rahul Sharma"
    assert verify_res.json()["certificate_type"] == "runner_up"

    # Clean up issued certificate
    clean_db = SessionLocal()
    c = clean_db.query(Certificate).filter_by(certificate_code=new_code).first()
    if c:
        clean_db.delete(c)
        clean_db.commit()
    clean_db.close()
