from datetime import datetime
from pydantic import BaseModel


class ConversationOut(BaseModel):
    id: int
    other_user_id: int | None
    other_username: str | None
    last_message: str | None
    last_message_at: datetime | None
