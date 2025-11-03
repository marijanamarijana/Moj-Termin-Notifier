import pytest
from model.models import Doctor
from repos import doctor_repo
from sqlalchemy import exc


def test_create_doctor(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    created = doctor_repo.create(db_session, doctor)

    assert created.id is not None
    assert created.full_name == "ИВА САЈКОВСКА"


def test_get_created_doctor(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    created = doctor_repo.create(db_session, doctor)

    assert created.id is not None
    assert created.full_name == "ИВА САЈКОВСКА"

    fetched = db_session.query(Doctor).filter_by(id=960614932).first()
    assert fetched is not None
    assert fetched.id == created.id


def test_create_doctor_with_missing_required_field(db_session):
    doctor = Doctor(full_name=None) # fali i Id i Full name
    db_session.add(doctor)
    with pytest.raises(exc.IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_get_by_id_existing_doctor(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    result = doctor_repo.get_by_id(db_session, 960614932)
    assert result is not None
    assert result.id == 960614932
    assert result.full_name == "ИВА САЈКОВСКА"


def test_get_by_id_nonexistent_doctor(db_session):
    result = doctor_repo.get_by_id(db_session, 999)
    assert result is None


def test_check_existence_existing_doctor(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    exists = doctor_repo.check_existence(db_session, 960614932)
    assert exists is True


def test_check_existence_nonexistent_doctor(db_session):
    exists = doctor_repo.check_existence(db_session, 3)
    assert exists is False


def test_get_all_returns_all_doctors(db_session):
    doctors = [
        Doctor(id=960614932, full_name="ИВА САЈКОВСКА"),
        Doctor(id=1096535518, full_name="ВАНЧЕ ТРАЈКОВСКА"),
        Doctor(id=879157831, full_name="БОЖИДАР ПОПОСКИ"),
    ]
    db_session.add_all(doctors)
    db_session.commit()

    results = doctor_repo.get_all(db_session)

    assert isinstance(results, list)
    assert len(results) == 3
    names = {d.full_name for d in results}
    assert names == {"ИВА САЈКОВСКА", "ВАНЧЕ ТРАЈКОВСКА", "БОЖИДАР ПОПОСКИ"}


def test_get_all_empty_list(db_session):
    results = doctor_repo.get_all(db_session)
    assert isinstance(results, list)
    assert len(results) == 0
