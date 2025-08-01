from sqlalchemy.orm import Session
from model.models import DoctorTimeslot


def get_by_id(db: Session, slot_id: int) -> DoctorTimeslot:
    return db.query(DoctorTimeslot).filter(DoctorTimeslot.id == slot_id).first()


def get_by_doctor(db: Session, doctor_id: int) -> list[DoctorTimeslot]:
    return db.query(DoctorTimeslot).filter(DoctorTimeslot.doctor_id == doctor_id).all()


def create(db: Session, timeslot: DoctorTimeslot) -> DoctorTimeslot:
    db.add(timeslot)
    db.commit()
    db.refresh(timeslot)
    return timeslot


def delete(db: Session, timeslot: DoctorTimeslot):
    db.delete(timeslot)
    db.commit()
