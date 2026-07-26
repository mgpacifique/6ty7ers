from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .. import schemas
from .. import schemas, models
from ..database import get_db
from ..services.auth import authenticate_staff, create_access_token, get_current_staff, register_staff, require_roles

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post("/login", response_model=schemas.AuthTokenResponse)
def login(credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    staff = authenticate_staff(db, credentials.username, credentials.password)
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "access_token": create_access_token(staff),
        "staff": staff,
    }


@router.get("/me", response_model=schemas.StaffOut)
def me(current_staff=Depends(get_current_staff)):
    return current_staff


@router.post("/register", response_model=schemas.StaffOut)
def register(
    staff_data: schemas.StaffRegister,
    db: Session = Depends(get_db),
    current_admin: models.Staff = Depends(require_roles(models.RoleEnum.ADMIN.value))
):
    # Check if username exists
    existing = db.query(models.Staff).filter(models.Staff.username == staff_data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    if staff_data.role not in [models.RoleEnum.NURSE.value, models.RoleEnum.DOCTOR.value, models.RoleEnum.ADMIN.value]:
        raise HTTPException(status_code=400, detail="Invalid role")

    new_staff = register_staff(db, staff_data)
    return new_staff