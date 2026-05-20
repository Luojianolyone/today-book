# today_book/backend/app/schemas/finance.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FinanceAccountCreate(BaseModel):
    name: str
    account_type: str  # cash/bank/credit/investment/other
    initial_balance: float = 0
    currency: str = "CNY"


class FinanceAccountResponse(BaseModel):
    id: int
    user_id: int
    name: str
    account_type: str
    initial_balance: float
    current_balance: float
    currency: str
    is_active: bool
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class FinanceCategoryCreate(BaseModel):
    name: str
    category_type: str  # income/expense
    parent_id: Optional[int] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class FinanceCategoryResponse(BaseModel):
    id: int
    user_id: int
    name: str
    category_type: str
    parent_id: Optional[int]
    icon: Optional[str]
    color: Optional[str]
    sort_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class FinanceTransactionCreate(BaseModel):
    account_id: int
    category_id: Optional[int] = None
    transaction_type: str  # income/expense/transfer
    amount: float
    description: Optional[str] = None
    transaction_date: str  # YYYY-MM-DD
    transaction_time: Optional[str] = None
    to_account_id: Optional[int] = None
    tags: Optional[list[str]] = None


class FinanceTransactionUpdate(BaseModel):
    account_id: Optional[int] = None
    category_id: Optional[int] = None
    transaction_type: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    transaction_date: Optional[str] = None
    transaction_time: Optional[str] = None
    to_account_id: Optional[int] = None
    tags: Optional[list[str]] = None


class FinanceTransactionResponse(BaseModel):
    id: int
    user_id: int
    account_id: int
    category_id: Optional[int]
    transaction_type: str
    amount: float
    description: Optional[str]
    transaction_date: str
    transaction_time: Optional[str]
    to_account_id: Optional[int]
    is_recurring: bool
    tags: Optional[list[str]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FinanceBudgetCreate(BaseModel):
    category_id: Optional[int] = None
    amount: float
    period_type: str  # monthly/yearly
    period_start: str
    period_end: str


class FinanceBudgetResponse(BaseModel):
    id: int
    user_id: int
    category_id: Optional[int]
    amount: float
    period_type: str
    period_start: str
    period_end: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FinanceMonthlyReport(BaseModel):
    year: int
    month: int
    total_income: float
    total_expense: float
    net: float
    category_breakdown: list[dict]
    daily_breakdown: list[dict]


class FinanceYearlyReport(BaseModel):
    year: int
    total_income: float
    total_expense: float
    net: float
    monthly_breakdown: list[dict]
    category_breakdown: list[dict]
