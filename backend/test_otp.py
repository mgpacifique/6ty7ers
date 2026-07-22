import asyncio
import httpx
from colorama import Fore, Style, init

init(autoreset=True)

async def test_otp_flow():
    print(f"{Fore.CYAN}Starting OTP Flow Test...{Style.RESET_ALL}")
    
    async with httpx.AsyncClient() as client:
        # 1. Login as Admin
        response = await client.post(
            "http://127.0.0.1:8000/auth/login",
            data={"username": "admin_amina", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if response.status_code != 200:
            print(f"{Fore.RED}Admin login failed!{Style.RESET_ALL}")
            return
            
        admin_token = response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # 2. Check-in a patient
        phone_number = "+250790855780"
        print(f"{Fore.YELLOW}Checking in patient with phone {phone_number}...{Style.RESET_ALL}")
        
        patient_data = {"full_name": "OTP Test Patient", "phone_number": phone_number}
        response = await client.post(
            "http://127.0.0.1:8000/patients/check-in",
            json=patient_data,
            headers=admin_headers
        )
        if response.status_code != 201:
            print(f"{Fore.RED}Check-in failed! {response.text}{Style.RESET_ALL}")
            return
            
        session_id = response.json()["id"]
        print(f"{Fore.GREEN}Check-in successful! Session ID: {session_id}{Style.RESET_ALL}")
        
        # 3. Request OTP
        print(f"{Fore.YELLOW}Requesting OTP...{Style.RESET_ALL}")
        response = await client.post(
            "http://127.0.0.1:8000/patient-auth/request-otp",
            json={"phone_number": phone_number}
        )
        if response.status_code != 200:
            print(f"{Fore.RED}OTP Request failed! {response.text}{Style.RESET_ALL}")
            return
            
        print(f"{Fore.GREEN}OTP Requested successfully! Check backend logs for the OTP.{Style.RESET_ALL}")
        
        # In a real app, the patient gets this via SMS. For testing, we can peek at the database.
        from app.database import SessionLocal
        db = SessionLocal()
        from app import models
        patient = db.query(models.Patient).filter(models.Patient.phone_number == phone_number).order_by(models.Patient.created_at.desc()).first()
        otp_code = patient.otp_code
        db.close()
        
        print(f"{Fore.MAGENTA}Auto-fetched OTP from DB for testing: {otp_code}{Style.RESET_ALL}")
        
        # 4. Verify OTP
        print(f"{Fore.YELLOW}Verifying OTP...{Style.RESET_ALL}")
        response = await client.post(
            "http://127.0.0.1:8000/patient-auth/verify-otp",
            json={"phone_number": phone_number, "otp_code": otp_code}
        )
        
        if response.status_code != 200:
            print(f"{Fore.RED}OTP Verification failed! {response.text}{Style.RESET_ALL}")
            return
            
        patient_token = response.json()["access_token"]
        print(f"{Fore.GREEN}OTP Verified! Received Patient JWT Token.{Style.RESET_ALL}")
        
        patient_headers = {"Authorization": f"Bearer {patient_token}"}
        
        # 5. Try accessing the queue endpoint (should be forbidden or if we open it, it works)
        # Note: /queue/ is restricted to ADMIN/NURSE/DOCTOR. Patients shouldn't see full PII, 
        # but let's test a dummy endpoint or see if it rejects us correctly.
        response = await client.get(
            "http://127.0.0.1:8000/queue/",
            headers=patient_headers
        )
        print(f"{Fore.CYAN}Accessing /queue/ as Patient -> Status: {response.status_code}{Style.RESET_ALL}")
        if response.status_code == 403:
            print(f"{Fore.GREEN}Successfully blocked from accessing staff-only endpoint!{Style.RESET_ALL}")

if __name__ == "__main__":
    asyncio.run(test_otp_flow())
