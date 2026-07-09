from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.websocket import manager

router = APIRouter(
    tags=["WebSockets"]
)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We keep the connection open and wait for incoming messages
            data = await websocket.receive_text()
            # (Optional) handle incoming messages from the client if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)
