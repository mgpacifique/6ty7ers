from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class PatientCheckIn(BaseModel):
    full_name: str
    phone_number: str

class QueueSessionResponse(BaseModel):
    id: UUID
    public_token: str
    status: str
    track_type: Optional[str] = None
    priority_score: int
    t1_check_in: datetime

    class Config:
        from_attributes = True

class QueueItemResponse(QueueSessionResponse):
    dynamic_priority: int

class StaffOut(BaseModel):
    id: UUID
    username: str
    role: str

    class Config:
        from_attributes = True


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    staff: StaffOut

class TriageSubmit(BaseModel):
    track_type: str  # "Urgent" or "Routine"
    priority_score: Optional[int] = None # Nurse can override or let system calculate

class PatientOTPRequest(BaseModel):
    phone_number: str

class PatientOTPVerify(BaseModel):
    phone_number: str
    otp_code: str

class PatientInfo(BaseModel):
    id: UUID
    full_name: str
    phone_number: str

    class Config:
        from_attributes = True

class VisitHistoryResponse(BaseModel):
    id: UUID
    patient_id: UUID
    public_token: str
    status: str
    track_type: Optional[str] = None
    priority_score: int
    t1_check_in: datetime
    t2_called: Optional[datetime] = None
    t3_completed: Optional[datetime] = None
    wait_time_minutes: Optional[float] = None
    consultation_time_minutes: Optional[float] = None
    department_id: Optional[UUID] = None
    department_name: Optional[str] = None
    triaged_by_staff_id: Optional[UUID] = None
    triaged_by_staff_username: Optional[str] = None
    consulted_by_staff_id: Optional[UUID] = None
    consulted_by_staff_username: Optional[str] = None
    patient: Optional[PatientInfo] = None

    class Config:
        from_attributes = True

