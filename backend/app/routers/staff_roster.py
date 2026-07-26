from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..services.auth import require_roles

router = APIRouter(
    prefix="/staff_roster",
    tags=["Staff Roster"]
)

@router.get("/", response_model=List[schemas.StaffOut])
def get_staff_roster(
    db: Session = Depends(get_db),
    current_admin: models.Staff = Depends(require_roles(models.RoleEnum.ADMIN.value))
):
    staff_members = db.query(models.Staff).filter(
        models.Staff.role.in_([models.RoleEnum.DOCTOR.value, models.RoleEnum.NURSE.value])
    ).all()
    return staff_members

@router.put("/{staff_id}", response_model=schemas.StaffOut)
def update_staff(
    staff_id: str,
    data: schemas.StaffUpdate,
    db: Session = Depends(get_db),
    current_admin: models.Staff = Depends(require_roles(models.RoleEnum.ADMIN.value))
):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Staff not found")
        
    if data.username is not None:
        staff.username = data.username
    if data.role is not None:
        staff.role = data.role
    if data.department_id is not None:
        staff.department_id = data.department_id
        
    db.commit()
    db.refresh(staff)
    return staff

@router.delete("/{staff_id}")
def delete_staff(
    staff_id: str,
    db: Session = Depends(get_db),
    current_admin: models.Staff = Depends(require_roles(models.RoleEnum.ADMIN.value))
):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Staff not found")
        
    db.delete(staff)
    db.commit()
    return {"message": "Staff deleted"}
