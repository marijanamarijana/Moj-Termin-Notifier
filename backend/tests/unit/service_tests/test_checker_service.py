import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from datetime import datetime, timedelta
from services import checker_service
from model.models import DoctorTimeslot


@pytest.fixture
def mock_timeslot_service():
    return {
        "get_by_doctor": patch("services.timeslot_service.get_timeslots_by_doctor"),
        "get_from_api": patch("services.timeslot_service.get_timeslots_from_api"),
        "create": patch("services.timeslot_service.create_timeslot"),
        "delete": patch("services.timeslot_service.delete_timeslot")
    }


@pytest.fixture
def mock_email_service():
    return patch("services.email_service.send_email_notification")


@pytest.fixture
def mock_requests():
    return patch("requests.get")


def test_check_new_dates_api_not_found_raises(db_session, mock_requests, mock_timeslot_service, mock_email_service):
    with (
        mock_requests as mock_get,
        mock_timeslot_service["create"] as mock_create,
        mock_email_service as mock_send
    ):
        mock_response = MagicMock(status_code=404)
        mock_get.return_value = mock_response

        with pytest.raises(HTTPException) as exc:
            checker_service.check_new_dates(db_session, 999, "user@mail.com")

        assert exc.value.status_code == 404
        assert "not found" in exc.value.detail.lower()
        mock_send.assert_not_called()
        mock_create.assert_not_called()


def test_check_new_dates_no_new_slots_returns_true(db_session, mock_requests, mock_timeslot_service, mock_email_service):
    with (
        mock_requests as mock_get,
        mock_timeslot_service["get_by_doctor"] as mock_get_by,
        mock_timeslot_service["get_from_api"] as mock_from_api,
        mock_timeslot_service["create"] as mock_create,
        mock_email_service as mock_send
    ):
        now = datetime.now()

        mock_response = MagicMock(status_code=200)
        mock_response.json.return_value = {"name": "doctor iva", "timeslots": []}
        mock_get.return_value = mock_response

        slot = DoctorTimeslot(doctor_id=960614932, free_slot=now + timedelta(days=1))
        mock_get_by.return_value = [slot]
        mock_from_api.return_value = {slot.free_slot}

        result = checker_service.check_new_dates(db_session, 960614932, "user@mail.com")

        assert result is True
        mock_send.assert_not_called()
        mock_create.assert_not_called()


def test_check_new_dates_with_new_slots_creates_and_sends_email(db_session, mock_requests, mock_timeslot_service, mock_email_service):
    with (
        mock_requests as mock_get,
        mock_timeslot_service["get_by_doctor"] as mock_get_by,
        mock_timeslot_service["get_from_api"] as mock_from_api,
        mock_timeslot_service["create"] as mock_create,
        mock_email_service as mock_send
    ):
        now = datetime.now()

        mock_response = MagicMock(status_code=200)
        mock_response.json.return_value = {
            "name": "doctor iva",
            "timeslots": [{"start": "2025-10-30T10:00:00"}]
        }
        mock_get.return_value = mock_response

        old_slot = DoctorTimeslot(id=1, doctor_id=960614932, free_slot=now + timedelta(days=1))
        mock_get_by.return_value = [old_slot]
        mock_from_api.return_value = {datetime(2025, 10, 30, 10, 0)}

        result = checker_service.check_new_dates(db_session, 960614932, "user@mail.com")

        assert result is False
        mock_create.assert_called_once()
        mock_send.assert_called_once()


def test_check_new_dates_deletes_expired_slots(db_session, mock_requests, mock_timeslot_service, mock_email_service):
    with (
        mock_requests as mock_get,
        mock_timeslot_service["get_by_doctor"] as mock_get_by,
        mock_timeslot_service["get_from_api"] as mock_from_api,
        mock_timeslot_service["delete"] as mock_delete,
    ):
        now = datetime.now()

        mock_response = MagicMock(status_code=200)
        mock_response.json.return_value = {"name": "doctor iva", "timeslots": []}
        mock_get.return_value = mock_response

        expired_slot = DoctorTimeslot(id=1, doctor_id=960614932, free_slot=now - timedelta(days=1))
        mock_get_by.return_value = [expired_slot]
        mock_from_api.return_value = set()

        result = checker_service.check_new_dates(db_session, 960614932, "old@mail.com")

        assert result is True
        mock_delete.assert_called_once_with(db_session, expired_slot.id)
