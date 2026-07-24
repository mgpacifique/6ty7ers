from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from pydantic import BaseModel

from .. import models
from ..database import get_db
from ..services.auth import require_roles

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

# --- SCHEMAS ---

class WaitTimeMetrics(BaseModel):
    average_wait_time_minutes: float
    average_consult_time_minutes: float
    average_turnaround_time_minutes: float
    total_completed_patients: int

class StatusVolume(BaseModel):
    status: str
    count: int

class PeakHour(BaseModel):
    hour: int
    count: int

class StaffWorkload(BaseModel):
    staff_id: str
    username: str
    role: str
    triage_count: int
    consult_count: int

class AnalyticsDashboardResponse(BaseModel):
    wait_times: WaitTimeMetrics
    volume_by_status: List[StatusVolume]
    peak_hours: List[PeakHour]
    staff_workloads: List[StaffWorkload]

# --- UTILS ---

def get_date_range(start_date: Optional[datetime], end_date: Optional[datetime], period: str):
    now = datetime.now(timezone.utc)
    
    if start_date and end_date:
        return start_date, end_date
        
    if period == "7days":
        start = (now - timedelta(days=7)).replace(hour=0, minute=0, second=0, microsecond=0)
    else: # default to today
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
    return start, now

# --- ENDPOINTS ---

@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
def get_analytics_dashboard(
    start_date: Optional[datetime] = Query(None, description="Start date for custom range"),
    end_date: Optional[datetime] = Query(None, description="End date for custom range"),
    period: Optional[str] = Query("today", description="'today' or '7days'"),
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(
        require_roles(models.RoleEnum.ADMIN.value, models.RoleEnum.DOCTOR.value, models.RoleEnum.NURSE.value)
    )
):
    # 1. Determine Date Range
    s_date, e_date = get_date_range(start_date, end_date, period)

    # Base query for sessions in the date range
    sessions_query = db.query(models.QueueSession).filter(
        models.QueueSession.t1_check_in >= s_date,
        models.QueueSession.t1_check_in <= e_date
    )
    all_sessions_in_range = sessions_query.all()

    # 2. Wait Time Metrics
    completed_sessions = [s for s in all_sessions_in_range if s.t3_completed is not None]
    
    total_wait = 0
    total_consult = 0
    total_turnaround = 0
    count = len(completed_sessions)

    for s in completed_sessions:
        if s.t2_called and s.t1_check_in:
            total_wait += (s.t2_called - s.t1_check_in).total_seconds()
        if s.t3_completed and s.t2_called:
            total_consult += (s.t3_completed - s.t2_called).total_seconds()
        if s.t3_completed and s.t1_check_in:
            total_turnaround += (s.t3_completed - s.t1_check_in).total_seconds()

    wait_metrics = WaitTimeMetrics(
        average_wait_time_minutes=round((total_wait / count / 60) if count > 0 else 0, 1),
        average_consult_time_minutes=round((total_consult / count / 60) if count > 0 else 0, 1),
        average_turnaround_time_minutes=round((total_turnaround / count / 60) if count > 0 else 0, 1),
        total_completed_patients=count
    )

    # 3. Patient Volume & Throughput
    status_counts = {}
    hour_counts = {}
    
    for s in all_sessions_in_range:
        # Group by status
        status_counts[s.status] = status_counts.get(s.status, 0) + 1
        
        # Group by hour
        if s.t1_check_in:
            # ensure tz info is processed correctly or use hour directly
            h = s.t1_check_in.hour
            hour_counts[h] = hour_counts.get(h, 0) + 1

    volume_by_status = [StatusVolume(status=k, count=v) for k, v in status_counts.items()]
    peak_hours = [PeakHour(hour=h, count=c) for h, c in sorted(hour_counts.items(), key=lambda x: x[0])]

    # 4. Staff Workload
    staff_members = db.query(models.Staff).all()
    staff_workloads = []
    
    for staff in staff_members:
        # Count triages and consults manually from the fetched sessions to reduce DB queries
        triage_count = sum(1 for s in all_sessions_in_range if s.triaged_by_staff_id == staff.id)
        consult_count = sum(1 for s in all_sessions_in_range if s.consulted_by_staff_id == staff.id)
        
        # Only include staff who have interacted or are medical staff
        if triage_count > 0 or consult_count > 0 or staff.role in [models.RoleEnum.NURSE.value, models.RoleEnum.DOCTOR.value]:
            staff_workloads.append(StaffWorkload(
                staff_id=str(staff.id),
                username=staff.username,
                role=staff.role,
                triage_count=triage_count,
                consult_count=consult_count
            ))

    return AnalyticsDashboardResponse(
        wait_times=wait_metrics,
        volume_by_status=volume_by_status,
        peak_hours=peak_hours,
        staff_workloads=staff_workloads
    )
