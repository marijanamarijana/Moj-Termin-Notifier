import pytest
from unittest.mock import patch, MagicMock
from model.models import Doctor
from fastapi import status


@patch("services.doctor_service.requests.get")
@patch("services.doctor_service.timeslot_service.get_timeslots_from_api", return_value=[])
@patch("services.doctor_service.timeslot_service.create_timeslot")
def test_add_doctor_success(mock_create, mock_timeslots, mock_get, client, db_session):
    mock_response = MagicMock(status_code=200)
    mock_response.json.return_value = {"name": "ИВА САЈКОВСКА", "timeslots": []}
    mock_get.return_value = mock_response

    payload = {"doctor_id": 960614932}
    response = client.post("/api/doctors/add", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 960614932
    assert data["full_name"] == "ИВА САЈКОВСКА"

    doctor = db_session.query(Doctor).filter(Doctor.id == 960614932).first()
    assert doctor is not None


@pytest.mark.parametrize("doctor_ids", [
    0,
    999,
    -1,
    "960614932",
    3000000000
])
@patch("services.doctor_service.requests.get")
def test_add_doctor_api_not_found_404(mock_get, client, doctor_ids):
    mock_response = MagicMock(status_code=404)
    mock_get.return_value = mock_response

    payload = {"doctor_id": doctor_ids}
    response = client.post("/api/doctors/add", json=payload)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Doctor not found or API blocked"


@pytest.mark.parametrize("invalid_doctor_ids", [
    None,
    " ",
    "bla_blas",
    {},
    [],
    6363.23,
])
@patch("services.doctor_service.requests.get")
def test_add_doctor_api_code_422(mock_get, client, invalid_doctor_ids):
    mock_response = MagicMock(status_code=404)
    mock_get.return_value = mock_response

    payload = {"doctor_id": invalid_doctor_ids}
    response = client.post("/api/doctors/add", json=payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


@patch("services.doctor_service.requests.get")
@patch("services.doctor_service.timeslot_service.get_timeslots_from_api", return_value=[])
@patch("services.doctor_service.timeslot_service.create_timeslot")
def test_add_doctor_already_exists_409(mock_create, mock_timeslots, mock_get, client, db_session):
    doc = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doc)
    db_session.commit()

    mock_response = MagicMock(status_code=200)
    mock_response.json.return_value = {"name": "ИВА САЈКОВСКА", "timeslots": []}
    mock_get.return_value = mock_response

    payload = {"doctor_id": 960614932}
    response = client.post("/api/doctors/add", json=payload)

    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json()["detail"] == "Doctor already exists!"


def test_get_all_doctors_empty(client):
    response = client.get("/api/doctors/all")
    assert response.status_code == 200
    assert response.json() == []
    assert len(response.json()) == 0


def test_get_all_doctors(client, db_session):
    doctors = [
        Doctor(id=960614932, full_name="ИВА САЈКОВСКА"),
        Doctor(id=1096535518, full_name="ВАНЧЕ ТРАЈКОВСКА"),
        Doctor(id=879157831, full_name="БОЖИДАР ПОПОСКИ"),
    ]
    db_session.add_all(doctors)
    db_session.commit()

    response = client.get("/api/doctors/all")
    data = response.json()

    assert response.status_code == 200
    assert data != []
    assert isinstance(data, list)
    assert len(data) == 3

    names = [d["full_name"] for d in data]
    assert "БОЖИДАР ПОПОСКИ" in names
    assert "ВАНЧЕ ТРАЈКОВСКА" in names
    assert "ИВА САЈКОВСКА" in names


def test_get_doctor_by_id_existing(client, db_session):
    doc = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doc)
    db_session.commit()

    response = client.get("/api/doctors/960614932")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 960614932
    assert data["full_name"] == "ИВА САЈКОВСКА"


def test_get_doctor_by_id_nonexistent(client):
    response = client.get("/api/doctors/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Doctor not found"
