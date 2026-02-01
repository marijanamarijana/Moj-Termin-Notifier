import pytest
from model.models import Doctor
from repos import doctor_repo
from sqlalchemy import exc


def test_create_doctor(db_session):
    doctor = Doctor(id=960614932, full_name="doctor iva")
    created = doctor_repo.create(db_session, doctor)

    assert created.id is not None
    assert created.full_name == "doctor iva"


def test_get_created_doctor(db_session):
    doctor = Doctor(id=960614932, full_name="doctor iva")
    created = doctor_repo.create(db_session, doctor)

    assert created.id is not None
    assert created.full_name == "doctor iva"

    fetched = db_session.query(Doctor).filter_by(id=960614932).first()
    assert fetched is not None
    assert fetched.id == created.id


@pytest.mark.parametrize(
    "data",
    [
        {"full_name": None, "id": 960614932},
        {"full_name": None, "id": None},
    ]
)
def test_create_doctor_with_missing_required_field(db_session, data):
    doctor = Doctor(**data)
    db_session.add(doctor)

    with pytest.raises(exc.IntegrityError):
        db_session.commit()

    db_session.rollback()


def test_get_by_id_existing_doctor(db_session):
    doctor = Doctor(id=960614932, full_name="doctor iva")
    db_session.add(doctor)
    db_session.commit()

    result = doctor_repo.get_by_id(db_session, 960614932)
    assert result is not None
    assert result.id == 960614932
    assert result.full_name == "doctor iva"


def test_get_by_id_nonexistent_doctor(db_session):
    result = doctor_repo.get_by_id(db_session, 999)
    assert result is None


def test_check_existence_existing_doctor(db_session):
    doctor = Doctor(id=960614932, full_name="doctor iva")
    db_session.add(doctor)
    db_session.commit()

    exists = doctor_repo.check_existence(db_session, 960614932)
    assert exists is True

@pytest.mark.parametrize(
    "doctor_id", [
        None,
        123,
        "abc",
    ])
def test_check_existence_nonexistent_doctor(db_session, doctor_id):
    exists = doctor_repo.check_existence(db_session, doctor_id)
    assert exists is False

@pytest.mark.parametrize(
        "not_supported_doctor_id", [
        {},
        [],
        {1: "a", 2: "b"},
        (1, 2, 3),
        [23, 45, 32],
        ("r", "t"),
        ])
def test_check_existence_nonexistent_doctor(db_session, not_supported_doctor_id):
    with pytest.raises(Exception):
        doctor_repo.check_existence(db_session, not_supported_doctor_id)


def test_get_all_returns_all_doctors(db_session):
    doctors = [
        Doctor(id=960614932, full_name="doctor iva"),
        Doctor(id=1096535518, full_name="doctor ana"),
        Doctor(id=879157831, full_name="doctor mira"),
    ]
    db_session.add_all(doctors)
    db_session.commit()

    results = doctor_repo.get_all(db_session)

    assert isinstance(results, list)
    assert len(results) == 3
    names = {d.full_name for d in results}
    assert names == {"doctor iva", "doctor ana", "doctor mira"}


def test_get_all_empty_list(db_session):
    results = doctor_repo.get_all(db_session)
    assert isinstance(results, list)
    assert len(results) == 0
