from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from database.database import engine
from model.models import Base
from routes import user_router, doctor_router, timeslot_router, subscription_router
from scheduler.scheduler import start_scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI()

start_scheduler()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router.router)
app.include_router(doctor_router.router)
app.include_router(timeslot_router.router)
app.include_router(subscription_router.router)
