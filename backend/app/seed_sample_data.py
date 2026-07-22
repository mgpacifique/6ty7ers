"""Loads a small fixed set of sample rows to demonstrate the schema.

Covers both tracks, every status in the lifecycle and all foreign keys.
Safe to re-run: it deletes its own rows first and touches nothing else.

Run from backend/ with DATABASE_URL set:
    python -m app.seed_sample_data
"""

from datetime import datetime, timedelta, timezone

# passlib 1.7.4 crashes with bcrypt >= 4.1, so we call bcrypt directly
import bcrypt  # type: ignore[import-not-found]

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

SAMPLE_DEPARTMENTS = ["General Medicine", "Emergency / Urgent", "Pediatrics", "Pharmacy"]


def minutes_ago(minutes):
    return datetime.now(timezone.utc) - timedelta(minutes=minutes)


def clear_sample_data(db):
    # Sessions go first because they hold foreign keys to patients, staff and departments
    db.query(models.QueueSession).filter(
        models.QueueSession.public_token.in_(SAMPLE_TOKENS)
    ).delete(synchronize_session=False)

    sample_phones = [phone for _, phone in SAMPLE_PATIENTS]
    db.query(models.Patient).filter(
        models.Patient.phone_number.in_(sample_phones)
    ).delete(synchronize_session=False)

    sample_usernames = [username for username, _, _ in SAMPLE_STAFF]
    db.query(models.Staff).filter(
        models.Staff.username.in_(sample_usernames)
    ).delete(synchronize_session=False)

    db.query(models.Department).filter(
        models.Department.name.in_(SAMPLE_DEPARTMENTS)
    ).delete(synchronize_session=False)

    for token in SAMPLE_TOKENS:
        db.query(models.SystemLog).filter(
            models.SystemLog.description.contains(token)
        ).delete(synchronize_session=False)

    db.commit()


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


def seed_departments(db):
    departments_by_name = {}
    for name in SAMPLE_DEPARTMENTS:
        department = models.Department(name=name)
        db.add(department)
        departments_by_name[name] = department
    db.flush()
    return departments_by_name


def seed_patients(db):
    patients = []
    for full_name, phone_number in SAMPLE_PATIENTS:
        patient = models.Patient(full_name=full_name, phone_number=phone_number)
        db.add(patient)
        patients.append(patient)
    db.flush()
    return patients


def seed_sessions(db, patients, staff, departments):
    nurse = staff["nurse_grace"]
    doctor = staff["doctor_jean"]
    urgent = models.TrackTypeEnum.URGENT.value
    routine = models.TrackTypeEnum.ROUTINE.value

    sessions = [
        models.QueueSession(
            patient_id=patients[0].id,
            department_id=departments["Emergency / Urgent"].id,
            public_token="EM-101",
            track_type=urgent,
            priority_score=100,
            status=models.StatusEnum.WAITING.value,
            t1_check_in=minutes_ago(40),
            triaged_by_staff_id=nurse.id,
        ),
        models.QueueSession(
            patient_id=patients[1].id,
            department_id=departments["Emergency / Urgent"].id,
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
            department_id=departments["General Medicine"].id,
            public_token="FT-201",
            track_type=routine,
            priority_score=10,
            status=models.StatusEnum.WAITING.value,
            t1_check_in=minutes_ago(30),
            triaged_by_staff_id=nurse.id,
        ),
        models.QueueSession(
            patient_id=patients[3].id,
            department_id=departments["Pediatrics"].id,
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
            department_id=departments["Pharmacy"].id,
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
        # Fresh check-in, not triaged yet: no track and no department assigned yet
        models.QueueSession(
            patient_id=patients[0].id,
            public_token="FT-204",
            status=models.StatusEnum.REGISTERED.value,
            t1_check_in=minutes_ago(2),
        ),
    ]
    db.add_all(sessions)
    return sessions


def seed_logs(db):
    logs = [
        models.SystemLog(
            event_type="PATIENT_CHECK_IN",
            description="Patient checked in with token FT-204",
        ),
        models.SystemLog(
            event_type="PATIENT_TRIAGED",
            description="Session FT-202 triaged as Routine with score 10",
        ),
        models.SystemLog(
            event_type="EMERGENCY_INSERTION",
            description="Session EM-101 placed at the head of the Urgent track",
        ),
    ]
    db.add_all(logs)
    return logs


def main():
    db = SessionLocal()
    try:
        clear_sample_data(db)
        staff = seed_staff(db)
        departments = seed_departments(db)
        patients = seed_patients(db)
        sessions = seed_sessions(db, patients, staff, departments)
        logs = seed_logs(db)
        db.commit()
        print(f"Seeded {len(staff)} staff, {len(departments)} departments, "
              f"{len(patients)} patients, {len(sessions)} queue sessions, "
              f"{len(logs)} system logs.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
