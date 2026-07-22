import random
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
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
def request_otp(data: schemas.PatientOTPRequest, db: Session = Depends(get_db)):
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
    send_sms(patient.phone_number, f"Your 6ty7ers Clinic login code is: {otp_code}")
    
    return {"message": "OTP sent successfully"}

@router.post("/verify-otp")
def verify_otp(data: schemas.PatientOTPVerify, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.phone_number == data.phone_number).first()
    if not patient:
        raise HTTPException(status_code=404, detail="No patient found with this phone number")
    
    if not patient.otp_code or patient.otp_code != data.otp_code:
        raise HTTPException(status_code=401, detail="Invalid OTP code")
        
    if not patient.otp_expires_at or patient.otp_expires_at < datetime.now(timezone.utc):
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
