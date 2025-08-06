from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from services.checker_service import check_new_dates
from database.database import SessionLocal
from model.models import DoctorSubscription


def job():
    db: Session = SessionLocal()
    subs = db.query(DoctorSubscription).all()
    for sub in subs:
        user = sub.user
        doctor = sub.doctor
        try:
            if user is None:
                print(f"User with ID {sub.user_id} not found.")
                continue
            if doctor is None:
                print(f"Doctor with ID {sub.doctor_id} not found.")
                continue
            check_new_dates(db, doctor_id=doctor.id, user_email=user.email)
        except Exception as e:
            print(f"Failed for doctor {doctor.id}: {e}")
    db.close()


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(job, "interval", seconds=3600)
    scheduler.start()
