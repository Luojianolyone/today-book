# today_book/backend/app/models/diary.py
from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
from app.models.types import JSONList


class Diary(Base):
    __tablename__ = "diaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    title = Column(String(200))
    content = Column(Text)
    mood = Column(String(20))  # happy/sad/neutral/excited/tired
    weather = Column(String(20))  # sunny/cloudy/rainy/snowy
    tags = Column(JSONList)
    is_encrypted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_user_date"),)

    user = relationship("User", back_populates="diaries")
    attachments = relationship("DiaryAttachment", back_populates="diary", cascade="all, delete-orphan")


class DiaryAttachment(Base):
    __tablename__ = "diary_attachments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    diary_id = Column(Integer, ForeignKey("diaries.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    diary = relationship("Diary", back_populates="attachments")
