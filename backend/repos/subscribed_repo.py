from sqlalchemy.orm import Session
from model.models import DoctorSubscription


def get_by_id(db: Session, subscription_id: int):
    return db.query(DoctorSubscription).filter(DoctorSubscription.id == subscription_id).first()


def get_by_user(db: Session, user_id: int) -> list[DoctorSubscription]:
    return db.query(DoctorSubscription).filter(DoctorSubscription.user_id == user_id).all()


# def get_by_user_and_doctor(db: Session, user_id: int, doctor_id: int):
#     return db.query(DoctorSubscription).filter(
#         DoctorSubscription.user_id == user_id,
#         DoctorSubscription.doctor_id == doctor_id
#     ).first()


def create(db: Session, sub: DoctorSubscription):
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def delete(db: Session, sub: DoctorSubscription):
    db.delete(sub)
    db.commit()
