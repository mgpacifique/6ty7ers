import httpx
import time

BASE_URL = "http://localhost:8000"

def test_twilio():
    # 1. Login as admin
    print("Logging in as admin...")
    auth_resp = httpx.post(f"{BASE_URL}/auth/login", data={"username": "admin_amina", "password": "admin123"})
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check in patient
    phone = "+250790855780"
    print(f"Checking in {phone}...")
    checkin_resp = httpx.post(
        f"{BASE_URL}/patients/check-in", 
        json={"full_name": "Test Twilio Final", "phone_number": phone}, 
        headers=headers
    )
    session_data = checkin_resp.json()
    print("Check-in Response:", session_data)
    
    session_id = session_data["id"]

    # 3. Request OTP
    print(f"Requesting OTP for {phone}...")
    otp_resp = httpx.post(
        f"{BASE_URL}/patient-auth/request-otp", 
        json={"phone_number": phone}
    )
    print("OTP Request Response:", otp_resp.json())

    # Wait a moment to let SMS flow
    print("Waiting 5 seconds before triaging the patient...")
    time.sleep(5)

    # 4. Triage Patient
    print(f"Triaging session {session_id}...")
    triage_resp = httpx.post(
        f"{BASE_URL}/triage/{session_id}", 
        json={"track_type": "Routine"},
        headers=headers
    )
    print("Triage Response:", triage_resp.json())

    # 5. Call Patient (Queue update)
    print(f"Calling session {session_id}...")
    call_resp = httpx.post(
        f"{BASE_URL}/queue/{session_id}/call", 
        headers=headers
    )
    print("Call Response:", call_resp.json())

if __name__ == "__main__":
    test_twilio()
