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

class TriageSubmit(BaseModel):
    track_type: str  # "Urgent" or "Routine"
    priority_score: Optional[int] = None # Nurse can override or let system calculate
    staff_id: UUID # For unprotected endpoints, we simulate who is doing the triage
