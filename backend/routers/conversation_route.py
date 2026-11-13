from fastapi import APIRouter, Depends
from services import conversation_services
from sqlalchemy.orm import Session
from typing import Annotated

from models.users import Users
from database import get_db

from auth.security import get_current_active_user
from schemas.users import UserSearchOut

from schemas.messages import MessageCreate, MessageOut
from schemas.conversations import ConversationOut

from ws_manager import manager

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("/users/search", response_model=list[UserSearchOut])
def search_user(
    q: str,
    current_user: Annotated[Users, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
):
    return conversation_services.search_users(db, q, current_user.id)


@router.post("/messages", response_model=MessageOut, status_code=201)
async def send_message(
    body: MessageCreate,
    current_user: Annotated[Users, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
):
    msg = conversation_services.send_message(db, body, current_user.id)

    await manager.send_to_user(
        body.recipient_id,
        {
            "type": "new_message",
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "sender_id": msg.sender_id,
            "sender_username": current_user.username,
            "message": msg.message,
            "sent_at": msg.sent_at.isoformat(),
        },
    )
    return msg


@router.get("", response_model=list[ConversationOut])
def list_conversations(
    current_user: Annotated[Users, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
):
    return conversation_services.list_conversations(db, current_user.id)


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
def get_messages(
    conversation_id: int,
    current_user: Annotated[Users, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
):
    return conversation_services.get_message(db, conversation_id, current_user.id)
