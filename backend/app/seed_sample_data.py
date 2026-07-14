"""Loads a small fixed set of sample rows to demonstrate the schema.

Run from backend/ with DATABASE_URL set:
    python -m app.seed_sample_data
"""

from datetime import datetime, timedelta, timezone

# passlib 1.7.4 crashes with bcrypt >= 4.1, so we call bcrypt directly
import bcrypt

from . import models
from .database import SessionLocal


def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


SAMPLE_STAFF = [
    ("admin_amina", "admin123", models.RoleEnum.ADMIN.value),
    ("nurse_grace", "nurse123", models.RoleEnum.NURSE.value),
    ("doctor_jean", "doctor123", models.RoleEnum.DOCTOR.value),
]

SAMPLE_PATIENTS = [
    ("Aline Uwimana", "+250781000001"),
    ("Eric Niyonzima", "+250781000002"),
    ("Claudine Mukamana", "+250781000003"),
    ("Samuel Habumugisha", "+250781000004"),
    ("Josiane Ingabire", "+250781000005"),
]

SAMPLE_TOKENS = ["EM-101", "EM-102", "FT-201", "FT-202", "FT-203", "FT-204"]


def minutes_ago(minutes):
    return datetime.now(timezone.utc) - timedelta(minutes=minutes)


def seed_staff(db):
    staff_by_username = {}
    for username, password, role in SAMPLE_STAFF:
        member = models.Staff(
            username=username,
            password_hash=hash_password(password),
            role=role,
        )
        db.add(member)
        staff_by_username[username] = member
    db.flush()
    return staff_by_username


def seed_patients(db):
    patients = []
    for full_name, phone_number in SAMPLE_PATIENTS:
        patient = models.Patient(full_name=full_name, phone_number=phone_number)
        db.add(patient)
        patients.append(patient)
    db.flush()
    return patients


def seed_sessions(db, patients, staff):
    nurse = staff["nurse_grace"]
    doctor = staff["doctor_jean"]
    urgent = models.TrackTypeEnum.URGENT.value
    routine = models.TrackTypeEnum.ROUTINE.value

    sessions = [
        models.QueueSession(
            patient_id=patients[0].id,
            public_token="EM-101",
            track_type=urgent,
            priority_score=100,
            status=models.StatusEnum.WAITING.value,
            t1_check_in=minutes_ago(40),
            triaged_by_staff_id=nurse.id,
        ),
        models.QueueSession(
            patient_id=patients[1].id,
            public_token="EM-102",
            track_type=urgent,
            priority_score=100,
            status=models.StatusEnum.CALLED.value,
            t1_check_in=minutes_ago(25),
            t2_called=minutes_ago(5),
            triaged_by_staff_id=nurse.id,
            consulted_by_staff_id=doctor.id,
        ),
        models.QueueSession(
            patient_id=patients[2].id,
            public_token="FT-201",
            track_type=routine,
            priority_score=10,
            status=models.StatusEnum.WAITING.value,
            t1_check_in=minutes_ago(30),
            triaged_by_staff_id=nurse.id,
        ),
        models.QueueSession(
            patient_id=patients[3].id,
            public_token="FT-202",
            track_type=routine,
            priority_score=10,
            status=models.StatusEnum.TRIAGED.value,
            t1_check_in=minutes_ago(20),
            triaged_by_staff_id=nurse.id,
        ),
        # Completed visit with all three timestamps: true wait = T2 - T1 = 24 min
        models.QueueSession(
            patient_id=patients[4].id,
            public_token="FT-203",
            track_type=routine,
            priority_score=10,
            status=models.StatusEnum.COMPLETED.value,
            t1_check_in=minutes_ago(90),
            t2_called=minutes_ago(66),
            t3_completed=minutes_ago(50),
            triaged_by_staff_id=nurse.id,
            consulted_by_staff_id=doctor.id,
        ),
        # Fresh check-in, not triaged yet, so no track
        models.QueueSession(
            patient_id=patients[0].id,
            public_token="FT-204",
            status=models.StatusEnum.REGISTERED.value,
            t1_check_in=minutes_ago(2),
        ),
    ]
    db.add_all(sessions)
    return sessions


def main():
    db = SessionLocal()
    try:
        staff = seed_staff(db)
        patients = seed_patients(db)
        sessions = seed_sessions(db, patients, staff)
        db.commit()
        print(f"Seeded {len(staff)} staff, {len(patients)} patients "
              f"and {len(sessions)} queue sessions.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
