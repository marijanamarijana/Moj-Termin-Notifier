import pytest
from model.models import Doctor
from services import doctor_service


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
