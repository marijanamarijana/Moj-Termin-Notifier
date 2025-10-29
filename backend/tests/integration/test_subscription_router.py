import pytest
from fastapi import status
from model.models import User, Doctor, DoctorSubscription
from sqlalchemy.orm import Session


@pytest.fixture
def sample_user(db_session: Session):
    user = User(email="test@example.com", username="username", password="password")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_doctor(db_session: Session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()
    db_session.refresh(doctor)
    return doctor


@pytest.fixture
def auth_client(client, sample_user):
    """Override get_current_user to always return sample_user"""
    from security import get_current_user

    def override_get_current_user():
        return sample_user

    client.app.dependency_overrides[get_current_user.get_current_user] = override_get_current_user
    return client


def test_create_subscription_success(auth_client, db_session, sample_user, sample_doctor):
    response = auth_client.post(f"/api/subscriptions/subscribe/{sample_doctor.id}")

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["doctor_id"] == sample_doctor.id
    assert response.json()["user_id"] == sample_user.id

    subscription = db_session.query(DoctorSubscription).first()
    assert subscription is not None
    assert subscription.user_id == sample_user.id
    assert subscription.doctor_id == sample_doctor.id


def test_create_subscription_doctor_not_found(auth_client, db_session):
    response = auth_client.post(f"/api/subscriptions/subscribe/999")

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()['detail'] == "Doctor with id 999 not found."

    subscription = db_session.query(DoctorSubscription).first()
    assert subscription is None


def test_create_subscription_user_not_found(client, db_session, sample_doctor):
    response = client.post(f"/api/subscriptions/subscribe/{sample_doctor.id}")

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()['detail'] == "User not found."

    subscription = db_session.query(DoctorSubscription).first()
    assert subscription is None


def test_get_subscription_by_id(auth_client, db_session, sample_user, sample_doctor):
    subscription = DoctorSubscription(user_id=sample_user.id, doctor_id=sample_doctor.id)
    db_session.add(subscription)
    db_session.commit()

    response = auth_client.get(f"/api/subscriptions/{subscription.id}")
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["id"] == subscription.id
    assert data["doctor_id"] == sample_doctor.id
    assert data["user_id"] == sample_user.id


def test_get_subscription_by_id_not_found(auth_client):
    response = auth_client.get("/api/subscriptions/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Subscription not found"


def test_get_subscriptions_by_user(auth_client, db_session, sample_user, sample_doctor):
    doc2 = Doctor(id=1096535518, full_name="ВАНЧЕ ТРАЈКОВСКА")
    db_session.add(doc2)

    db_session.add_all([
        DoctorSubscription(user_id=sample_user.id, doctor_id=sample_doctor.id),
        DoctorSubscription(user_id=sample_user.id, doctor_id=doc2.id)
    ])
    db_session.commit()

    response = auth_client.get("/api/subscriptions/user/me")
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert all(sub["user_id"] == sample_user.id for sub in data)


def test_get_subscriptions_by_user_empty_list(auth_client, db_session, sample_user, sample_doctor):
    response = auth_client.get("/api/subscriptions/user/me")
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0
    assert data == []


def test_get_subscriptions_by_user_nonexistent(client, db_session):
    response = client.get("/api/subscriptions/user/me")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "User not found."


def test_delete_subscription_success(auth_client, db_session, sample_user, sample_doctor):
    subscription = DoctorSubscription(user_id=sample_user.id, doctor_id=sample_doctor.id)
    db_session.add(subscription)
    db_session.commit()

    response = auth_client.delete(f"/api/subscriptions/unsubscribe/{subscription.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["detail"] == "Subscription deleted"

    deleted = db_session.get(DoctorSubscription, subscription.id)
    assert deleted is None


def test_delete_subscription_not_found(auth_client):
    response = auth_client.delete("/api/subscriptions/unsubscribe/9999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Subscription not found"
