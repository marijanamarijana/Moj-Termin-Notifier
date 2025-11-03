import pytest
from fastapi import HTTPException, status
from model.models import Doctor, DoctorTimeslot
from services import timeslot_service
from datetime import datetime, timedelta


@pytest.fixture
def sample_doctor(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()
    return doctor


@pytest.fixture
def sample_timeslot(db_session):
    timeslot = DoctorTimeslot(doctor_id=960614932, free_slot=datetime(2025, 11, 7, 8, 15))
    db_session.add(timeslot)
    db_session.commit()
    return timeslot


def test_create_timeslot_success(db_session, sample_doctor):
    free_slot = datetime.now() + timedelta(days=1)
    new_slot = timeslot_service.create_timeslot(db_session, doctor_id=sample_doctor.id, free_slot=free_slot)

    assert new_slot.id is not None
    assert new_slot.doctor_id == sample_doctor.id
    assert new_slot.free_slot == free_slot


def test_create_and_filter_timeslot_success(db_session, sample_doctor):
    free_slot = datetime.now() + timedelta(days=1)
    new_slot = timeslot_service.create_timeslot(db_session, doctor_id=sample_doctor.id, free_slot=free_slot)

    assert new_slot.id is not None
    assert new_slot.doctor_id == sample_doctor.id
    assert new_slot.free_slot == free_slot

    db_slot = db_session.query(DoctorTimeslot).filter_by(id=new_slot.id).first()
    assert db_slot is not None


@pytest.mark.parametrize("invalid_datetimes", [
    "not-a-datetime",
    "12-12-12",
    -90,
    324,
    902.12,
    None
])
def test_create_timeslot_invalid_free_slot_type(db_session, sample_doctor, invalid_datetimes):
    with pytest.raises(Exception):
        timeslot_service.create_timeslot(db_session, doctor_id=sample_doctor.id, free_slot=invalid_datetimes)


def test_create_timeslot_doctor_not_found(db_session):
    free_slot = datetime.now() + timedelta(hours=3)
    with pytest.raises(HTTPException) as exc:
        timeslot_service.create_timeslot(db_session, doctor_id=999, free_slot=free_slot)

    assert exc.value.status_code == 404
    assert "Doctor with id 999 not found" in exc.value.detail


def test_get_timeslots_by_doctor_success(db_session, sample_doctor, sample_timeslot):
    results = timeslot_service.get_timeslots_by_doctor(db_session, sample_doctor.id)

    assert len(results) == 1
    assert results[0].id == sample_timeslot.id
    assert results[0].doctor_id == sample_doctor.id


def test_get_timeslots_by_doctor_no_results(db_session, sample_doctor):
    results = timeslot_service.get_timeslots_by_doctor(db_session, doctor_id=sample_doctor.id)
    assert results == []


def test_get_timeslots_by_doctor_nonexistent(db_session):
    with pytest.raises(HTTPException) as exc_info:
        timeslot_service.get_timeslots_by_doctor(db_session, doctor_id=999)

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Doctor with id 999 not found. Cannot get timeslots!"


def test_delete_timeslot_success(db_session, sample_timeslot):
    result = timeslot_service.delete_timeslot(db_session, sample_timeslot.id)

    assert result is True
    remaining = db_session.query(DoctorTimeslot).filter_by(id=sample_timeslot.id).first()
    assert remaining is None


def test_delete_timeslot_not_found(db_session):
    result = timeslot_service.delete_timeslot(db_session, slot_id=999)
    assert result is False


#  graph coverage tests for the get_timeslots_from_api
def test_graph_empty_timeslots():
    timeslots = {}
    result = timeslot_service.get_timeslots_from_api(timeslots)
    assert result == set()


def test_graph_no_slot_info_available_timeslots():
    timeslots = {
        "2025-12-01": [],
        "2025-10-01": []
    }
    result = timeslot_service.get_timeslots_from_api(timeslots)
    assert result == set()


def test_graph_no_slots_available_timeslots():
    timeslots = {
        "2025-11-01": [
            {"term": "2025-11-07T08:15:00", "isAvailable": False, "timeslotType": 2},
            {"term": "2025-11-07T08:40:00", "isAvailable": False, "timeslotType": 2},
        ]
    }
    result = timeslot_service.get_timeslots_from_api(timeslots)
    assert result == set()


def test_graph_slots_available_timeslots():
    timeslots = {
        "2025-11-01": [
            {"term": "2025-11-07T08:15:00", "isAvailable": True, "timeslotType": 2},
            {"term": "2025-11-07T08:40:00", "isAvailable": True, "timeslotType": 2},
        ],
        "2025-12-01": []
    }
    expected = {datetime(2025, 11, 7, 8, 15), datetime(2025, 11, 7, 8, 40)}

    result = timeslot_service.get_timeslots_from_api(timeslots)
    assert result == expected
