import random
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from .. import schemas, models
from ..database import get_db
from ..services.sms import send_sms
from ..services.auth import create_patient_access_token

router = APIRouter(
    prefix="/patient-auth",
    tags=["Patient Auth"]
)

@router.post("/request-otp")
def request_otp(data: schemas.PatientOTPRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.phone_number == data.phone_number).first()
    if not patient:
        raise HTTPException(status_code=404, detail="No patient found with this phone number")
    
    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    
    # Set expiration to 5 minutes from now
    patient.otp_code = otp_code
    patient.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    
    db.commit()
    
    # Send SMS
    background_tasks.add_task(send_sms, patient.phone_number, f"Your 6ty7ers Clinic login code is: {otp_code}")
    
    return {"message": "OTP sent successfully", "dev_otp": otp_code}

@router.post("/verify-otp")
def verify_otp(data: schemas.PatientOTPVerify, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.phone_number == data.phone_number).first()
    if not patient:
        raise HTTPException(status_code=404, detail="No patient found with this phone number")
    
    if not patient.otp_code or patient.otp_code != data.otp_code:
        raise HTTPException(status_code=401, detail="Invalid OTP code")

    # Handle both naive and aware datetimes
    otp_expires = patient.otp_expires_at
    if otp_expires and otp_expires.tzinfo is None:
        otp_expires = otp_expires.replace(tzinfo=timezone.utc)

    if not otp_expires or otp_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="OTP code has expired")
        
    # Clear the OTP once used
    patient.otp_code = None
    patient.otp_expires_at = None
    db.commit()
    
    # Generate JWT token
    token = create_patient_access_token(patient)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "message": "Login successful"
    }
