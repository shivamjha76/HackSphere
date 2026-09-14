import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.team import Team
from app.models.submission import Submission
from app.models.judging import HackathonJudge, JudgeAssignment, Evaluation, EvaluationScore
from app.models.hackathon import Hackathon

client = TestClient(app)


def get_auth_header(email: str, password: str) -> dict:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def review_test_data():
    db = SessionLocal()
    try:
        hackathon = db.query(Hackathon).filter_by(slug="ai-hack-summit-2026").first()
        judge_record = (
            db.query(HackathonJudge)
            .filter_by(hackathon_id=hackathon.id)
            .first()
        )
        # Find or create a test team
        test_team = db.query(Team).filter_by(invite_code="TEST-EVAL-TEAM").first()
        if not test_team:
            test_team = Team(
                hackathon_id=hackathon.id,
                name="Neural Innovators",
                invite_code="TEST-EVAL-TEAM",
                track="AI Healthcare",
                status="shortlisted",
            )
            db.add(test_team)
            db.flush()

        # Find or create test submission
        test_sub = db.query(Submission).filter_by(team_id=test_team.id).first()
        if not test_sub:
            test_sub = Submission(
                team_id=test_team.id,
                hackathon_id=hackathon.id,
                project_title="MediVision AI",
                tagline="AI-driven early medical anomaly detector",
                description="Real-time multi-modal diagnostic vision model.",
                github_url="https://github.com/test/medivision",
                live_demo_url="https://medivision.demo",
                video_url="https://youtube.com/watch?v=medivision",
                version=1,
                status="submitted",
            )
            db.add(test_sub)
            db.flush()

        # Find or create assignment
        assignment = (
            db.query(JudgeAssignment)
            .filter_by(hackathon_id=hackathon.id, judge_id=judge_record.id, team_id=test_team.id)
            .first()
        )
        if not assignment:
            assignment = JudgeAssignment(
                hackathon_id=hackathon.id,
                judge_id=judge_record.id,
                team_id=test_team.id,
                status="assigned",
            )
            db.add(assignment)
            db.flush()

        db.commit()

        yield {
            "hackathon_id": hackathon.id,
            "team_id": test_team.id,
            "submission_id": test_sub.id,
            "judge_id": judge_record.id,
        }
    finally:
        try:
            db.query(Evaluation).filter(Evaluation.submission_id == test_sub.id).delete()
            db.query(JudgeAssignment).filter(JudgeAssignment.team_id == test_team.id).delete()
            db.query(Submission).filter(Submission.id == test_sub.id).delete()
            db.query(Team).filter(Team.id == test_team.id).delete()
            db.commit()
        except Exception:
            db.rollback()
        db.close()


def test_get_submission_review_unauthenticated_returns_401(review_test_data):
    sub_id = review_test_data["submission_id"]
    res = client.get(f"/api/v1/judge/submissions/{sub_id}/review")
    assert res.status_code == 401


def test_get_submission_review_participant_forbidden_returns_403(review_test_data):
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    sub_id = review_test_data["submission_id"]
    res = client.get(f"/api/v1/judge/submissions/{sub_id}/review", headers=headers)
    assert res.status_code == 403


def test_get_submission_review_not_found():
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")
    res = client.get("/api/v1/judge/submissions/99999/review", headers=headers)
    assert res.status_code == 404


