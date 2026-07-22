from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..services.auth import require_roles
from ..services.smart_logic import calculate_initial_priority
from ..services.websocket import manager
import uuid

router = APIRouter(
    prefix="/triage",
    tags=["Triage"]
)

@router.post("/{session_id}", response_model=schemas.QueueSessionResponse)
def submit_triage(
    session_id: uuid.UUID,
    triage_data: schemas.TriageSubmit,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(
        require_roles(models.RoleEnum.ADMIN.value, models.RoleEnum.NURSE.value)
    ),
):
    db_session = db.query(models.QueueSession).filter(models.QueueSession.id == session_id).first()
    
    if not db_session:
        raise HTTPException(status_code=404, detail="Queue session not found")
        
    if db_session.status != models.StatusEnum.REGISTERED.value:
        raise HTTPException(status_code=400, detail=f"Cannot triage patient with status: {db_session.status}")

    # Update session
    db_session.track_type = triage_data.track_type
    db_session.priority_score = calculate_initial_priority(triage_data.track_type, triage_data.priority_score)
    db_session.status = models.StatusEnum.TRIAGED.value
    db_session.triaged_by_staff_id = current_staff.id
    
    # Log event
    log = models.SystemLog(
        event_type="PATIENT_TRIAGED",
        description=(
            f"Session {db_session.public_token} triaged as {db_session.track_type} "
            f"with score {db_session.priority_score} by {current_staff.username}"
        )
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_session)
    
    # Broadcast event to all connected WebSocket clients
    broadcast_data = {
        "event": "PATIENT_TRIAGED",
        "data": {
            "session_id": str(db_session.id),
            "public_token": db_session.public_token,
            "status": db_session.status,
            "track_type": db_session.track_type,
            "priority_score": db_session.priority_score
        }
    }
    background_tasks.add_task(manager.broadcast, broadcast_data)
    
    # Broadcast updated queue stats
    from ..services.smart_logic import broadcast_queue_stats
    broadcast_queue_stats(db, background_tasks)
    
    return db_session
