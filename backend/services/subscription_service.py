from sqlalchemy.orm import Session
from model.models import DoctorSubscription
from repos import subscribed_repo, user_repo, doctor_repo
from fastapi import HTTPException, status


def create_subscription(db: Session, user_id: int, doctor_id: int):
    user = user_repo.get_by_id(db, user_id)
    doctor = doctor_repo.get_by_id(db, doctor_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User not found."
        )

    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with id {doctor_id} not found."
        )

    sub = DoctorSubscription(user_id=user_id, doctor_id=doctor_id)
    return subscribed_repo.create(db, sub)


def get_subscription_by_id(db: Session, sub_id: int):
    return subscribed_repo.get_by_id(db, sub_id)


def get_subscriptions_by_user(db: Session, user_id: int):
    user = user_repo.get_by_id(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User not found."
        )

    return subscribed_repo.get_by_user(db, user_id)


def delete_subscription(db: Session, sub_id: int):
    sub = subscribed_repo.get_by_id(db, sub_id)
    if sub:
        subscribed_repo.delete(db, sub)
        return True
    return False
