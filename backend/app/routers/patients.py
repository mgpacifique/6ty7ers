from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..services.auth import get_current_staff
from ..services.websocket import manager
import uuid
import random

router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)

def generate_public_token():
    # Example generator: FT-405
    return f"FT-{random.randint(100, 999)}"

@router.post("/check-in", response_model=schemas.QueueSessionResponse, status_code=status.HTTP_201_CREATED)
def check_in(
    patient_data: schemas.PatientCheckIn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(get_current_staff),
):
    # 1. Create Patient
    db_patient = models.Patient(
        full_name=patient_data.full_name,
        phone_number=patient_data.phone_number
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)

    # 2. Create QueueSession
    db_session = models.QueueSession(
        patient_id=db_patient.id,
        public_token=generate_public_token(),
        status=models.StatusEnum.REGISTERED.value
    )
    db.add(db_session)
    
    # 3. Log event
    log = models.SystemLog(
        event_type="PATIENT_CHECK_IN",
        description=(
            f"Patient {db_patient.id} checked in with token {db_session.public_token} "
            f"by {current_staff.username}"
        )
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_session)
    
    # Broadcast event to all connected WebSocket clients
    broadcast_data = {
        "event": "NEW_PATIENT",
        "data": {
            "session_id": str(db_session.id),
            "public_token": db_session.public_token,
            "status": db_session.status
        }
    }
    background_tasks.add_task(manager.broadcast, broadcast_data)
    
    return db_session
