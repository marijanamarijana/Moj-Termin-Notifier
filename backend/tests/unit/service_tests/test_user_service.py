import pytest
from fastapi import HTTPException
from model.models import User
from model.schemas import UserCreate
from services import user_service
from passlib.context import CryptContext
from unittest.mock import patch

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


# smeni i maybe testovite so jwt u security ?
@pytest.fixture
def sample_user_data():
    return UserCreate(
        email="test@example.com",
        username="username",
        password="password"
    )


def test_register_user_success(db_session, sample_user_data):
    new_user = user_service.register_user(db_session, sample_user_data)

    assert new_user.id is not None
    assert new_user.email == "test@example.com"
    assert new_user.username == "username"
    assert new_user.password != "password"
    assert pwd_context.verify("password", new_user.password)


def test_register_user_duplicate_fails(db_session, sample_user_data):
    user_service.register_user(db_session, sample_user_data)

    with pytest.raises(HTTPException) as exc:
        user_service.register_user(db_session, sample_user_data)

    assert exc.value.status_code == 400
    assert "exists" in exc.value.detail


@patch("services.user_service.create_access_token")
def test_login_user_success(mock_token, db_session):
    mock_token.return_value = "mocked.jwt.token"

    hashed_pwd = pwd_context.hash("secret123")
    user = User(email="user@mail.com", username="user1", password=hashed_pwd)
    db_session.add(user)
    db_session.commit()

    result = user_service.login_user(db_session, "user1", "secret123")

    assert result["access_token"] == "mocked.jwt.token"
    assert result["token_type"] == "bearer"
    assert result["user"]["username"] == "user1"


def test_login_user_invalid_username(db_session):
    with pytest.raises(HTTPException) as exc:
        user_service.login_user(db_session, "notfound", "password")

    assert exc.value.status_code == 401
    assert "Invalid credentials" in exc.value.detail


def test_login_user_invalid_password(db_session):
    hashed_pwd = pwd_context.hash("correctpass")
    user = User(email="mail@ex.com", username="userx", password=hashed_pwd)
    db_session.add(user)
    db_session.commit()

    with pytest.raises(HTTPException) as exc:
        user_service.login_user(db_session, "userx", "wrongpass")

    assert exc.value.status_code == 401


def test_get_user_by_id_existing(db_session, sample_user_data):
    user = user_service.register_user(db_session, sample_user_data)
    by_id = user_service.get_user_by_id(db_session, user.id)
    assert by_id.email == user.email


def test_get_user_by_email_existing(db_session, sample_user_data):
    user = user_service.register_user(db_session, sample_user_data)
    by_email = user_service.get_user_by_email(db_session, user.email)
    assert by_email.username == user.username


def test_get_user_by_id_nonexistent(db_session):
    by_id = user_service.get_user_by_id(db_session, 999)
    assert by_id is None


def test_get_user_by_email_nonexistent(db_session, sample_user_data):
    by_id = user_service.get_user_by_email(db_session, "fake@email.com")
    assert by_id is None


def test_get_all_users_returns_list_when_users(db_session, sample_user_data):
    user_service.register_user(db_session, sample_user_data)
    user_service.register_user(db_session, UserCreate(
        email="other@mail.com", username="other_user", password="pass123"
    ))

    users = user_service.get_all_users(db_session)
    assert len(users) == 2
    assert any(u.email == "test@example.com" for u in users)


def test_get_all_users_returns_empty_list_when_no_users(db_session, sample_user_data):
    assert db_session.query(User).count() == 0
    users = user_service.get_all_users(db_session)
    assert len(users) == 0


def test_update_user_existing(db_session, sample_user_data):
    user = user_service.register_user(db_session, sample_user_data)

    updates = {"username": "updated_username"}
    updated = user_service.update_user(db_session, user.id, updates)

    assert updated.username == "updated_username"


def test_update_user_nonexistent(db_session):
    result = user_service.update_user(db_session, 999, {"username": "ghost"})
    assert result is None


def test_delete_user_existing(db_session, sample_user_data):
    user = user_service.register_user(db_session, sample_user_data)
    result = user_service.delete_user(db_session, user.id)
    assert result is True
    assert db_session.query(User).count() == 0


def test_delete_user_nonexistent(db_session):
    result = user_service.delete_user(db_session, 999)
    assert result is False
