# 6ty7ers Clinic Queue Management System

A full-stack healthcare queue management application designed to streamline patient registration, triage scoring, waiting list prioritization, and real-time consultation tracking for medical facilities.

---

## 🌟 Key Features

### 1. Dynamic Priority Queuing & Aging Algorithm
* **Track Categorization**:
  * `URGENT` Track: High-priority medical cases (Base score: 100).
  * `ROUTINE` Track: General consultations (Base score: 10).
* **Aging Prevention (Anti-Starvation)**: Routine patients gain **+2 priority points for every minute** spent waiting in the queue to ensure fair medical attention.
* **Complexity**: Queue sorting operates in $O(N \log N)$ time complexity, ensuring fast real-time sorting even under heavy load.

### 2. Department Management
* Categorizes patient queues across clinic departments:
  * **General Medicine**
  * **Emergency / Urgent**
  * **Pediatrics**
  * **Pharmacy**

### 3. Patient Self-Service & OTP Authentication
* **Patient Check-in**: Generates unique queue tokens (e.g., `FT-402`).
* **SMS Notifications**: Automated SMS dispatch via Twilio (or mock fallback) for welcome tokens, OTP codes, and turn calls.
* **Patient Passwordless Login**: Patients log in using their phone number and a 6-digit OTP code to check their live queue status without seeing sensitive staff PII.

### 4. Role-Based Access Control (RBAC)
* JWT Bearer authentication enforcing strict role-based endpoint protection:
  * 👑 **ADMIN**: Complete system administrative access.
  * 🩺 **NURSE**: Triage input, priority scoring, and department assignment.
  * 👨‍⚕️ **DOCTOR**: Patient calling, consultation completion, and medical notes.

### 5. Real-Time WebSocket Updates
* Instant broadcast streams (`/ws`) notify staff dashboards and patient displays of queue movements, status changes (`REGISTERED` $\rightarrow$ `TRIAGED` $\rightarrow$ `WAITING` $\rightarrow$ `CALLED` $\rightarrow$ `COMPLETED`), and live queue statistics.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | FastAPI (Python 3.10+) |
| **Database & ORM** | PostgreSQL / SQLite, SQLAlchemy |
| **Schema Migrations** | Alembic |
| **Security & Auth** | JWT (PyJWT), bcrypt |
| **Real-time Protocol** | WebSockets |
| **SMS Integration** | Twilio REST API |
| **Frontend Framework**| React 19, Vite, React Router 7 |
| **Containerization** | Docker, Docker Compose |

---

## 📂 Project Structure

```text
6ty7ers/
├── backend/                  # FastAPI Backend Application
│   ├── alembic/              # Database schema migrations
│   ├── app/                  # Application code
│   │   ├── main.py           # FastAPI entry point & CORS
│   │   ├── models.py         # SQLAlchemy ORM Models
│   │   ├── schemas.py        # Pydantic data schemas
│   │   ├── database.py       # DB engine & session connection
│   │   ├── seed_sample_data.py # Sample data seeder script
│   │   ├── routers/          # API Route handlers (auth, patients, triage, queue)
│   │   └── services/         # Business logic (SMS, WebSockets, auth)
│   ├── test_otp.py           # End-to-end OTP flow test script
│   ├── test_twilio.py        # End-to-end Twilio SMS test script
│   ├── test_ws.py            # Real-time WebSocket test script
│   └── requirements.txt      # Python dependencies
│
├── 6ty7ers-frontend/         # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/       # Staff & Patient UI components
│   │   ├── pages/            # Page views (Landing, StaffApp, PatientApp)
│   │   ├── App.jsx           # Router configuration
│   │   └── main.jsx          # Vite React entry point
│   ├── package.json          # Node dependencies & scripts
│   └── README.md             # Frontend-specific documentation
│
├── docker-compose.yml        # Multi-container setup
└── README.md                 # Root documentation (this file)
```

---

## 🚀 Getting Started

### Prerequisites
* **Python**: 3.10 or higher
* **Node.js**: 18.x or higher
* **PostgreSQL**: Optional (App automatically falls back to local SQLite if PostgreSQL is unavailable)

---

### 1. Backend Setup

1. **Navigate to backend and activate virtual environment**:
   ```bash
   cd backend
   python3 -m venv ../.venv
   source ../.venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in `backend/`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/queue_db
   SECRET_KEY=dev-secret-key-change-me
   ACCESS_TOKEN_EXPIRE_MINUTES=480
   TWILIO_ACCOUNT_SID=
   TWILIO_AUTH_TOKEN=
   TWILIO_PHONE_NUMBER=
   ```

4. **Run Database Migrations**:
   ```bash
   alembic upgrade head
   ```

5. **Seed Initial Sample Data**:
   ```bash
   python -m app.seed_sample_data
   ```

6. **Start Backend Server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   * **API Base URL**: `http://localhost:8000`
   * **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd 6ty7ers-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   * **Frontend URL**: [http://localhost:5173](http://localhost:5173)

---

### 3. Docker Setup (Optional)

To launch the entire stack using Docker:
```bash
docker-compose up --build
```

---

## 🔐 Pre-configured Test Accounts

When you run `python -m app.seed_sample_data`, the following staff credentials are generated:

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin_amina` | `admin123` | Full access (System Management, Check-in, Triage, Call) |
| **Nurse** | `nurse_grace` | `nurse123` | Check-in, Triage & Priority Scoring |
| **Doctor** | `doctor_jean` | `doctor123` | Calling Patients & Completing Consultations |

---

## 🧪 Testing Utilities

You can run automated test scripts in `backend/`:

* **Test End-to-End OTP Verification**:
  ```bash
  python test_otp.py
  ```
* **Test Twilio SMS Integration**:
  ```bash
  python test_twilio.py
  ```
* **Test Real-time WebSockets**:
  ```bash
  python test_ws.py
  ```

---

## 📄 License
This project is for internal and demonstration purposes. All rights reserved.
