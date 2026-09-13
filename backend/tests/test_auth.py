import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def unique_email(prefix: str = "user") -> str:
    """Generate a unique test email to avoid collisions."""
    return f"{prefix}_{uuid.uuid4().hex[:8]}@example.com"


def test_signup_success():
    """Verify new user registration, token return, role assignment, and XP."""
    email = unique_email("signup")
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": email,
            "password": "Password123!",
            "full_name": "Neha Patel",
            "skills": "React, Python",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email
    assert data["user"]["full_name"] == "Neha Patel"
    assert data["user"]["xp"] == 20
    assert "participant" in data["user"]["roles"]


def test_signup_duplicate_email():
    """Verify duplicate email registration is rejected."""
    email = unique_email("dup")
    payload = {
        "email": email,
        "password": "Password123!",
        "full_name": "Duplicate User",
    }
    # First signup
    res1 = client.post("/api/v1/auth/signup", json=payload)
    assert res1.status_code == 201

    # Second signup with same email
    res2 = client.post("/api/v1/auth/signup", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"].lower()


def test_login_success():
    """Verify login with correct credentials returns valid JWT."""
    email = unique_email("login")
    signup_res = client.post(
        "/api/v1/auth/signup",
        json={
            "email": email,
            "password": "ValidPassword123!",
            "full_name": "Login Tester",
        },
    )
    assert signup_res.status_code == 201

    # Attempt login
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": "ValidPassword123!",
        },
    )
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == email


def test_login_wrong_password():
    """Verify login fails with wrong password."""
    email = unique_email("wrong_pass")
    client.post(
        "/api/v1/auth/signup",
        json={
            "email": email,
            "password": "ValidPassword123!",
            "full_name": "Tester",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": "WrongPassword999!",
        },
    )
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()


def test_get_me_authenticated():
    """Verify accessing /api/v1/auth/me with Bearer token."""
    email = unique_email("profile")
    signup_res = client.post(
        "/api/v1/auth/signup",
        json={
            "email": email,
            "password": "Password123!",
            "full_name": "Profile Checker",
        },
    )
    assert signup_res.status_code == 201
    token = signup_res.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == email
    assert user_data["full_name"] == "Profile Checker"
    assert "participant" in user_data["roles"]


def test_get_me_unauthenticated():
    """Verify accessing /api/v1/auth/me without token returns 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
