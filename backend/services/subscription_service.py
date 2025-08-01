from sqlalchemy.orm import Session
from model.models import DoctorSubscription
from repos import subscribed_repo


def create_subscription(db: Session, user_id: int, doctor_id: int):
    sub = DoctorSubscription(user_id=user_id, doctor_id=doctor_id)
    return subscribed_repo.create(db, sub)


def get_subscription_by_id(db: Session, sub_id: int):
    return subscribed_repo.get_by_id(db, sub_id)


def get_subscriptions_by_user(db: Session, user_id: int):
    return subscribed_repo.get_by_user(db, user_id)


def delete_subscription(db: Session, sub_id: int):
    sub = subscribed_repo.get_by_id(db, sub_id)
    if sub:
        subscribed_repo.delete(db, sub)
        return True
    return False
