import pytest
from fastapi import HTTPException, status
from unittest.mock import patch, MagicMock
from model.models import Doctor
from services import doctor_service


@pytest.fixture
def mock_repo():
    return {
        "check_existence": patch("services.doctor_service.doctor_repo.check_existence"),
        "get_by_id": patch("services.doctor_service.get_doctor_by_id"),
        "create": patch("services.doctor_service.doctor_repo.create"),
    }


@pytest.fixture
def mock_timeslot_service():
    return {
        "get_timeslots": patch("services.doctor_service.timeslot_service.get_timeslots_from_api"),
        "create_timeslot": patch("services.doctor_service.timeslot_service.create_timeslot"),
    }


@pytest.fixture
def mock_requests():
    return patch("services.doctor_service.requests.get")


def test_add_doctor_success_returns_multiple_slots(db_session, mock_repo, mock_timeslot_service, mock_requests):
    with (
        mock_repo["check_existence"] as mock_check,
        mock_repo["get_by_id"] as mock_get_by_id,
        mock_repo["create"] as mock_create,
        mock_timeslot_service["get_timeslots"] as mock_get_timeslots,
        mock_timeslot_service["create_timeslot"] as mock_create_timeslot,
        mock_requests as mock_get
    ):
        mock_check.return_value = False
        mock_get_by_id.return_value = None

        mock_response = MagicMock(status_code=200)
        mock_response.json.return_value = {
            "name": "ИВА САЈКОВСКА",
            "timeslots": ["2025-10-23T10:00", "2025-10-23T11:00"]
        }

        mock_get.return_value = mock_response
        mock_get_timeslots.return_value = ["2025-10-23T10:00", "2025-10-23T11:00"]

        doctor_instance = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
        mock_create.return_value = doctor_instance

        result = doctor_service.add_doctor(db_session, 960614932)

        assert result.id == 960614932
        assert result.full_name == "ИВА САЈКОВСКА"
        mock_check.assert_called_once_with(db_session, 960614932)
        mock_get.assert_called_once()
        mock_get_timeslots.assert_called_once_with(["2025-10-23T10:00", "2025-10-23T11:00"])
        assert mock_create_timeslot.call_count == 2
        mock_create.assert_called_once()


def test_add_doctor_with_no_available_dates_creates_doctor_only(db_session, mock_repo, mock_timeslot_service,
                                                                mock_requests):
    with (
        mock_repo["check_existence"] as mock_check,
        mock_repo["get_by_id"] as mock_get_by_id,
        mock_repo["create"] as mock_create,
        mock_timeslot_service["get_timeslots"] as mock_get_timeslots,
        mock_timeslot_service["create_timeslot"] as mock_create_timeslot,
        mock_requests as mock_get
    ):
        mock_check.return_value = False
        mock_get_by_id.return_value = None

        mock_response = MagicMock(status_code=200)
        mock_response.json.return_value = {"name": "ИВА САЈКОВСКА", "timeslots": []}
        mock_get.return_value = mock_response
        mock_get_timeslots.return_value = []

        doctor_instance = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
        mock_create.return_value = doctor_instance

        result = doctor_service.add_doctor(db_session, 960614932)

        assert result.id == 960614932
        assert result.full_name == "ИВА САЈКОВСКА"
        mock_check.assert_called_once_with(db_session, 960614932)
        mock_get.assert_called_once()
        mock_get_timeslots.assert_called_once_with([])
        mock_create_timeslot.assert_not_called()
        mock_create.assert_called_once()


def test_add_doctor_already_exists_raises(db_session, mock_repo):
    with (
        mock_repo["check_existence"] as mock_check,
        mock_repo["get_by_id"] as mock_get_by_id,
        mock_repo["create"] as mock_create
    ):
        mock_check.return_value = True
        mock_get_by_id.return_value = None

        with pytest.raises(HTTPException) as exc:
            doctor_service.add_doctor(db_session, 960614932)

        assert exc.value.status_code == status.HTTP_409_CONFLICT
        assert "Doctor already exists!" in exc.value.detail
        mock_create.assert_not_called()


def test_add_doctor_api_not_found_raises(db_session, mock_repo, mock_requests):
    with (
        mock_repo["check_existence"] as mock_check,
        mock_repo["get_by_id"] as mock_get_by_id,
        mock_repo["create"] as mock_create,
        mock_requests as mock_get
    ):
        mock_check.return_value = False
        mock_get_by_id.return_value = None

        mock_response = MagicMock(status_code=404)
        mock_get.return_value = mock_response

        with pytest.raises(HTTPException) as exc:
            doctor_service.add_doctor(db_session, 960614932)

        assert exc.value.status_code == 404
        assert "not found" in exc.value.detail.lower()
        mock_create.assert_not_called()


def test_get_doctor_by_id_returns_correct_doctor(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    result = doctor_service.get_doctor_by_id(db_session, doctor.id)

    assert result is not None
    assert result.id == doctor.id
    assert result.full_name == "ИВА САЈКОВСКА"


@pytest.mark.parametrize("invalid_id", [
    "abc",
    None,
    -1,
    3.14,
    999,
])
def test_get_doctor_by_id_returns_none_for_nonexistent_id(db_session, invalid_id):
    result = doctor_service.get_doctor_by_id(db_session, invalid_id)
    assert result is None


def test_get_all_doctors_returns_all_entries(db_session):
    doctors = [
        Doctor(id=960614932, full_name="ИВА САЈКОВСКА"),
        Doctor(id=1096535518, full_name="ВАНЧЕ ТРАЈКОВСКА"),
        Doctor(id=879157831, full_name="БОЖИДАР ПОПОСКИ"),
    ]
    db_session.add_all(doctors)
    db_session.commit()

    result = doctor_service.get_all_doctors(db_session)
    assert isinstance(result, list)
    assert len(result) == 3

    names = [d.full_name for d in result]
    assert "БОЖИДАР ПОПОСКИ" in names
    assert "ВАНЧЕ ТРАЈКОВСКА" in names
    assert "ИВА САЈКОВСКА" in names


def test_get_all_doctors_returns_empty_list_when_no_doctors(db_session):
    result = doctor_service.get_all_doctors(db_session)
    assert result == []
    assert len(result) == 0
