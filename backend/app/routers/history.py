import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..services.auth import get_current_patient, get_current_staff, require_roles

router = APIRouter(
    tags=["History"]
)


def format_visit_history(session: models.QueueSession) -> schemas.VisitHistoryResponse:
    now = datetime.now(timezone.utc)

    wait_time = None
    if session.t1_check_in:
        end_wait = session.t2_called or session.t3_completed or now
        t1 = session.t1_check_in
        if t1.tzinfo is None:
            t1 = t1.replace(tzinfo=timezone.utc)
        if end_wait.tzinfo is None:
            end_wait = end_wait.replace(tzinfo=timezone.utc)
        wait_time = round((end_wait - t1).total_seconds() / 60.0, 1)

    consult_time = None
    if session.t2_called and session.t3_completed:
        t2 = session.t2_called
        t3 = session.t3_completed
        if t2.tzinfo is None:
            t2 = t2.replace(tzinfo=timezone.utc)
        if t3.tzinfo is None:
            t3 = t3.replace(tzinfo=timezone.utc)
        consult_time = round((t3 - t2).total_seconds() / 60.0, 1)

    patient_info = None
    if session.patient:
        patient_info = schemas.PatientInfo(
            id=session.patient.id,
            full_name=session.patient.full_name,
            phone_number=session.patient.phone_number,
        )

    return schemas.VisitHistoryResponse(
        id=session.id,
        patient_id=session.patient_id,
        public_token=session.public_token,
        status=session.status,
        track_type=session.track_type,
        priority_score=session.priority_score,
        t1_check_in=session.t1_check_in,
        t2_called=session.t2_called,
        t3_completed=session.t3_completed,
        wait_time_minutes=wait_time,
        consultation_time_minutes=consult_time,
        department_id=session.department_id,
        department_name=session.department.name if session.department else None,
        triaged_by_staff_id=session.triaged_by_staff_id,
        triaged_by_staff_username=session.triaged_by.username if session.triaged_by else None,
        consulted_by_staff_id=session.consulted_by_staff_id,
        consulted_by_staff_username=session.consulted_by.username if session.consulted_by else None,
        patient=patient_info,
    )


# 1. Patient history endpoint for logged in patient
@router.get("/history/patient", response_model=List[schemas.VisitHistoryResponse])
@router.get("/history/me", response_model=List[schemas.VisitHistoryResponse])
@router.get("/patient/history", response_model=List[schemas.VisitHistoryResponse])
def get_patient_history(
    db: Session = Depends(get_db),
    current_patient: models.Patient = Depends(get_current_patient),
):
    sessions = (
        db.query(models.QueueSession)
        .filter(models.QueueSession.patient_id == current_patient.id)
        .order_by(models.QueueSession.t1_check_in.desc())
        .all()
    )
    return [format_visit_history(s) for s in sessions]


# 2. Staff endpoint for all visit/session history across patients
@router.get("/history/staff", response_model=List[schemas.VisitHistoryResponse])
def get_staff_history(
    status_filter: Optional[str] = Query(None, alias="status"),
    patient_id: Optional[uuid.UUID] = Query(None),
    department_id: Optional[uuid.UUID] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(
        require_roles(models.RoleEnum.ADMIN.value, models.RoleEnum.DOCTOR.value, models.RoleEnum.NURSE.value)
    ),
):
    query = db.query(models.QueueSession)

    if status_filter:
        query = query.filter(models.QueueSession.status == status_filter)
    if patient_id:
        query = query.filter(models.QueueSession.patient_id == patient_id)
    if department_id:
        query = query.filter(models.QueueSession.department_id == department_id)

    sessions = (
        query.order_by(models.QueueSession.t1_check_in.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [format_visit_history(s) for s in sessions]


# 3. Staff endpoint for sessions handled by the logged in staff member
@router.get("/history/staff/me", response_model=List[schemas.VisitHistoryResponse])
def get_my_staff_history(
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(
        require_roles(models.RoleEnum.ADMIN.value, models.RoleEnum.DOCTOR.value, models.RoleEnum.NURSE.value)
    ),
):
    if current_staff.role == models.RoleEnum.ADMIN.value:
        sessions = (
            db.query(models.QueueSession)
            .order_by(models.QueueSession.t1_check_in.desc())
            .all()
        )
    else:
        sessions = (
            db.query(models.QueueSession)
            .filter(
                (models.QueueSession.triaged_by_staff_id == current_staff.id)
                | (models.QueueSession.consulted_by_staff_id == current_staff.id)
            )
            .order_by(models.QueueSession.t1_check_in.desc())
            .all()
        )
    return [format_visit_history(s) for s in sessions]


# 4. Staff lookup for a specific patient's visit history
@router.get("/history/patient/{patient_id}", response_model=List[schemas.VisitHistoryResponse])
def get_patient_history_by_id(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(
        require_roles(models.RoleEnum.ADMIN.value, models.RoleEnum.DOCTOR.value, models.RoleEnum.NURSE.value)
    ),
):
    sessions = (
        db.query(models.QueueSession)
        .filter(models.QueueSession.patient_id == patient_id)
        .order_by(models.QueueSession.t1_check_in.desc())
        .all()
    )
    return [format_visit_history(s) for s in sessions]
