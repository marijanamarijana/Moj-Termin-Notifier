from datetime import datetime
from sqlalchemy.orm import Session
from model.models import DoctorTimeslot
from repos import timeslot_repo


def create_timeslot(db: Session, doctor_id: int, free_slot: datetime):
    slot = DoctorTimeslot(doctor_id=doctor_id, free_slot=free_slot)
    return timeslot_repo.create(db, slot)


def get_timeslots_from_api(timeslots):
    available_dates = set()

    for key, slots in timeslots.items():
        for slot in slots:
            if slot.get("isAvailable"):
                available_dates.add(slot["term"])

    return available_dates


def get_timeslots_by_doctor(db: Session, doctor_id: int):
    return timeslot_repo.get_by_doctor(db, doctor_id)


def delete_timeslot(db: Session, slot_id: int):
    slot = timeslot_repo.get_by_id(db, slot_id)
    if slot:
        timeslot_repo.delete(db, slot)
        return True
    return False
