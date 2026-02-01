import pytest
from sqlalchemy.orm import Session
from model.models import DoctorSubscription, Doctor, User
from repos import subscribed_repo


@pytest.fixture
def sample_user(db_session: Session):
    user = User(email="user@example.com", username="user", password="password")
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def sample_doctor(db_session: Session):
    doctor = Doctor(id=960614932, full_name="doctor iva")
    db_session.add(doctor)
    db_session.commit()
    return doctor


@pytest.fixture
def sample_subscription(db_session: Session, sample_user, sample_doctor):
    sub = DoctorSubscription(user_id=sample_user.id, doctor_id=sample_doctor.id)
    db_session.add(sub)
    db_session.commit()
    db_session.refresh(sub)
    return sub


def test_create_subscription(db_session: Session, sample_user, sample_doctor):
    new_sub = DoctorSubscription(user_id=sample_user.id, doctor_id=sample_doctor.id)
    created_sub = subscribed_repo.create(db_session, new_sub)

    assert created_sub.id is not None
    assert created_sub.user_id == sample_user.id
    assert created_sub.doctor_id == sample_doctor.id

    from_db = db_session.query(DoctorSubscription).filter_by(id=created_sub.id).first()
    assert from_db is not None


def test_get_by_id_existing(db_session: Session, sample_subscription):
    result = subscribed_repo.get_by_id(db_session, sample_subscription.id)
    assert result is not None
    assert result.user_id == sample_subscription.user_id
    assert result.doctor_id == sample_subscription.doctor_id


def test_get_by_id_nonexistent(db_session: Session):
    result = subscribed_repo.get_by_id(db_session, 999)
    assert result is None


@pytest.mark.parametrize(
    "invalid_id",
    [{}, [], (1, 2), ]
)
def test_get_by_id_invalid_formats(db_session: Session, invalid_id):
    with pytest.raises(Exception):
        subscribed_repo.get_by_id(db_session, invalid_id)


def test_get_by_user_multiple_subs(db_session: Session, sample_user, sample_doctor):
    doctor1 = Doctor(id=1096535518, full_name="doctor ana")
    doctor2 = Doctor(id=879157831, full_name="doctor mira")
    db_session.add_all([doctor1, doctor2, sample_doctor])
    db_session.commit()

    sub1 = DoctorSubscription(user_id=sample_user.id, doctor_id=doctor1.id)
    sub2 = DoctorSubscription(user_id=sample_user.id, doctor_id=doctor2.id)
    sub3 = DoctorSubscription(user_id=sample_user.id, doctor_id=sample_doctor.id)

    db_session.add_all([sub1, sub2, sub3])
    db_session.commit()

    results = subscribed_repo.get_by_user(db_session, sample_user.id)
    assert len(results) >= 3
    doctor_ids = [s.doctor_id for s in results]
    assert doctor1.id, doctor2.id in doctor_ids


def test_delete_subscription(db_session: Session, sample_subscription):
    subscribed_repo.delete(db_session, sample_subscription)
    result = db_session.query(DoctorSubscription).filter_by(id=sample_subscription.id).first()
    assert result is None


@pytest.mark.parametrize(
    "fake_id",
    [0, 999, 123456789, -1]  # different invalid IDs
)
def test_delete_nonexistent_subscription_by_id(db_session: Session, fake_id):
    subscription = subscribed_repo.get_by_id(db_session, fake_id)
    assert subscription is None

    with pytest.raises(Exception):
        subscribed_repo.delete(db_session, subscription)


@pytest.mark.parametrize(
    "invalid_object",
    [
        None,
        DoctorSubscription(),
        DoctorSubscription(id=123, user_id=1, doctor_id=222),
        {"id": 1},
        object(),
    ]
)
def test_delete_invalid_subscription_objects(db_session: Session, invalid_object):
    with pytest.raises(Exception):
        subscribed_repo.delete(db_session, invalid_object)


