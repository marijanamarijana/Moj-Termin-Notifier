import pytest
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from model.models import User, Doctor, DoctorTimeslot, DoctorSubscription


def test_user_model_saved_fields(db_session):
    user = User(email="john@example.com", username="john", password="1234")
    db_session.add(user)
    db_session.commit()

    saved = db_session.query(User).first()
    assert saved.email == "john@example.com"
    assert saved.username == "john"
    assert saved.password == "1234"


def test_user_unique_email_constraint(db_session):
    user1 = User(email="bitchass_tests@example.com", username="user1", password="1234")
    db_session.add(user1)
    db_session.commit()

    user2 = User(email="bitchass_tests@example.com", username="user2", password="abcd")
    db_session.add(user2)

    with pytest.raises(IntegrityError):
        db_session.commit()


def test_user_unique_username_constraint(db_session):
    user1 = User(email="john@example.com", username="john", password="1234")
    db_session.add(user1)
    db_session.commit()

    user2 = User(email="john2@example.com", username="john", password="abcd")
    db_session.add(user2)

    with pytest.raises(IntegrityError):
        db_session.commit()


def test_user_non_nullable_fields(db_session): # maybe more tests like this
    user = User(email=None, username=None, password=None)
    db_session.add(user)
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_user_filter_by_field(db_session):
    user = User(email="john@example.com", username="john", password="1234")
    db_session.add(user)
    db_session.commit()

    saved_user = db_session.query(User).filter_by(email="john@example.com").first()
    assert saved_user is not None
    assert saved_user.username == "john"


def test_user_update_field(db_session):
    user = User(email="update@example.com", username="old_username", password="xyz")
    db_session.add(user)
    db_session.commit()

    user.username = "new_username"
    db_session.commit()

    updated_user = db_session.query(User).filter_by(email="update@example.com").first()
    assert updated_user.username == "new_username"


def test_user_delete(db_session):
    user = User(email="delete@example.com", username="some_username", password="xyz")
    db_session.add(user)
    db_session.commit()

    db_session.delete(user)
    db_session.commit()

    deleted_user = db_session.query(User).filter_by(email="delete@example.com").first()
    assert deleted_user is None


def test_doctor_saved_fields(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    saved = db_session.query(Doctor).first()
    assert saved.full_name == "ИВА САЈКОВСКА"
    assert saved.id == 960614932


def test_doctor_non_nullable_fields(db_session):
    doctor = Doctor(id=960614932, full_name=None)
    db_session.add(doctor)
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_doctor_filter_by_field(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    saved_user = db_session.query(Doctor).filter_by(id=960614932).first()
    assert saved_user is not None
    assert saved_user.full_name == "ИВА САЈКОВСКА"


def test_doctor_timeslot_saved_fields(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    timeslot = DoctorTimeslot(free_slot=datetime(2025, 10, 17, 10, 0), doctor_id=doctor.id)
    db_session.add(timeslot)
    db_session.commit()

    saved = db_session.query(DoctorTimeslot).first()
    assert saved.free_slot == datetime(2025, 10, 17, 10, 0)
    assert saved.doctor_id == doctor.id


def test_doctor_timeslot_non_nullable_fields(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    timeslot = DoctorTimeslot(free_slot=None, doctor_id=doctor.id)
    db_session.add(timeslot)
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_doctor_timeslot_filter_by_field(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    timeslot = DoctorTimeslot(free_slot=datetime(2025, 10, 17, 10, 0), doctor_id=doctor.id)
    db_session.add(timeslot)
    db_session.commit()

    saved = db_session.query(DoctorTimeslot).filter_by(doctor_id=960614932).first()
    assert saved is not None
    assert saved.free_slot == datetime(2025, 10, 17, 10, 0)


def test_doctor_timeslot_backref(db_session):
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add(doctor)
    db_session.commit()

    timeslot1 = DoctorTimeslot(free_slot=datetime(2025, 10, 17, 10, 0), doctor=doctor)
    timeslot2 = DoctorTimeslot(free_slot=datetime(2025, 10, 18, 14, 0), doctor=doctor)
    db_session.add_all([timeslot1, timeslot2])
    db_session.commit()

    assert len(doctor.free_slots) == 2
    free_slot_times = [ts.free_slot for ts in doctor.free_slots]
    assert datetime(2025, 10, 17, 10, 0) in free_slot_times
    assert datetime(2025, 10, 18, 14, 0) in free_slot_times


def test_doctor_subscription_saved_fields(db_session):
    user = User(email="john@example.com", username="john", password="1234")
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add_all([user, doctor])
    db_session.commit()

    subscription = DoctorSubscription(user_id=user.id, doctor_id=doctor.id)
    db_session.add(subscription)
    db_session.commit()

    saved = db_session.query(DoctorSubscription).first()
    assert saved.user_id == user.id
    assert saved.doctor_id == doctor.id


def test_doctor_subscription_filter_by_field(db_session):
    user = User(email="john@example.com", username="john", password="1234")
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add_all([user, doctor])
    db_session.commit()

    subscription = DoctorSubscription(user_id=user.id, doctor_id=doctor.id)
    db_session.add(subscription)
    db_session.commit()

    saved_subscription = db_session.query(DoctorSubscription).filter_by(doctor_id=960614932).first()
    assert saved_subscription is not None
    assert saved_subscription.doctor_id == 960614932


def test_doctor_subscription_backref(db_session):
    user = User(email="john@example.com", username="john", password="1234")
    doctor = Doctor(id=960614932, full_name="ИВА САЈКОВСКА")
    db_session.add_all([user, doctor])
    db_session.commit()

    subscription1 = DoctorSubscription(user=user, doctor=doctor)
    subscription2 = DoctorSubscription(user=user, doctor=doctor)
    db_session.add_all([subscription1, subscription2])
    db_session.commit()

    assert len(user.subscriptions) == 2
    assert all(sub.user_id == user.id for sub in user.subscriptions)

    assert len(doctor.subscriptions) == 2
    assert all(sub.doctor_id == doctor.id for sub in doctor.subscriptions)