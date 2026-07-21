# 6ty7ers Frontend - Queue Management System

A modern React + Vite frontend for the 6ty7ers Clinic Queue Management System. Real-time queue tracking for patients and staff management tools.

## 🚀 Features

### Patient Features
- **Phone-based Login**: Enter phone number to access system
- **OTP Verification**: Secure 6-digit code via SMS
- **Live Queue Tracking**: Real-time status updates (Waiting/Called/Completed)
- **Visit History**: View past visits and consultation details
- **Real-time Updates**: WebSocket for instant changes

### Staff Features
- **Staff Login**: Role-based authentication (Admin/Nurse/Doctor)
- **Patient Check-In**: Register patients with department selection
- **Queue Management**: View urgent and routine patients
- **Call Patients**: Mark as called with SMS notification
- **Complete Consultation**: Track consultation time
- **Dashboard**: Real-time metrics and queue statistics

---

## 🛠️ Tools & Technologies

### Frontend Framework
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router v7** - Client-side routing

### State & Communication
- **React Hooks** - Local component state (useState, useEffect)
- **localStorage** - Persistent authentication tokens and user data
- **WebSocket (native)** - Real-time queue updates and broadcast events
- **Socket.IO client** - Alternatively available for connection management

### Utilities
- **Fetch API** - HTTP requests to backend
- **JavaScript Date API** - Timestamp handling
- **Environment Variables** - Configuration via Vite

### Development Tools
- **ESLint** - Code quality linting
- **Vite HMR** - Hot module reloading in dev

---

## 🏗️ Architecture

### Patient Flow
```
Welcome → Enter Phone → Request OTP → Verify OTP → 
Dashboard (History + Live Queue)
```

### Staff Flow
```
Login → Dashboard → Check In Patients/Call/Complete
```

---

## 📁 Key Components

**Patient Side:**
- `PhoneEntry.jsx` - Phone-based login
- `Verify.jsx` - OTP verification
- `History.jsx` - Past visit history
- `LiveQueue.jsx` - Current queue status with WebSocket updates

**Staff Side:**
- `Login.jsx` - Staff authentication
- `CheckIn.jsx` - Patient registration with department
- `Dashboard.jsx` - Central queue management
- `Triage.jsx` - Priority assignment
- `Consultation.jsx` - Consultation timer and completion

**Shared:**
- `ProtectedRoute.jsx` - Route protection with role checking
- `ErrorBoundary.jsx` - Global error handling

---

## 🔧 Setup & Running

### Installation
```bash
cd 6ty7ers-frontend
npm install
```

### Development Server
```bash
npm run dev
```
Runs at `http://localhost:5173`

### Production Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

---

## 🔌 Backend API Integration

**Base URL**: `http://localhost:8000`

**Core Endpoints Used:**
- `POST /auth/login` - Staff login
- `POST /patient-auth/request-otp` - Request OTP code
- `POST /patient-auth/verify-otp` - Verify OTP and get token
- `POST /patients/check-in` - Register patient (requires department support)
- `GET /queue/` - Get queue list
- `POST /queue/{session_id}/call` - Call patient to room
- `POST /queue/{session_id}/complete` - Mark consultation complete
- `WS /ws` - WebSocket for real-time queue events

**Real-time Events:**
- `NEW_PATIENT` - Patient checked in
- `PATIENT_TRIAGED` - Patient assigned track
- `PATIENT_CALLED` - Patient called to room
- `PATIENT_COMPLETED` - Consultation finished
- `QUEUE_STATS` - Queue statistics update

---

## ⏳ Pending Backend Features

| Feature | Dependencies | Status |
|---------|---|---|
| Department selection in check-in | Backend field support | 🔄 In Progress |
| Patient history display | `GET /patient/history` endpoint | ⏳ Blocked |
| Session details in triage/consultation | `GET /queue-sessions/{id}` endpoint | ⏳ Blocked |
| Analytics/Reports data | `GET /analytics` endpoint | ⏳ Blocked |

---

## 🔐 Security & State Management

**Authentication:**
- JWT token stored in localStorage
- Token expiry detection on API calls
- Automatic logout on session timeout
- Role-based route protection

**State Layers:**
- **Component State** (React Hooks) - UI toggles, form data
- **Browser Storage** (localStorage) - Persistent tokens and user info
- **Real-time** (WebSocket) - Live queue updates and broadcasts
- **Error Boundary** - Global error handling

---

## 🚀 Deployment

**Environment Variables:**
```
VITE_API_BASE = http://localhost:8000
VITE_SOCKET_URL = http://localhost:8000
```

---

## 📝 Recent Architecture Changes

- ✅ **New patient flow**: Phone login → OTP → Queue (no staff check-in)
- ✅ **Staff check-in**: Separate interface for patient registration
- ✅ **Real-time updates**: Direct WebSocket connection
- ✅ **Global error handling**: ErrorBoundary component
- ✅ **Token management**: Automatic expiry and re-authentication
- ✅ **Refactored routing**: Clean separation of patient/staff flows
- ✅ **Cleaned up components**: Removed orphaned Department/Token/History flows

---

## 🎯 Next Steps

1. Backend adds department endpoint support
2. Backend implements patient history endpoint
3. Backend adds session details endpoint
4. CSS styling enhancement (currently minimal)

---

Built for ALU 6ty7ers Clinic Queue Management System.
