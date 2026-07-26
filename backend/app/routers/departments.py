from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..services.auth import get_current_staff, require_roles

router = APIRouter(
    prefix="/departments",
    tags=["Departments"]
)

@router.get("/", response_model=List[schemas.DepartmentOut])
def get_departments(db: Session = Depends(get_db)):
    departments = db.query(models.Department).all()
    return departments

@router.post("/", response_model=schemas.DepartmentOut)
def create_department(
    dept_data: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    current_admin: models.Staff = Depends(require_roles(models.RoleEnum.ADMIN.value))
):
    existing = db.query(models.Department).filter(models.Department.name == dept_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")
    
    new_dept = models.Department(name=dept_data.name)
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept
