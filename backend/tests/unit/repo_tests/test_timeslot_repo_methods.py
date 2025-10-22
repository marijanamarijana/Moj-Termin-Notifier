import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy.exc import IntegrityError
from model.models import Doctor, DoctorTimeslot
from repos import timeslot_repo


@pytest.fixture
def sample_doctor(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()
    return doctor


def test_create_timeslot(db_session, sample_doctor):
    timeslot = DoctorTimeslot(
        id=1,
        doctor_id=sample_doctor.id,
        free_slot=datetime.now(timezone.utc) + timedelta(days=1)
    )
    created_slot = timeslot_repo.create(db_session, timeslot)

    assert created_slot.doctor_id == sample_doctor.id
    fetched = db_session.query(DoctorTimeslot).filter_by(id=1).first()
    assert fetched is not None
    assert fetched.doctor_id == sample_doctor.id


def test_get_by_id_existing_timeslot(db_session, sample_doctor):
    slot = DoctorTimeslot(
        id=2,
        doctor_id=sample_doctor.id,
        free_slot=datetime.now(timezone.utc) + timedelta(hours=2)
    )
    db_session.add(slot)
    db_session.commit()

    result = timeslot_repo.get_by_id(db_session, 2)
    assert result is not None
    assert result.id == 2
    assert result.doctor_id == sample_doctor.id


def test_get_by_id_nonexistent_timeslot(db_session):
    result = timeslot_repo.get_by_id(db_session, 999)
    assert result is None


def test_get_by_doctor_returns_sorted_list(db_session, sample_doctor):
    now = datetime.now(timezone.utc)
    slots = [
        DoctorTimeslot(doctor_id=sample_doctor.id, free_slot=now + timedelta(hours=3)),
        DoctorTimeslot(doctor_id=sample_doctor.id, free_slot=now + timedelta(hours=1)),
        DoctorTimeslot(doctor_id=sample_doctor.id, free_slot=now + timedelta(hours=2)),
    ]
    db_session.add_all(slots)
    db_session.commit()

    results = timeslot_repo.get_by_doctor(db_session, sample_doctor.id)

    assert len(results) == 3
    ordered_slots = sorted([s.free_slot for s in results])
    assert [s.free_slot for s in results] == ordered_slots


def test_get_by_nonexistent_doctor(db_session):
    results = timeslot_repo.get_by_doctor(db_session, 999)
    assert results == []
    assert len(results) == 0


def test_get_by_doctor_no_slots(db_session, sample_doctor):
    results = timeslot_repo.get_by_doctor(db_session, sample_doctor.id)
    assert results == []


def test_delete_timeslot(db_session, sample_doctor):
    slot = DoctorTimeslot(
        id=20,
        doctor_id=sample_doctor.id,
        free_slot=datetime.now(timezone.utc) + timedelta(hours=5)
    )
    db_session.add(slot)
    db_session.commit()

    assert db_session.query(DoctorTimeslot).filter_by(id=20).count() == 1
    timeslot_repo.delete(db_session, slot)
    assert db_session.query(DoctorTimeslot).filter_by(id=20).count() == 0


def test_two_slots_with_the_same_properties_dont_have_the_same_id(db_session, sample_doctor):
    slot_time = datetime.now(timezone.utc) + timedelta(hours=2)

    slot1 = DoctorTimeslot(doctor_id=sample_doctor.id, free_slot=slot_time)
    slot2 = DoctorTimeslot(doctor_id=sample_doctor.id, free_slot=slot_time)

    timeslot_repo.create(db_session, slot1)
    timeslot_repo.create(db_session, slot2)

    all_slots = db_session.query(DoctorTimeslot).all()
    slot1, slot2 = all_slots[0], all_slots[1]

    assert len(all_slots) == 2
    assert slot1.id != slot2.id
    assert slot1.doctor == slot2.doctor
    assert slot1.free_slot == slot2.free_slot
