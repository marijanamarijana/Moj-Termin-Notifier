from datetime import datetime
import requests
from fastapi import HTTPException
from services import timeslot_service, email_service
from sqlalchemy.orm import Session


def check_new_dates(db: Session, doctor_id: int, user_email: str):
    url = f"https://mojtermin.mk/api/pp/resources/{doctor_id}/slots_availability"
    r = requests.get(url)

    if r.status_code != 200:
        raise HTTPException(detail="Doctor not found or API blocked!")

    doctor_data = r.json()
    old_slots = timeslot_service.get_timeslots_by_doctor(db, doctor_id)
    old_dates = {slot.free_slot for slot in old_slots}
    new_dates = timeslot_service.get_timeslots_from_api(doctor_data["timeslots"])

    now = datetime.utcnow()

    for old_slot in old_slots:
        if old_slot.free_slot < now or old_slot.free_slot not in new_dates:
            timeslot_service.delete_timeslot(db, old_slot.id)

    new_free_slots = new_dates - old_dates

    if new_free_slots:
        doc_name = doctor_data["name"]
        formatted = set()

        for new_free_slot in new_free_slots:
            timeslot_service.create_timeslot(db, doctor_id, new_free_slot)
            formatted.add(new_free_slot.strftime("%H:%M, %d %b %Y"))

        import asyncio
        asyncio.run(
            email_service.send_email_notification(
                to_email=user_email,
                subject="New Available Appointment Slot!",
                body=f"Doctor {doc_name} has new slots available on: {formatted}"
            )
        )
        return False
    return True
