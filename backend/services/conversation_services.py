from sqlalchemy.orm import Session
from models.users import Users
from schemas.messages import MessageCreate, MessageOut
from fastapi import HTTPException
from models.conversations import Conversations
from models.conversation_members import ConversationMembers
from sqlalchemy import func
from models.messages import Message
from datetime import datetime


def search_users(db: Session, q: str, current_user_id: int) -> list[Users]:
    if len(q.strip()) < 2:
        return []
    return (
        db.query(Users)
        .filter(Users.username.ilike(f"%{q.strip()}%"))
        .filter(Users.id != current_user_id)
        .limit(10)
        .all()
    )


def send_message(db: Session, body: MessageCreate, current_user_id: int) -> Message:
    if body.recipient_id == current_user_id:
        raise HTTPException(status_code=400, detail="You can't message yourself")
    if db.get(Users, body.recipient_id) is None:
        raise HTTPException(status_code=404, detail="User not found")

    convo = (
        db.query(Conversations)
        .join(
            ConversationMembers, ConversationMembers.conversation_id == Conversations.id
        )
        .filter(Conversations.type == "direct")
        .filter(ConversationMembers.user_id.in_([current_user_id, body.recipient_id]))
        .group_by(Conversations.id)
        .having(func.count(ConversationMembers.user_id.distinct()) == 2)
        .first()
    )

    if convo is None:
        convo = Conversations(type="direct")
        db.add(convo)
        db.flush()
        db.add_all(
            [
                ConversationMembers(conversation_id=convo.id, user_id=current_user_id),
                ConversationMembers(
                    conversation_id=convo.id, user_id=body.recipient_id
                ),
            ]
        )

    new_message = Message(
        conversation_id=convo.id, sender_id=current_user_id, message=body.message
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message


def list_conversations(db: Session, current_user_id: int) -> list[dict]:
    convo_ids = [
        row.conversation_id
        for row in db.query(ConversationMembers.conversation_id)
        .filter(ConversationMembers.user_id == current_user_id)
        .all()
    ]
    results = []
    for convo_id in convo_ids:
        other = (
            db.query(Users)
            .join(ConversationMembers, Users.id == ConversationMembers.user_id)
            .filter(
                ConversationMembers.conversation_id == convo_id,
                Users.id != current_user_id,
            )
            .first()
        )
        last = (
            db.query(Message)
            .filter(Message.conversation_id == convo_id)
            .order_by(Message.sent_at.desc())
            .first()
        )
        results.append(
            {
                "id": convo_id,
                "other_username": other.username if other else None,
                "last_message": last.message if last else None,
                "last_message_at": last.sent_at if last else None,
                "other_user_id": other.id if other else None,
            }
        )
    results.sort(key=lambda r: r["last_message_at"] or datetime.min, reverse=True)
    return results


def ensure_member(db: Session, conversation_id: int, user_id: int) -> None:
    exists = (
        db.query(ConversationMembers)
        .filter_by(conversation_id=conversation_id, user_id=user_id)
        .first()
    )
    if not exists:
        raise HTTPException(
            status_code=403, detail="you are not a member of this conversation"
        )


def get_message(db: Session, conversation_id: int, current_user_id: int) -> list[dict]:
    ensure_member(db, conversation_id, current_user_id)

    rows = (
        db.query(Message, Users.username)
        .join(Users, Users.id == Message.sender_id)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.sent_at.asc())
        .all()
    )

    return [
        {
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "sender_id": msg.sender_id,
            "sender_username": username,
            "message": msg.message,
            "sent_at": msg.sent_at,
        }
        for msg, username in rows
    ]
