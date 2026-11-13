# main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from routers.conversation_route import router as conversation_router
from database import get_db
from routers.auth_route import router as auth_router

from routers.ws_route import router as ws_router

app = FastAPI()

app.include_router(ws_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversation_router)
app.include_router(auth_router)


@app.get("/")
def home():
    return {"message": "Hello"}


@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))
    return {"database": result.scalar()}
