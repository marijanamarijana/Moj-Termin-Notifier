import pytest
from fastapi import status
from model.models import User
from sqlalchemy.orm import Session
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


@pytest.fixture
def sample_user_data():
    return {"email": "test@example.com", "username": "username", "password": "password"}


@pytest.fixture
def sample_user(db_session: Session, sample_user_data):
    hashed = pwd_context.hash(sample_user_data["password"])
    user = User(
        email=sample_user_data["email"],
        username=sample_user_data["username"],
        password=hashed
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_client(client, sample_user):
    from security import get_current_user

    def override_get_current_user():
        return sample_user

    client.app.dependency_overrides[get_current_user.get_current_user] = override_get_current_user
    return client


def test_register_user_success(client, db_session, sample_user_data):
    response = client.post("/api/users/register", json=sample_user_data)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert f"User {sample_user_data['username']} registered successfully." in data["message"]

    user = db_session.query(User).filter_by(username=sample_user_data["username"]).first()
    assert user is not None
    assert user.email == sample_user_data["email"]


def test_register_existing_user_email_and_username(client, db_session, sample_user_data, sample_user):
    response = client.post("/api/users/register", json=sample_user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()['detail'] == "User with this email or username already exists"


def test_login_user_success(client, db_session, sample_user):
    form_data = {"username": sample_user.username, "password": "password"}
    response = client.post("/api/users/login", data=form_data)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert "token" in data
    assert "user" in data
    assert data["user"]["username"] == sample_user.username


def test_login_user_invalid_password(client, sample_user):
    form_data = {"username": sample_user.username, "password": "wrong"}
    response = client.post("/api/users/login", data=form_data)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid credentials"


def test_login_user_invalid_username(client, sample_user):
    form_data = {"username": "wrong", "password": sample_user.password}
    response = client.post("/api/users/login", data=form_data)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid credentials"


def test_get_current_user(auth_client, sample_user):
    response = auth_client.get("/api/users/me")
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["id"] == sample_user.id
    assert data["username"] == sample_user.username


def test_get_all_users(client, db_session):
    db_session.add_all([
        User(username="a", email="a@example.com", password=pwd_context.hash("1")),
        User(username="b", email="b@example.com", password=pwd_context.hash("2"))
    ])
    db_session.commit()

    response = client.get("/api/users/all")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) >= 2


def test_get_all_users_empty_list(client, db_session):
    response = client.get("/api/users/all")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 0
    assert response.json() == []


def test_get_user_by_id_success(client, db_session, sample_user):
    response = client.get(f"/api/users/{sample_user.id}")
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["id"] == sample_user.id
    assert data["username"] == sample_user.username


def test_get_user_by_id_not_found(client):
    response = client.get("/api/users/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "User not found"


def test_get_user_by_email(client, db_session, sample_user):
    response = client.get(f"/api/users/email/{sample_user.email}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["email"] == sample_user.email


def test_get_user_by_email_not_found(client):
    response = client.get("/api/users/email/non_existent@example.com")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "User not found"


def test_delete_user(client, db_session, sample_user):
    response = client.delete(f"/api/users/delete/{sample_user.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["detail"] == "User deleted"

    deleted = db_session.get(User, sample_user.id)
    assert deleted is None


def test_delete_user_not_found(client):
    response = client.delete("/api/users/delete/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "User not found"
