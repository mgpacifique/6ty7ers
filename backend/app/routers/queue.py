from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime, timezone

from .. import models, schemas
from ..database import get_db
from ..services.auth import require_roles
from ..services.smart_logic import calculate_dynamic_priority
from ..services.websocket import manager

router = APIRouter(
    prefix="/queue",
    tags=["Queue"]
)

@router.get("/", response_model=List[schemas.QueueItemResponse])
def get_queue(
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(
        require_roles(models.RoleEnum.ADMIN.value, models.RoleEnum.NURSE.value, models.RoleEnum.DOCTOR.value)
    ),
):
    # Fetch active sessions
    active_statuses = [
        models.StatusEnum.REGISTERED.value,
        models.StatusEnum.TRIAGED.value,
        models.StatusEnum.WAITING.value
    ]
    
    sessions = db.query(models.QueueSession).filter(
        models.QueueSession.status.in_(active_statuses)
    ).all()
    
    response_items = []
    for session in sessions:
        # Calculate dynamic priority
        dyn_priority = calculate_dynamic_priority(session)
        
        # Create response item
        item = schemas.QueueItemResponse(
            id=session.id,
            public_token=session.public_token,
            status=session.status,
            track_type=session.track_type,
            priority_score=session.priority_score,
            t1_check_in=session.t1_check_in,
            dynamic_priority=dyn_priority
        )
        response_items.append(item)
        
    # Sort descending by dynamic priority
    response_items.sort(key=lambda x: x.dynamic_priority, reverse=True)
    return response_items

@router.post("/{session_id}/call", response_model=schemas.QueueSessionResponse)
def call_patient(
    session_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(
        require_roles(models.RoleEnum.ADMIN.value, models.RoleEnum.DOCTOR.value)
    ),
):
    db_session = db.query(models.QueueSession).filter(models.QueueSession.id == session_id).first()
    
    if not db_session:
        raise HTTPException(status_code=404, detail="Queue session not found")
        
    if db_session.status not in [models.StatusEnum.TRIAGED.value, models.StatusEnum.WAITING.value]:
        raise HTTPException(status_code=400, detail=f"Cannot call patient with status: {db_session.status}")

    # Update session
    db_session.status = models.StatusEnum.CALLED.value
    db_session.t2_called = datetime.now(timezone.utc)
    db_session.consulted_by_staff_id = current_staff.id
    
    # Log event
    log = models.SystemLog(
        event_type="PATIENT_CALLED",
        description=(
            f"Session {db_session.public_token} called by {current_staff.username}"
        )
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_session)
    
    # Broadcast event
    broadcast_data = {
        "event": "PATIENT_CALLED",
        "data": {
            "session_id": str(db_session.id),
            "public_token": db_session.public_token,
            "status": db_session.status
        }
    }
    background_tasks.add_task(manager.broadcast, broadcast_data)
    
    # Broadcast updated queue stats
    from ..services.smart_logic import broadcast_queue_stats
    broadcast_queue_stats(db, background_tasks)
    
    # Send Called SMS
    from ..services.sms import send_sms
    call_msg = f"It's your turn! Please proceed to the doctor's room. (Token: {db_session.public_token})"
    background_tasks.add_task(send_sms, db_session.patient.phone_number, call_msg)
    
    return db_session

@router.post("/{session_id}/complete", response_model=schemas.QueueSessionResponse)
def complete_patient(
    session_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(
        require_roles(models.RoleEnum.ADMIN.value, models.RoleEnum.DOCTOR.value)
    ),
):
    db_session = db.query(models.QueueSession).filter(models.QueueSession.id == session_id).first()
    
    if not db_session:
        raise HTTPException(status_code=404, detail="Queue session not found")
        
    if db_session.status != models.StatusEnum.CALLED.value:
        raise HTTPException(status_code=400, detail=f"Cannot complete patient with status: {db_session.status}")

    # Update session
    db_session.status = models.StatusEnum.COMPLETED.value
    db_session.t3_completed = datetime.now(timezone.utc)
    
    # Log event
    log = models.SystemLog(
        event_type="PATIENT_COMPLETED",
        description=(
            f"Session {db_session.public_token} completed by {current_staff.username}"
        )
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_session)
    
    # Broadcast event
    broadcast_data = {
        "event": "PATIENT_COMPLETED",
        "data": {
            "session_id": str(db_session.id),
            "public_token": db_session.public_token,
            "status": db_session.status
        }
    }
    background_tasks.add_task(manager.broadcast, broadcast_data)
    
    # Broadcast updated queue stats
    from ..services.smart_logic import broadcast_queue_stats
    broadcast_queue_stats(db, background_tasks)
    
    return db_session
