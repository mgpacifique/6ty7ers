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


def main():
    db = SessionLocal()
    try:
        staff = seed_staff(db)
        patients = seed_patients(db)
        db.commit()
        print(f"Seeded {len(staff)} staff and {len(patients)} patients.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
