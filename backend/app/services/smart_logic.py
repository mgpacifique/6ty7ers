from datetime import datetime, timezone
from sqlalchemy.orm import Session
from .. import models
from .websocket import manager

def calculate_initial_priority(track_type: str, manual_override: int = None) -> int:
    """
    Calculates the initial priority score.
    Urgent = 100, Routine = 10
    """
    if manual_override is not None:
        return manual_override
        
    if track_type == "Urgent":
        return 100
    elif track_type == "Routine":
        return 10
    return 0

def calculate_dynamic_priority(session) -> int:
    """
    Calculates dynamic priority based on initial priority and wait time.
    To prevent starvation, patients gain 2 priority points per minute waited.
    A Routine patient (10) will surpass a new Urgent patient (100) after 45 minutes.
    """
    base = session.priority_score or 0
    if not session.t1_check_in:
        return base
        
    # Calculate minutes waited since check-in
    now = datetime.now(timezone.utc)
    delta = now - session.t1_check_in
    minutes_waited = int(delta.total_seconds() // 60)
    
    # Gain 2 points per minute
    return base + (minutes_waited * 2)

def broadcast_queue_stats(db: Session, background_tasks):
    active_statuses = [
        models.StatusEnum.REGISTERED.value,
        models.StatusEnum.TRIAGED.value,
        models.StatusEnum.WAITING.value
    ]
    sessions = db.query(models.QueueSession).filter(
        models.QueueSession.status.in_(active_statuses)
    ).all()
    
    stats = {
        "total": len(sessions),
        "urgent": sum(1 for s in sessions if s.track_type == "Urgent"),
        "routine": sum(1 for s in sessions if s.track_type == "Routine"),
        "unassigned": sum(1 for s in sessions if not s.track_type)
    }
    background_tasks.add_task(manager.broadcast, {"event": "QUEUE_STATS", "data": stats})
