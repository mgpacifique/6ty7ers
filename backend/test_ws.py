import asyncio
import websockets
import httpx
import json

async def run_test():
    async with websockets.connect("ws://127.0.0.1:8000/ws") as websocket:
        print("Connected to WebSocket.")
        
        async with httpx.AsyncClient() as client:
            # Login
            response = await client.post(
                "http://127.0.0.1:8000/auth/login",
                data={"username": "admin_amina", "password": "admin123"},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            if response.status_code != 200:
                print("Login failed:", response.text)
                return
            token = response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("Logged in successfully.")
            
            # Check-in
            patient_data = {"full_name": "WS Test Patient", "phone_number": "+250781234567"}
            response = await client.post(
                "http://127.0.0.1:8000/patients/check-in",
                json=patient_data,
                headers=headers
            )
            session_id = response.json()["id"]
            print(f"Checked in: {session_id}")
            
            # Wait for WS message
            msg = await websocket.recv()
            print(f"WS Event -> {msg}\n")
            
            # Triage
            triage_data = {"track_type": "Urgent", "priority_score": 100}
            response = await client.post(
                f"http://127.0.0.1:8000/triage/{session_id}",
                json=triage_data,
                headers=headers
            )
            print("Triaged.")
            msg = await websocket.recv()
            print(f"WS Event -> {msg}\n")
            
            # Call
            response = await client.post(
                f"http://127.0.0.1:8000/queue/{session_id}/call",
                headers=headers
            )
            print("Called.")
            msg = await websocket.recv()
            print(f"WS Event -> {msg}\n")
            
            # Complete
            response = await client.post(
                f"http://127.0.0.1:8000/queue/{session_id}/complete",
                headers=headers
            )
            print("Completed.")
            msg = await websocket.recv()
            print(f"WS Event -> {msg}\n")

if __name__ == "__main__":
    asyncio.run(run_test())
