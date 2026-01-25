import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from security.get_current_user import get_current_user
from security.security import create_access_token, verify_access_token, SECRET_KEY, ALGORITHM
from model.models import User
from datetime import timedelta, datetime, timezone
from jose import jwt


@pytest.fixture
def sample_user(db_session):
    user = User(email="user@example.com", username="user", password="hashed")
    db_session.add(user)
    db_session.commit()
    return user


def test_get_current_user_valid_token(db_session, sample_user):
    token = create_access_token({"sub": sample_user.email})
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    user = get_current_user(credentials, db_session)
    assert user.email == sample_user.email
    assert user.username == sample_user.username


def test_get_current_user_invalid_token(db_session):
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid_token")

    with pytest.raises(HTTPException) as exc:
        get_current_user(credentials, db_session)

    assert exc.value.status_code == 401
    assert "Invalid authentication credentials" in str(exc.value.detail)


def test_get_current_user_valid_token_user_nonexistent(db_session, sample_user):
    token = create_access_token({"sub": sample_user.email})
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    db_session.delete(sample_user)
    db_session.commit()

    with pytest.raises(HTTPException) as exc:
        get_current_user(credentials, db_session)

    assert exc.value.status_code == 404
    assert "User not found" in str(exc.value.detail)


def test_get_current_user_user_not_found(db_session):
    token = create_access_token({"sub": "nonexistent@example.com"})
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    with pytest.raises(HTTPException) as exc:
        get_current_user(credentials, db_session)

    assert exc.value.status_code == 404
    assert "User not found" in str(exc.value.detail)


def test_create_and_verify_valid_token(sample_user):
    data = {"sub": sample_user.email, "username": sample_user.username, "user_id": sample_user.id}

    token = create_access_token(data)
    payload = verify_access_token(token)

    assert payload is not None
    assert payload["sub"] == sample_user.email
    assert payload["username"] == sample_user.username
    assert payload["user_id"] == sample_user.id
    assert "exp" in payload


def test_verify_invalid_token_returns_none():
    invalid_token = "not_a_real_token"

    result = verify_access_token(invalid_token)
    assert result is None


def test_verify_expired_token_returns_none():
    data = {"sub": "user@example.com"}
    expire = datetime.now(timezone.utc) - timedelta(hours=5)
    token = jwt.encode({**data, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

    result = verify_access_token(token)
    assert result is None
