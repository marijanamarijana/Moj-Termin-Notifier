import pytest
from sqlalchemy.exc import IntegrityError
from model.models import User


def test_user_model_field():
    user = User(email="john@example.com", username="john", password="1234")
    assert user.email == "john@example.com"
    assert user.username == "john"
    assert user.password == "1234"


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