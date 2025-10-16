import pytest
from sqlalchemy.exc import IntegrityError
from model.models import Doctor


def test_doctor_model_field():
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    assert doctor.full_name == "ИВА САЈКОВСКА"
    assert doctor.id == 960614932


def test_doctor_saved_fields(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    saved = db_session.query(Doctor).first()
    assert saved.full_name == "ИВА САЈКОВСКА"
    assert saved.id == 960614932


def test_user_non_nullable_fields(db_session):
    doctor = Doctor(id=960614932, full_name=None)
    db_session.add(doctor)
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_user_filter_by_field(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    saved_user = db_session.query(Doctor).filter_by(id=960614932).first()
    assert saved_user is not None
    assert saved_user.full_name == "ИВА САЈКОВСКА"


# ne znam dali update i delete da gi test deka nikad nema da se koristat