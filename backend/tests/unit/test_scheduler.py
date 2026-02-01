import pytest
from unittest.mock import patch, MagicMock
from apscheduler.schedulers.background import BackgroundScheduler
from model.models import User, Doctor, DoctorSubscription
from scheduler.scheduler import job, start_scheduler


@pytest.fixture()
def sample_data(db_session):
    user = User(email="test@example.com", username="username", password="password")
    doctor = Doctor(id=960614932, full_name="doctor iva")
    subscription = DoctorSubscription(user_id=user.id, doctor_id=doctor.id, user=user, doctor=doctor)
    db_session.add_all([user, doctor, subscription])
    db_session.commit()
    return user, doctor, subscription


def test_job_calls_check_new_dates(db_session, sample_data):
    mock_db = MagicMock()
    mock_sub = MagicMock()
    mock_sub.user = MagicMock(email="test@example.com")
    mock_sub.doctor = MagicMock(id=960614932)
    mock_db.query.return_value.all.return_value = [mock_sub]

    with patch("scheduler.scheduler.SessionLocal", return_value=mock_db), \
            patch("scheduler.scheduler.check_new_dates") as mock_check:
        job()

    mock_check.assert_called_once_with(mock_db, doctor_id=960614932, user_email="test@example.com")


def test_job_skips_missing_user_or_doctor():
    mock_db = MagicMock()
    mock_sub1 = MagicMock(user=None, doctor=MagicMock(id=2))
    mock_sub2 = MagicMock(user=MagicMock(email="x@x.com"), doctor=None)
    mock_db.query.return_value.all.return_value = [mock_sub1, mock_sub2]

    with patch("scheduler.scheduler.SessionLocal", return_value=mock_db), \
            patch("scheduler.scheduler.check_new_dates") as mock_check:
        job()

    mock_check.assert_not_called()


def test_job_handles_exceptions_gracefully(capsys):
    mock_db = MagicMock()
    mock_sub = MagicMock()
    mock_sub.user = MagicMock(email="user@example.com")
    mock_sub.doctor = MagicMock(id=42)
    mock_db.query.return_value.all.return_value = [mock_sub]

    with patch("scheduler.scheduler.SessionLocal", return_value=mock_db), \
            patch("scheduler.scheduler.check_new_dates", side_effect=Exception("Simulated error")):
        job()

    captured = capsys.readouterr()
    assert "Failed for doctor 42: Simulated error" in captured.out


def test_start_scheduler_adds_and_starts_job(monkeypatch):
    scheduler_mock = MagicMock(spec=BackgroundScheduler)
    monkeypatch.setattr("scheduler.scheduler.BackgroundScheduler", lambda: scheduler_mock)

    start_scheduler()

    scheduler_mock.add_job.assert_called_once()
    scheduler_mock.start.assert_called_once()
