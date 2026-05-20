# today_book/backend/app/models/finance.py
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
from app.models.types import JSONList


class FinanceAccount(Base):
    __tablename__ = "finance_accounts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    account_type = Column(String(20), nullable=False)  # cash/bank/credit/investment/other
    initial_balance = Column(Float, default=0)
    current_balance = Column(Float, default=0)
    currency = Column(String(10), default="CNY")
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="finance_accounts")
    transactions = relationship("FinanceTransaction", foreign_keys="FinanceTransaction.account_id", back_populates="account", cascade="all, delete-orphan")


class FinanceCategory(Base):
    __tablename__ = "finance_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    category_type = Column(String(10), nullable=False)  # income/expense
    parent_id = Column(Integer, ForeignKey("finance_categories.id"))
    icon = Column(String(50))
    color = Column(String(20))
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="finance_categories")
    transactions = relationship("FinanceTransaction", back_populates="category", cascade="all, delete-orphan")
    budgets = relationship("FinanceBudget", back_populates="category", cascade="all, delete-orphan")


class FinanceTransaction(Base):
    __tablename__ = "finance_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("finance_accounts.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("finance_categories.id"))
    transaction_type = Column(String(10), nullable=False)  # income/expense/transfer
    amount = Column(Float, nullable=False)
    description = Column(Text)
    transaction_date = Column(Date, nullable=False)
    transaction_time = Column(String(8))  # HH:MM:SS
    to_account_id = Column(Integer, ForeignKey("finance_accounts.id"))
    is_recurring = Column(Boolean, default=False)
    tags = Column(JSONList)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="finance_transactions")
    account = relationship("FinanceAccount", foreign_keys=[account_id], back_populates="transactions")
    category = relationship("FinanceCategory", back_populates="transactions")


class FinanceBudget(Base):
    __tablename__ = "finance_budgets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("finance_categories.id"))
    amount = Column(Float, nullable=False)
    period_type = Column(String(10), nullable=False)  # monthly/yearly
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="finance_budgets")
    category = relationship("FinanceCategory", back_populates="budgets")
