import pytest
from pydantic import ValidationError
from model.schemas import UserCreate, LoginRequest, DoctorCreate


def test_user_create_valid():
    user = UserCreate(email="test@example.com", username="marija", password="secret")
    assert user.email == "test@example.com"
    assert user.username == "marija"
    assert user.password == "secret"


@pytest.mark.parametrize(
    "data",
    [
        {"username": "username", "password": "12345"},
        {"email": "user@example.com", "password": "12345"},
        {"email": "user@example.com", "username": "username"},
        {},
    ]
)
def test_user_create_missing_fields_parametrized(data):
    with pytest.raises(ValidationError):
        UserCreate(**data)


@pytest.mark.parametrize(
    "email",
    [
        "not-an-email",
        "missing-at-symbol.com",
        "@missing-username.com",
        "missing-domain@",
        "a@b",
        "user@@domain.com",
        "user@domain..com",
        "user domain.com",
    ]
)
def test_user_create_invalid_email_parametrized(email):
    with pytest.raises(ValidationError):
        UserCreate(email=email, username="valid_username", password="secret")


def test_login_request_valid():
    login = LoginRequest(email="user@example.com", password="pass123")
    assert login.email == "user@example.com"
    assert login.password == "pass123"


@pytest.mark.parametrize(
    "data",
    [
        {"email": "user@example.com"},
        {"password": "12345"},
        {"email": "invalid-email", "password": "123"},
        {},
    ]
)
def test_login_request_invalid_cases(data):
    with pytest.raises(ValidationError):
        LoginRequest(**data)


def test_doctor_create_with_id():
    doc = DoctorCreate(doctor_id=960614932)
    assert doc.doctor_id == 960614932


def test_doctor_create_missing_field():
    with pytest.raises(ValidationError):
        DoctorCreate()
