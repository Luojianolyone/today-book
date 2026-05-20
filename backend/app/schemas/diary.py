# today_book/backend/app/schemas/diary.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DiaryCreate(BaseModel):
    date: str  # YYYY-MM-DD
    title: Optional[str] = None
    content: Optional[str] = None
    mood: Optional[str] = None
    weather: Optional[str] = None
    tags: Optional[list[str]] = None


class DiaryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood: Optional[str] = None
    weather: Optional[str] = None
    tags: Optional[list[str]] = None


class DiaryResponse(BaseModel):
    id: int
    user_id: int
    date: str
    title: Optional[str]
    content: Optional[str]
    mood: Optional[str]
    weather: Optional[str]
    tags: Optional[list[str]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DiaryCalendarDay(BaseModel):
    date: str
    has_entry: bool
    mood: Optional[str] = None
