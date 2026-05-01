from email.mime import text

from sqlalchemy import text
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import engine, get_db
import models
import os


# Create all tables on startup
models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="SecularAI API")

frontend_url = os.getenv("FRONTEND_URL")
allowed_origins = [
    "http://localhost:8080",  # frontend
    "http://127.0.0.1:8080",  # Backend
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://localhost:5174",
    "https://secular-ai-backend.vercel.app",
    "https://secularai.vercel.app",
    frontend_url,
    
]
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from auth_router import router as auth_router
from chat_router import router as chat_router

app.include_router(auth_router)
app.include_router(chat_router)

@app.get("/")
def read_root():
    return {"message": "SecularAI API is running", "status": "ok"}

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return {"ok": True}

class QueryRequest(BaseModel):
    user_query: str
    religion: str = "hinduism"
    scripture: str = "gita"
    session_id: Optional[str] = None

@app.get("/db-test")
def db_test(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"database": "connected"}
    except Exception as e:
        return {"database": "failed", "error": str(e)}

@app.post("/query")
def query_scripture(request: QueryRequest, db: Session = Depends(get_db)):
    from models import ChatMessage, ChatSession
    import json

    history_text = ""
    if request.session_id:
        session = db.query(ChatSession).filter(ChatSession.id == request.session_id).first()
        if not session:
            return {"error": "Session not found"}

        past_messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == request.session_id)
            .order_by(ChatMessage.created_at)
            .all()
        )

        for msg in past_messages[-14:]:  # Only use last 14 messages for context
            role = "User" if msg.role == "user" else "Guide"
            history_text += f"{role}: {msg.content}\n"

        # Save user message
        user_msg = ChatMessage(
            session_id=request.session_id, role="user", content=request.user_query
        )
        db.add(user_msg)
        db.commit()

    # Get reply
    from query import get_ai_reply

    reply = get_ai_reply(
        request.user_query,
        history_text,
        religion=request.religion,
        scripture=request.scripture,
    )

    # Basic parse of verses for the DB
    import re

    verses_data = []

    def extract_verses(match):
        verses_data.append(
            {"reference": match.group(1), "text": match.group(2).strip()}
        )
        return ""

    clean_text = re.sub(
        r'\[VERSE title="(.+?)"\]([\s\S]*?)\[\/VERSE\]', extract_verses, reply
    ).strip()

    if request.session_id:
        # Save AI message
        ai_msg = ChatMessage(
            session_id=request.session_id,
            role="ai",
            content=reply,
            verses_json=json.dumps(verses_data) if verses_data else None,
        )
        db.add(ai_msg)
        db.commit()

    return {"answer": reply}
