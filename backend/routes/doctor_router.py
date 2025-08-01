from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from model.schemas import DoctorCreate
from services import doctor_service
from database.database import get_db

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])


@router.get("/all")
def get_all_doctors(db: Session = Depends(get_db)):
    return doctor_service.get_all_doctors(db)


@router.post("/add")
def add_doctor(doc: DoctorCreate, db: Session = Depends(get_db)):
    doctor = doctor_service.add_doctor(db, doc.doctor_id)
    return doctor


@router.get("/{doctor_id}")
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = doctor_service.get_doctor_by_id(db, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor
