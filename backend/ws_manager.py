from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.activate: dict[int, list[WebSocket]] = {}

    async def connect(self, user_id: int, ws: WebSocket):
        await ws.accept()
        self.activate.setdefault(user_id, []).append(ws)

    def disconnect(self, user_id: int, ws: WebSocket):
        sockets = self.activate.get(user_id, [])
        if ws in sockets:
            sockets.remove(ws)
        if not sockets:
            self.activate.pop(user_id, None)

    async def send_to_user(self, user_id: int, data: dict):
        for ws in list(self.activate.get(user_id, [])):
            try:
                await ws.send_json(data)
            except Exception:
                self.disconnect(user_id, ws)


manager = ConnectionManager()
