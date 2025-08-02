from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from model.models import User
from model.schemas import UserCreate
from security.get_current_user import get_current_user
from services import user_service
from database.database import get_db
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/all")
def get_all_users(db: Session = Depends(get_db)):
    return user_service.get_all_users(db)


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    login_result = user_service.login_user(db, form_data.username, form_data.password)
    return JSONResponse(content={
        "token": login_result["access_token"],
        "user": login_result["user"]
    })


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    new_user = user_service.register_user(db, user)
    return JSONResponse(content={"message": f"User {new_user.username} registered successfully."})


@router.get("/{user_id}")
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(detail="User not found")
    return user


@router.get("/email/{user_id}")
def get_user_by_email(user_email: str, db: Session = Depends(get_db)):
    user = user_service.get_user_by_email(db, user_email)
    if not user:
        raise HTTPException(detail="User not found")
    return user


@router.delete("/delete/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    success = user_service.delete_user(db, user_id)
    if not success:
        raise HTTPException(detail="User not found")
    return {"detail": "User deleted"}
