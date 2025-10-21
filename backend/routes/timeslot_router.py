from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services import timeslot_service
from database.database import get_db

router = APIRouter(prefix="/api/timeslots", tags=["Timeslots"])


@router.post("/add/{doctor_id}/{free_slot}")
def create_timeslot(doctor_id: int, free_slot: datetime, db: Session = Depends(get_db)):
    slot = timeslot_service.create_timeslot(db, doctor_id, free_slot)
    return slot


@router.get("/doctor/{doctor_id}")
def get_timeslots_by_doctor(doctor_id: int, db: Session = Depends(get_db)):
    return timeslot_service.get_timeslots_by_doctor(db, doctor_id)


@router.delete("/delete/{timeslot_id}")
def delete_timeslot(timeslot_id: int, db: Session = Depends(get_db)):
    success = timeslot_service.delete_timeslot(db, timeslot_id)
    if not success:
        raise HTTPException(status_code=404, detail="Timeslot not found")
    return {"detail": "Timeslot deleted"}
