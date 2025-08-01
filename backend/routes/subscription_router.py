from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from model.models import User
from security.get_current_user import get_current_user
from services import subscription_service
from database.database import get_db

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])


@router.post("/subscribe")
def create_subscription(doctor_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
        #user_id: int,
    subscription = subscription_service.create_subscription(db, current_user.id, doctor_id)
    return subscription


@router.get("/{subscription_id}")
def get_subscription(subscription_id: int, db: Session = Depends(get_db)):
    subscription = subscription_service.get_subscription_by_id(db, subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return subscription


@router.get("/user/{user_id}")
def get_subscriptions_by_user(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return subscription_service.get_subscriptions_by_user(db, current_user.id)


@router.delete("/unsubscribe/{subscription_id}")
def delete_subscription(subscription_id: int, db: Session = Depends(get_db)):
    success = subscription_service.delete_subscription(db, subscription_id)
    if not success:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"detail": "Subscription deleted"}
