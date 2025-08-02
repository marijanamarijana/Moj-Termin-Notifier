from fastapi import HTTPException
from sqlalchemy.orm import Session
from starlette import status
from model.models import User
from model.schemas import UserCreate
from repos import user_repo
from passlib.context import CryptContext
from security.security import create_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def login_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.email, "username": user.username, "user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user":
        {"id": user.id, "username": user.username, "email": user.email}}


def register_user(db: Session, user_data: UserCreate):
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username) # metod u service vakov za sve ova
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )

    hashed_password = pwd_context.hash(user_data.password)

    new_user = User(
        email=user_data.email,
        username=user_data.username,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def get_user_by_id(db: Session, user_id: int):
    return user_repo.get_by_id(db, user_id)


def get_user_by_email(db: Session, email: str):
    return user_repo.get_by_email(db, email)


def get_all_users(db: Session):
    return user_repo.get_all(db)


def update_user(db: Session, user_id: int, updates: dict): # add a router method for this
    user = user_repo.get_by_id(db, user_id)
    if not user:
        return None
    return user_repo.update(db, user, updates)


def delete_user(db: Session, user_id: int):
    user = user_repo.get_by_id(db, user_id)
    if user:
        user_repo.delete(db, user)
        return True
    return False