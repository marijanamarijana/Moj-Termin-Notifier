from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = 'app_users'
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


class Doctor(Base):
    __tablename__ = 'doctors'
    id = Column(Integer, primary_key=True) # index=True if it's slow in the future
    full_name = Column(String, nullable=False)


class DoctorTimeslot(Base):
    __tablename__ = 'free_slots'
    id = Column(Integer, primary_key=True, autoincrement=True)
    free_slot = Column(DateTime, nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))

    doctor = relationship("Doctor", backref="free_slots")


class DoctorSubscription(Base):
    __tablename__ = 'subscriptions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("app_users.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))

    user = relationship("User", backref="subscriptions")
    doctor = relationship("Doctor", backref="subscriptions")
