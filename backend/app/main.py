from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, patients, triage, ws, queue, patient_auth, history

app = FastAPI(title="Queue Management API")

# Configure CORS for future frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(patient_auth.router)
app.include_router(patients.router)
app.include_router(triage.router)
app.include_router(ws.router)
app.include_router(queue.router)
app.include_router(history.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Queue Management API is running"}
