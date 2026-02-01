import pytest
from datetime import datetime
from sqlalchemy.orm import Session
from model.models import Doctor, DoctorTimeslot


@pytest.fixture
def sample_doctor(db_session: Session):
    doctor = Doctor(id=960614932, full_name="doctor iva")
    db_session.add(doctor)
    db_session.commit()
    db_session.refresh(doctor)
    return doctor


def test_create_timeslot_success(client, db_session, sample_doctor):
    free_slot = datetime(2025, 10, 26, 9, 30, 0).isoformat()

    response = client.post(f"/api/timeslots/add/{sample_doctor.id}/{free_slot}")
    assert response.status_code == 200

    data = response.json()
    assert data["doctor_id"] == sample_doctor.id

    slot = db_session.query(DoctorTimeslot).filter_by(doctor_id=sample_doctor.id).first()
    assert slot is not None
    assert slot.free_slot == datetime.fromisoformat(free_slot)


def test_create_timeslot_doctor_not_found(client, db_session):
    free_slot = datetime(2025, 10, 26, 9, 30, 0).isoformat()

    response = client.post(f"/api/timeslots/add/999/{free_slot}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Doctor with id 999 not found. Cannot create timeslot!"


def test_get_timeslots_by_doctor_existing(client, db_session, sample_doctor):
    slot1 = DoctorTimeslot(doctor_id=sample_doctor.id, free_slot=datetime(2025, 10, 27, 8, 0, 0))
    slot2 = DoctorTimeslot(doctor_id=sample_doctor.id, free_slot=datetime(2025, 10, 28, 14, 0, 0))
    db_session.add_all([slot1, slot2])
    db_session.commit()

    response = client.get(f"/api/timeslots/doctor/{sample_doctor.id}")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["doctor_id"] == sample_doctor.id


def test_get_timeslots_by_doctor_existing_empty(client, db_session, sample_doctor):
    response = client.get(f"/api/timeslots/doctor/{sample_doctor.id}")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert data == []
    assert len(data) == 0


def test_get_timeslots_by_doctor_nonexistent(client):
    response = client.get("/api/timeslots/doctor/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Doctor with id 999 not found. Cannot get timeslots!"


def test_delete_timeslot_success(client, db_session, sample_doctor):
    slot = DoctorTimeslot(doctor_id=sample_doctor.id, free_slot=datetime(2025, 10, 29, 10, 0, 0))
    db_session.add(slot)
    db_session.commit()
    db_session.refresh(slot)

    response = client.delete(f"/api/timeslots/delete/{slot.id}")
    assert response.status_code == 200
    assert response.json()["detail"] == "Timeslot deleted"

    deleted = db_session.query(DoctorTimeslot).filter_by(id=slot.id).first()
    assert deleted is None


def test_delete_timeslot_nonexistent(client):
    response = client.delete("/api/timeslots/delete/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Timeslot not found"
