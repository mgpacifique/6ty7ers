# 6ty7ers Queue Management System - Backend

This is the FastAPI backend for the 6ty7ers Clinic Queue Management System. It handles patient check-in, dynamic priority queuing, role-based access control (RBAC), patient OTP authentication, real-time WebSocket updates, and simulated SMS notifications.

## Key Features & Implementations

### 1. Smart Logic & Dynamic Priority Queuing
To ensure patients are seen in a fair and medically sound order, we implemented a dynamic priority queuing system.
- **Base Scoring**: 
  - `URGENT` track: Base score of 100.
  - `ROUTINE` track: Base score of 10.
- **Dynamic Aging**: To prevent "starvation" (where a routine patient waits forever because urgent patients keep arriving), routine patients gain **2 priority points per minute** of waiting.
- **Time Complexity**: 
  - The `GET /queue/` endpoint calculates the dynamic priority dynamically when requested. 
  - **Fetching Sessions**: $O(N)$ where $N$ is the number of active sessions.
  - **Sorting**: $O(N \log N)$ using Python's built-in Timsort algorithm.
  - **Overall Time Complexity**: $O(N \log N)$. Since $N$ (active patients in the clinic at one time) is relatively small (typically < 100), this operation is extremely fast and scalable.

### 2. Role-Based Access Control (RBAC)
- **Authentication**: JWT-based authentication for both clinic staff and patients.
- **Staff Roles**: Endpoints are protected using a `require_roles` dependency.
  - `ADMIN`: Full access to everything.
  - `NURSE`: Access to triage and queue viewing.
  - `DOCTOR`: Access to calling and completing patients.
- **Password Security**: Uses `passlib` with `bcrypt` for secure password hashing.

### 3. Patient OTP Authentication & Notifications
Patients can securely log in to the web app using their phone number to track their live wait times.
- **Registration**: When a staff member checks in a patient, the system checks for an existing patient by phone number to prevent duplicates. A "Welcome" SMS is dispatched containing their queue token.
- **OTP Generation**: Patients request an OTP (`POST /patient-auth/request-otp`), which generates a secure 6-digit code valid for 5 minutes and dispatches it via a simulated SMS service.
- **Verification**: Patients submit the OTP (`POST /patient-auth/verify-otp`) and receive a specialized `Patient` JWT token. This token strictly grants access to patient-facing features and blocks access to internal staff endpoints (e.g., the full queue list containing PII).
- **Call SMS**: When a doctor calls a patient, an "It's your turn!" SMS is dispatched.

### 4. Real-Time WebSocket Broadcasting
- **Architecture**: A central `ConnectionManager` tracks all active WebSocket clients.
- **Asynchronous Broadcasting**: All major state changes (check-in, triage, call, complete) trigger background tasks that broadcast updates to connected clients without blocking the main HTTP request thread.
- **Queue Stats**: Broadcasts a `QUEUE_STATS` payload containing the total number of waiting, urgent, routine, and unassigned patients for real-time dashboard visualization.

---

## API Documentation

Once the server is running, interactive API documentation is automatically generated.
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Core Endpoints Overview

- **Auth**
  - `POST /auth/login`: Staff login endpoint.
  - `POST /patient-auth/request-otp`: Patient OTP request.
  - `POST /patient-auth/verify-otp`: Patient OTP verification.
- **Patients**
  - `POST /patients/check-in`: Registers a patient and places them in the queue.
- **Triage**
  - `POST /triage/{session_id}`: Assigns track (`URGENT`/`ROUTINE`) and calculates base priority.
- **Queue**
  - `GET /queue/`: Returns the sorted list of active sessions (requires Staff/Nurse/Doctor role).
  - `POST /queue/{session_id}/call`: Marks a patient as being consulted.
  - `POST /queue/{session_id}/complete`: Marks a consultation as finished.
- **History**
  - `GET /history/patient`: Patient visit history (also `GET /history/me`, `GET /patient/history`, requires Patient token).
  - `GET /history/staff`: All visit history across patients with filters (`status`, `patient_id`, `department_id`, `limit`, `offset`).
  - `GET /history/staff/me`: Visit sessions triaged or consulted by the authenticated staff member.
  - `GET /history/patient/{patient_id}`: Visit history lookup for a specific patient ID (requires Staff role).
- **WebSocket**
  - `WS /ws`: Endpoint for real-time JSON event streams.

---

## Local Setup & Testing

### 1. Requirements
- Python 3.10+
- PostgreSQL database (Configured via `DATABASE_URL` in `.env`)

### 2. Installation
```bash
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 3. Database Migrations
We use Alembic for schema migrations.
```bash
alembic upgrade head
```

### 4. Running the Server
Start the FastAPI server using Uvicorn:
```bash
uvicorn app.main:app --reload
```

### 5. Testing Utilities
We provide several test scripts in the root of the backend directory:
- `test_ws.py`: Connects to the WebSocket server and prints real-time broadcast events.
- `test_otp.py`: Simulates the full end-to-end OTP flow (check-in -> request OTP -> fetch from DB -> verify OTP -> test RBAC).

### 6. Test Credentials (Seed Data)
If you run `python -m app.seed_sample_data`, the following test accounts are generated for role-based access testing:
- **Admin**: `admin_amina` / `admin123`
- **Nurse**: `nurse_grace` / `nurse123`
- **Doctor**: `doctor_jean` / `doctor123`