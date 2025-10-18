import pytest
from pydantic import ValidationError
from model.schemas import UserCreate, LoginRequest, DoctorCreate


def test_user_create_valid():
    user = UserCreate(email="test@example.com", username="marija", password="secret")
    assert user.email == "test@example.com"
    assert user.username == "marija"
    assert user.password == "secret"


def test_user_create_missing_field():
    with pytest.raises(ValidationError):
        UserCreate(username="marija", password="secret")


def test_user_create_invalid_email():
    with pytest.raises(ValidationError):
        UserCreate(email="not-an-email", username="marija", password="secret")


def test_login_request_valid():
    login = LoginRequest(email="user@example.com", password="pass123")
    assert login.email == "user@example.com"
    assert login.password == "pass123"


def test_login_request_missing_field():
    with pytest.raises(ValidationError):
        LoginRequest(email="user@example.com")


def test_doctor_create_with_id():
    doc = DoctorCreate(doctor_id=960614932)
    assert doc.doctor_id == 960614932


def test_doctor_create_missing_field():
    with pytest.raises(ValidationError):
        DoctorCreate()