def test_get_submission_review_success(review_test_data):
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")
    sub_id = review_test_data["submission_id"]

    res = client.get(f"/api/v1/judge/submissions/{sub_id}/review", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["submission_id"] == sub_id
    assert "submission_code" in data
    assert data["project_title"] == "MediVision AI"
    assert "hackathon" in data
    assert "team" in data
    assert data["team"]["name"] == "Neural Innovators"
    assert "rubric_criteria" in data
    assert len(data["rubric_criteria"]) >= 1

    crit0 = data["rubric_criteria"][0]
    assert "name" in crit0
    assert "max_score" in crit0
    assert "weight" in crit0


def test_evaluate_submission_save_draft_and_submit_final(review_test_data):
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")
    sub_id = review_test_data["submission_id"]

    # 1. Fetch review data to inspect criteria
    review_res = client.get(f"/api/v1/judge/submissions/{sub_id}/review", headers=headers)
    assert review_res.status_code == 200
    criteria = review_res.json()["rubric_criteria"]
    assert len(criteria) > 0

    # 2. Save as Draft
    draft_scores = [
        {"criterion_id": c["id"], "score": round(c["max_score"] * 0.75, 1)}
        for c in criteria
    ]
    draft_payload = {
        "scores": draft_scores,
        "feedback": "Initial impressions: great architecture and clear code documentation.",
        "status": "draft",
        "is_flagged_for_review": False,
    }

    draft_res = client.post(
        f"/api/v1/judge/submissions/{sub_id}/evaluate",
        headers=headers,
        json=draft_payload,
    )
    assert draft_res.status_code == 200
    draft_data = draft_res.json()
    assert draft_data["status"] == "draft"
    assert "Evaluation draft saved successfully." in draft_data["message"]
    eval_id = draft_data["evaluation_id"]

    # 3. Retrieve evaluation by ID
    eval_res = client.get(f"/api/v1/judge/evaluations/{eval_id}", headers=headers)
    assert eval_res.status_code == 200
    assert eval_res.json()["evaluation_id"] == eval_id
    assert eval_res.json()["status"] == "draft"

    # 4. Submit Final Evaluation
    final_scores = [
        {"criterion_id": c["id"], "score": round(c["max_score"] * 0.9, 1)}
        for c in criteria
    ]
    final_payload = {
        "scores": final_scores,
        "feedback": "Outstanding execution! Clean repository, live demo is responsive, and pitch was compelling.",
        "status": "submitted",
        "is_flagged_for_review": False,
    }

    final_res = client.post(
        f"/api/v1/judge/submissions/{sub_id}/evaluate",
        headers=headers,
        json=final_payload,
    )
    assert final_res.status_code == 200
    final_data = final_res.json()
    assert final_data["status"] == "submitted"
    assert final_data["total_score"] >= 80.0
    assert "Evaluation submitted successfully." in final_data["message"]


def test_evaluate_submission_score_validation_error(review_test_data):
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")
    sub_id = review_test_data["submission_id"]

    review_res = client.get(f"/api/v1/judge/submissions/{sub_id}/review", headers=headers)
    criteria = review_res.json()["rubric_criteria"]
    crit0 = criteria[0]

    # Score exceeding max_score
    invalid_payload = {
        "scores": [{"criterion_id": crit0["id"], "score": crit0["max_score"] + 50}],
        "feedback": "Invalid score test",
        "status": "submitted",
    }
    res = client.post(
        f"/api/v1/judge/submissions/{sub_id}/evaluate",
        headers=headers,
        json=invalid_payload,
    )
    assert res.status_code == 400
    assert "must be between 0 and" in res.json()["detail"]


def test_evaluate_submission_anomaly_flagging(review_test_data):
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")
    sub_id = review_test_data["submission_id"]

    review_res = client.get(f"/api/v1/judge/submissions/{sub_id}/review", headers=headers)
    criteria = review_res.json()["rubric_criteria"]

    # Flag for organizer review
    flagged_payload = {
        "scores": [{"criterion_id": c["id"], "score": 10} for c in criteria],
        "feedback": "Suspected duplicate project repository.",
        "status": "submitted",
        "is_flagged_for_review": True,
        "flag_reason": "Suspected duplicate project repository.",
    }
    res = client.post(
        f"/api/v1/judge/submissions/{sub_id}/evaluate",
        headers=headers,
        json=flagged_payload,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["is_flagged_for_review"] is True
    assert data["flag_reason"] == "Suspected duplicate project repository."
