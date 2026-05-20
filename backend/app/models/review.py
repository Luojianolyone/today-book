# today_book/backend/app/models/review.py
from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
from app.models.types import JSONList


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(10), nullable=False)  # weekly/monthly/yearly
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    title = Column(String(200))
    content = Column(Text)
    accomplishments = Column(JSONList)
    challenges = Column(JSONList)
    next_plans = Column(JSONList)
    mood_score = Column(Integer)  # 1-10
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("user_id", "type", "period_start", name="uq_user_type_period"),)

    user = relationship("User", back_populates="reviews")
