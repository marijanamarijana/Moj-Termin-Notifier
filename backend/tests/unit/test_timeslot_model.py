import pytest
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from model.models import Doctor, DoctorTimeslot


def test_doctor_timeslot_model_field():
    doctor_timeslot = DoctorTimeslot(id=1, free_slot=datetime(2025, 10, 17, 10, 0), doctor_id=960614932)
    assert doctor_timeslot.id == 1
    assert doctor_timeslot.free_slot == datetime(2025, 10, 17, 10, 0)
    assert doctor_timeslot.doctor_id == 960614932


def test_doctor_timeslot_saved_fields(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    timeslot = DoctorTimeslot(free_slot=datetime(2025, 10, 17, 10, 0), doctor_id=doctor.id)
    db_session.add(timeslot)
    db_session.commit()

    saved = db_session.query(DoctorTimeslot).first()
    assert saved.free_slot == datetime(2025, 10, 17, 10, 0)
    assert saved.doctor_id == doctor.id


def test_doctor_timeslot_non_nullable_fields(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    timeslot = DoctorTimeslot(free_slot=None, doctor_id=doctor.id)
    db_session.add(timeslot)
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_doctor_timeslot_filter_by_field(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    timeslot = DoctorTimeslot(free_slot=datetime(2025, 10, 17, 10, 0), doctor_id=doctor.id)
    db_session.add(timeslot)
    db_session.commit()

    saved = db_session.query(DoctorTimeslot).filter_by(doctor_id=960614932).first()
    assert saved is not None
    assert saved.free_slot == datetime(2025, 10, 17, 10, 0)


def test_doctor_timeslot_backref(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    timeslot1 = DoctorTimeslot(free_slot=datetime(2025, 10, 17, 10, 0), doctor=doctor)
    timeslot2 = DoctorTimeslot(free_slot=datetime(2025, 10, 18, 14, 0), doctor=doctor)
    db_session.add_all([timeslot1, timeslot2])
    db_session.commit()

    assert len(doctor.free_slots) == 2
    free_slot_times = [ts.free_slot for ts in doctor.free_slots]
    assert datetime(2025, 10, 17, 10, 0) in free_slot_times
    assert datetime(2025, 10, 18, 14, 0) in free_slot_times