from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from model.models import Doctor
from repos import doctor_repo
from services import timeslot_service
import requests


def add_doctor(db: Session, doctor_id: int):
    if doctor_repo.check_existence(db, doctor_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Doctor already exists!"
        )

    url = f"https://mojtermin.mk/api/pp/resources/{doctor_id}/slots_availability"
    r = requests.get(url)

    if r.status_code != 200:
        raise HTTPException(detail="Doctor not found or API blocked")

    if get_doctor_by_id(db, doctor_id):
        raise HTTPException(detail="Doctor already in system")

    doctor_data = r.json()
    name = doctor_data["name"]

    available_dates = timeslot_service.get_timeslots_from_api(doctor_data["timeslots"])

    for date in available_dates:
        timeslot_service.create_timeslot(db, doctor_id, date)

    return doctor_repo.create(db, Doctor(id=doctor_id, full_name=name))


def get_doctor_by_id(db: Session, doctor_id: int):
    return doctor_repo.get_by_id(db, doctor_id)


def get_all_doctors(db: Session):
    return doctor_repo.get_all(db)
