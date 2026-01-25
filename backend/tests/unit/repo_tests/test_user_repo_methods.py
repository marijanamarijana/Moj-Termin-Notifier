import pytest
from model.models import User
from repos import user_repo


@pytest.fixture
def sample_user():
    return User(
        email="test@example.com",
        username="username",
        password="hashedpass123"
    )


def test_create_user(db_session, sample_user):
    created = user_repo.create(db_session, sample_user)
    fetched = db_session.get(User, created.id)

    assert fetched is not None
    assert fetched.email == "test@example.com"
    assert fetched.username == "username"


def test_get_by_id_existing_user(db_session, sample_user):
    db_session.add(sample_user)
    db_session.commit()

    fetched = user_repo.get_by_id(db_session, sample_user.id)
    assert fetched.id == sample_user.id
    assert fetched.email == sample_user.email


def test_get_by_id_nonexistent_user(db_session):
    result = user_repo.get_by_id(db_session, 999)
    assert result is None


def test_get_by_email_existing_user(db_session, sample_user):
    db_session.add(sample_user)
    db_session.commit()

    result = user_repo.get_by_email(db_session, "test@example.com")
    assert result is not None
    assert result.username == "username"


def test_get_by_email_nonexistent_user(db_session):
    result = user_repo.get_by_email(db_session, "nope@example.com")
    assert result is None


@pytest.mark.parametrize(
    "emails",
    [None,
     123,
     "",
     "not-an-email",
     "a@b",
     "              ",
     -43,
     ]
)
def test_get_by_email_nonexistent_user(db_session, emails):
    result = user_repo.get_by_email(db_session, emails)
    assert result is None


@pytest.mark.parametrize(
    "invalid_email", [
    {},
    [],
]
)
def test_by_email_invalid_format(db_session, invalid_email):
    with pytest.raises(Exception):
        user_repo.get_by_email(db_session, invalid_email)


def test_get_all_users(db_session):
    users = [
        User(email=f"user{i}@mail.com", username=f"username{i}", password=f"p{i}")
        for i in range(3)
    ]
    db_session.add_all(users)
    db_session.commit()

    result = user_repo.get_all(db_session)
    assert len(result) == 3
    assert {u.email for u in result} == {"user0@mail.com", "user1@mail.com", "user2@mail.com"}


def test_get_all_users_empty_list(db_session):
    assert db_session.query(User).count() == 0
    users = user_repo.get_all(db_session)
    assert len(users) == 0


@pytest.mark.parametrize(
    "updates",
    [
        {"username": "new_username"},
        {"password": "new_password"},
        {"email": "new_email@example.com"},
        {"username": "new_username", "password": "new_password"},
        {"email": "new_email@example.com", "username": "new_username"},
        {"username": "new_username", "password": "new_password", "email": "new_email@example.com"},
    ]
)
def test_update_user_fields(db_session, sample_user, updates):
    db_session.add(sample_user)
    db_session.commit()

    updated_user = user_repo.update(db_session, sample_user, updates)

    for field, value in updates.items():
        assert getattr(updated_user, field) == value


def test_update_nonexistent_user(db_session, sample_user):
    updates = {"username": "updated_username"}
    with pytest.raises(Exception):
        user_repo.update(db_session, sample_user, updates)


def test_delete_user_success(db_session, sample_user):
    db_session.add(sample_user)
    db_session.commit()

    user_repo.delete(db_session, sample_user)
    remaining = db_session.get(User, sample_user.id)
    assert remaining is None


def test_delete_user_nonexistent(db_session, sample_user):
    with pytest.raises(Exception):
        user_repo.delete(db_session, sample_user)


@pytest.mark.parametrize(
    "invalid_obj", [
        None,
        123,
        "abc",
        {},
        [],
    ])
def test_delete_invalid_user_object(db_session, invalid_obj):
    with pytest.raises(Exception):
        user_repo.delete(db_session, invalid_obj)
