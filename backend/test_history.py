from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models
from app.services.auth import create_access_token, create_patient_access_token
from app.seed_sample_data import main as seed_main

client = TestClient(app)


def test_history_endpoints():
    # 1. Seed sample data
    seed_main()

    db = SessionLocal()
    try:
        # Get sample patient and staff members
        patient = db.query(models.Patient).first()
        staff_admin = db.query(models.Staff).filter(models.Staff.role == models.RoleEnum.ADMIN.value).first()
        staff_doctor = db.query(models.Staff).filter(models.Staff.role == models.RoleEnum.DOCTOR.value).first()
        staff_nurse = db.query(models.Staff).filter(models.Staff.role == models.RoleEnum.NURSE.value).first()

        patient_token = create_patient_access_token(patient)
        admin_token = create_access_token(staff_admin)
        doctor_token = create_access_token(staff_doctor)
        nurse_token = create_access_token(staff_nurse)

        # 2. Test Patient History Endpoint (/history/patient)
        res = client.get(
            "/history/patient",
            headers={"Authorization": f"Bearer {patient_token}"}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        patient_history = res.json()
        assert isinstance(patient_history, list)
        print(f"✅ Patient history fetched successfully: {len(patient_history)} visits found")

        for item in patient_history:
            assert item["patient_id"] == str(patient.id)
            assert "public_token" in item
            assert "status" in item

        # 3. Test Staff History Endpoint (/history/staff) as Admin
        res = client.get(
            "/history/staff",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        staff_history = res.json()
        assert isinstance(staff_history, list)
        print(f"✅ Staff (Admin) history fetched successfully: {len(staff_history)} visits found")

        # 4. Test Staff Filter by Status (/history/staff?status=Completed)
        res = client.get(
            "/history/staff?status=Completed",
            headers={"Authorization": f"Bearer {doctor_token}"}
        )
        assert res.status_code == 200
        completed_history = res.json()
        for item in completed_history:
            assert item["status"] == "Completed"
        print(f"✅ Doctor filtered history (Completed) fetched successfully: {len(completed_history)} items found")

        # 5. Test Doctor My History Endpoint (/history/staff/me)
        res = client.get(
            "/history/staff/me",
            headers={"Authorization": f"Bearer {doctor_token}"}
        )
        assert res.status_code == 200
        my_doctor_history = res.json()
        print(f"✅ Doctor personal history (/history/staff/me) fetched successfully: {len(my_doctor_history)} items found")

        # 6. Test Specific Patient History by ID (/history/patient/{patient_id})
        res = client.get(
            f"/history/patient/{patient.id}",
            headers={"Authorization": f"Bearer {nurse_token}"}
        )
        assert res.status_code == 200
        specific_patient_history = res.json()
        assert len(specific_patient_history) == len(patient_history)
        print(f"✅ Nurse fetched specific patient history by ID: {len(specific_patient_history)} items found")

        # 7. Test Unauthorized Access (No token)
        res = client.get("/history/patient")
        assert res.status_code == 401
        print("✅ Unauthorized request correctly blocked with 401")

        print("🎉 ALL HISTORY ENDPOINT TESTS PASSED SUCCESSFULLY!")
    finally:
        db.close()


if __name__ == "__main__":
    test_history_endpoints()
