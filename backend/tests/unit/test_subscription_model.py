from model.models import Doctor, User, DoctorSubscription


def test_doctor_subscription_model_field():
    subscription = DoctorSubscription(user_id=99, doctor_id=960614932)
    assert subscription.user_id == 99
    assert subscription.doctor_id == 960614932


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