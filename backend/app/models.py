import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base
import enum

class RoleEnum(str, enum.Enum):
    ADMIN = "Admin"
    NURSE = "Nurse"
    DOCTOR = "Doctor"

class TrackTypeEnum(str, enum.Enum):
    URGENT = "Urgent"
    ROUTINE = "Routine"

class StatusEnum(str, enum.Enum):
    REGISTERED = "Registered"
    TRIAGED = "Triaged"
    WAITING = "Waiting"
    CALLED = "Called"
    COMPLETED = "Completed"

# Designing the database schema

# Patients table

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False) # Might use application-level encryption later
    phone_number = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    sessions = relationship("QueueSession", back_populates="patient")

# Staff table

class Staff(Base):
    __tablename__ = "staff"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # Using String instead of strict Enum per ERD
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    triaged_sessions = relationship("QueueSession", foreign_keys="[QueueSession.triaged_by_staff_id]", back_populates="triaged_by")
    consulted_sessions = relationship("QueueSession", foreign_keys="[QueueSession.consulted_by_staff_id]", back_populates="consulted_by")

# Queue session table

class QueueSession(Base):
    __tablename__ = "queue_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    
    public_token = Column(String, unique=True, index=True, nullable=False) # e.g., FT-405
    track_type = Column(String, nullable=True) # "Urgent", "Routine" - set after triage
    priority_score = Column(Integer, default=0)
    status = Column(String, default=StatusEnum.REGISTERED.value) 
    
    t1_check_in = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    t2_called = Column(DateTime(timezone=True), nullable=True)
    t3_completed = Column(DateTime(timezone=True), nullable=True)

    triaged_by_staff_id = Column(UUID(as_uuid=True), ForeignKey("staff.id"), nullable=True)
    consulted_by_staff_id = Column(UUID(as_uuid=True), ForeignKey("staff.id"), nullable=True)

    patient = relationship("Patient", back_populates="sessions")
    triaged_by = relationship("Staff", foreign_keys=[triaged_by_staff_id], back_populates="triaged_sessions")
    consulted_by = relationship("Staff", foreign_keys=[consulted_by_staff_id], back_populates="consulted_sessions")

# System log table

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String, index=True, nullable=False) # e.g., Emergency_Insertion
    description = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
