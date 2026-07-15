from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..services.auth import authenticate_staff, create_access_token, get_current_staff

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