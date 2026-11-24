from datetime import datetime
from pydantic import BaseModel


class ConversationOut(BaseModel):
  id: int
  type: str
  name: str | None = None
  other_user_id: int | None = None
  other_username: str | None = None
  last_message: str | None = None
  last_message_at: datetime | None = None
