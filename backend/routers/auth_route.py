from datetime import timedelta
from typing import Annotated
from schemas.users import UserOut

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field


from sqlalchemy.exc import IntegrityError

from database import get_db
from models.users import Users
from auth.security import (
    Token,
    authenticate_user,
    create_access_token,
    get_current_active_user,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(tags=["auth"])


@router.post("/token")
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
) -> Token:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/users/me/", response_model=UserOut)
def read_users_me(
    current_user: Annotated[Users, Depends(get_current_active_user)],
):
    return current_user


@router.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[Users, Depends(get_current_active_user)],
):
    return [{"item_id": "Foo", "owner": current_user.username}]


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)


@router.post("/register", response_model=UserOut, status_code=201)
def register_user(
    user: RegisterRequest,
    db: Session = Depends(get_db),
):
    hash_password = get_password_hash(user.password)
    new_user = Users(
        username=user.username, email=user.email, password_hash=hash_password
    )
    try:
        db.add(new_user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="username or email already exists")

    db.refresh(new_user)
    return new_user
