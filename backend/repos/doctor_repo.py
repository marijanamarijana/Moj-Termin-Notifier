from sqlalchemy.orm import Session
from model.models import Doctor


def get_by_id(db: Session, doctor_id: int):
    return db.query(Doctor).filter(Doctor.id == doctor_id).first()


def check_existence(db: Session, doctor_id: int):
    return db.query(db.query(Doctor).filter(Doctor.id == doctor_id).exists()).scalar()


def get_all(db: Session):
    return db.query(Doctor).all()


def create(db: Session, doctor: Doctor):
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor
