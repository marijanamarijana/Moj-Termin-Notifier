import pytest
from datetime import datetime
from model.models import User, Doctor, DoctorTimeslot, DoctorSubscription


def test_user_model_field():
    user = User(email="john@example.com", username="john", password="1234")
    assert user.email == "john@example.com"
    assert user.username == "john"
    assert user.password == "1234"


def test_doctor_model_field():
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    assert doctor.full_name == "ИВА САЈКОВСКА"
    assert doctor.id == 960614932


def test_doctor_timeslot_model_field():
    doctor_timeslot = DoctorTimeslot(free_slot=datetime(2025, 10, 17, 10, 0), doctor_id=960614932)
    # assert doctor_timeslot.id == 1
    assert doctor_timeslot.free_slot == datetime(2025, 10, 17, 10, 0)
    assert doctor_timeslot.doctor_id == 960614932


def test_doctor_subscription_model_field():
    subscription = DoctorSubscription(user_id=99, doctor_id=960614932)
    assert subscription.user_id == 99
    assert subscription.doctor_id == 960614932


def test_doctor_timeslot_relationship():
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    slot = DoctorTimeslot(free_slot=datetime(2025, 10, 17, 10, 0), doctor=doctor)
    assert slot.doctor.full_name == "ИВА САЈКОВСКА"
    assert slot.doctor_id is None


def test_doctor_subscription_relationships():
    user = User(email="john@example.com", username="john", password="1234")
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    sub = DoctorSubscription(user=user, doctor=doctor)

    assert sub.user.username == "john"
    assert sub.doctor.full_name == "ИВА САЈКОВСКА"
    assert len(user.subscriptions) == 1
    assert user.subscriptions[0] == sub
