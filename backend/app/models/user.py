# today_book/backend/app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    diaries = relationship("Diary", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    items = relationship("Item", back_populates="user", cascade="all, delete-orphan")
    finance_accounts = relationship("FinanceAccount", back_populates="user", cascade="all, delete-orphan")
    finance_categories = relationship("FinanceCategory", back_populates="user", cascade="all, delete-orphan")
    finance_transactions = relationship("FinanceTransaction", back_populates="user", cascade="all, delete-orphan")
    finance_budgets = relationship("FinanceBudget", back_populates="user", cascade="all, delete-orphan")
