# today_book/backend/app/schemas/review.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    type: str  # weekly/monthly/yearly
    period_start: str
    period_end: str
    title: Optional[str] = None
    content: Optional[str] = None
    accomplishments: Optional[list[str]] = None
    challenges: Optional[list[str]] = None
    next_plans: Optional[list[str]] = None
    mood_score: Optional[int] = None


class ReviewUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    accomplishments: Optional[list[str]] = None
    challenges: Optional[list[str]] = None
    next_plans: Optional[list[str]] = None
    mood_score: Optional[int] = None
    is_completed: Optional[bool] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    type: str
    period_start: str
    period_end: str
    title: Optional[str]
    content: Optional[str]
    accomplishments: Optional[list[str]]
    challenges: Optional[list[str]]
    next_plans: Optional[list[str]]
    mood_score: Optional[int]
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
