import pytest
from fastapi import HTTPException, status
from model.models import User, Doctor, DoctorSubscription
from services import subscription_service


@pytest.fixture
def sample_user(db_session):
    user = User(id=1, email="test@example.com", username="username", password="password")
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def sample_doctor(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()
    return doctor


def test_create_subscription_success(db_session, sample_user, sample_doctor):
    sub = subscription_service.create_subscription(db_session, sample_user.id, sample_doctor.id)

    assert sub.id is not None
    assert sub.user_id == sample_user.id
    assert sub.doctor_id == sample_doctor.id


def test_create_subscription_user_not_found(db_session, sample_doctor):
    with pytest.raises(HTTPException) as exc:
        subscription_service.create_subscription(db_session, user_id=9999, doctor_id=sample_doctor.id)

    assert exc.value.status_code == status.HTTP_404_NOT_FOUND
    assert "User with id" in exc.value.detail


def test_create_subscription_doctor_not_found(db_session, sample_user):
    with pytest.raises(HTTPException) as exc:
        subscription_service.create_subscription(db_session, user_id=sample_user.id, doctor_id=9999)

    assert exc.value.status_code == status.HTTP_404_NOT_FOUND
    assert "Doctor with id" in exc.value.detail


def test_create_and_find_subscription(db_session, sample_user, sample_doctor):
    sub = subscription_service.create_subscription(db_session, sample_user.id, sample_doctor.id)

    assert sub.id is not None
    assert sub.user_id == sample_user.id
    assert sub.doctor_id == sample_doctor.id

    saved = db_session.query(DoctorSubscription).filter_by(id=sub.id).first()
    assert saved is not None


def test_get_subscription_by_id_existing(db_session, sample_user, sample_doctor):
    sub = DoctorSubscription(user_id=sample_user.id, doctor_id=sample_doctor.id)
    db_session.add(sub)
    db_session.commit()

    fetched = subscription_service.get_subscription_by_id(db_session, sub.id)
    assert fetched.id == sub.id
    assert fetched.user_id == sample_user.id


def test_get_subscription_by_id_does_nonexistent(db_session):
    fetched = subscription_service.get_subscription_by_id(db_session, 999)
    assert fetched is None


def test_get_all_subscriptions_by_user(db_session, sample_user, sample_doctor):
    sub1 = DoctorSubscription(user_id=sample_user.id, doctor_id=sample_doctor.id)
    sub2 = DoctorSubscription(user_id=sample_user.id, doctor_id=sample_doctor.id)
    db_session.add_all([sub1, sub2])
    db_session.commit()

    results = subscription_service.get_subscriptions_by_user(db_session, sample_user.id)
    assert len(results) == 2
    assert all(isinstance(s, DoctorSubscription) for s in results)


def test_get_subscriptions_by_user_empty_list(db_session, sample_user):
    results = subscription_service.get_subscriptions_by_user(db_session, sample_user.id)
    assert results == []
    assert len(results) == 0


def test_get_all_subscriptions_by_user_nonexistent(db_session):
    results = subscription_service.get_subscriptions_by_user(db_session, 999)
    assert results == []
    assert len(results) == 0


def test_delete_subscription_existing(db_session, sample_user, sample_doctor):
    sub = DoctorSubscription(user_id=sample_user.id, doctor_id=sample_doctor.id)
    db_session.add(sub)
    db_session.commit()

    result = subscription_service.delete_subscription(db_session, sub.id)
    assert result is True
    assert db_session.query(DoctorSubscription).filter_by(id=sub.id).first() is None


def test_delete_subscription_nonexistent(db_session):
    result = subscription_service.delete_subscription(db_session, 9999)
    assert result is False
