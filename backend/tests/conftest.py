import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from model.models import Base
from database.database import get_db
from fastapi.testclient import TestClient
from main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """
    Create all database tables once before the entire test session,
    and drop them after all tests are done.
    """
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function", autouse=True)
def clean_database():
    """
    Truncate all tables before each test function.
    Keeps schema but removes data so tests don’t leak state.
    """
    with engine.begin() as connection:
        for table in reversed(Base.metadata.sorted_tables):
            connection.execute(table.delete())
    yield


@pytest.fixture()
def db_session():
    """
    Provides a new SQLAlchemy session for each test.
    """
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_session):
    """
    Provides a FastAPI TestClient with the app configured
    to use the test database session.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        try:
            yield c
        finally:
            app.dependency_overrides.pop(get_db, None)

