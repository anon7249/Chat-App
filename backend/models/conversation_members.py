from typing import List
from typing import Optional
from sqlalchemy import ForeignKey
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from datetime import datetime
from models.base import Base


class ConversationMembers(Base):
    __tablename__ = "conversation_members"

    conversation_id: Mapped[int] = mapped_column(
        ForeignKey("conversations.id"), primary_key=True
    )

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)

    joined_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
