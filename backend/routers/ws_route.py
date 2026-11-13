import jwt
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from database import get_db
from auth.security import SECRET_KEY, ALGORITHM, get_user
from ws_manager import manager

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket, token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = get_user(db, payload.get("sub"))
    except Exception:
        user = None

    if user is None:
        await ws.close(code=1008)
        return

    await manager.connect(user.id, ws)
    print(f"WS connected: user {user.id}")
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user.id, ws)
        print(f"WS disconnected: user {user.id}")
