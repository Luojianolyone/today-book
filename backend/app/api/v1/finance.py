# today_book/backend/app/api/v1/finance.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional
from app.database import get_db
from app.models.finance import FinanceAccount, FinanceCategory, FinanceTransaction, FinanceBudget
from app.models.user import User
from app.schemas.finance import (
    FinanceAccountCreate, FinanceAccountResponse,
    FinanceCategoryCreate, FinanceCategoryResponse,
    FinanceTransactionCreate, FinanceTransactionUpdate, FinanceTransactionResponse,
    FinanceBudgetCreate, FinanceBudgetResponse,
    FinanceMonthlyReport, FinanceYearlyReport,
)
from app.utils.auth import get_current_user
from datetime import date
import calendar

router = APIRouter(prefix="/finance", tags=["finance"])


# ========== Balance Helper (with row-level locking) ==========
def _apply_balance_change(
    db: Session,
    account_id: int,
    amount: float,
    tx_type: str,
    to_account_id: int | None = None,
) -> None:
    """Atomically apply a balance change using SELECT FOR UPDATE.
    On SQLite, FOR UPDATE is ignored but the single-writer WAL mode
    + immediate transaction provides equivalent safety.
    """
    account = (
        db.query(FinanceAccount)
        .filter(FinanceAccount.id == account_id)
        .with_for_update()
        .first()
    )
    if account is None:
        return

    if tx_type == "expense":
        account.current_balance -= amount
    elif tx_type == "income":
        account.current_balance += amount
    elif tx_type == "transfer" and to_account_id:
        account.current_balance -= amount
        to_account = (
            db.query(FinanceAccount)
            .filter(FinanceAccount.id == to_account_id)
            .with_for_update()
            .first()
        )
        if to_account:
            to_account.current_balance += amount


def _revert_balance_change(
    db: Session,
    account_id: int,
    amount: float,
    tx_type: str,
) -> None:
    """Atomically revert a balance change (inverse of _apply_balance_change)."""
    account = (
        db.query(FinanceAccount)
        .filter(FinanceAccount.id == account_id)
        .with_for_update()
        .first()
    )
    if account is None:
        return

    if tx_type == "expense":
        account.current_balance += amount
    elif tx_type == "income":
        account.current_balance -= amount


# ========== Accounts ==========
@router.get("/accounts", response_model=list[FinanceAccountResponse])
def list_accounts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(FinanceAccount).filter(FinanceAccount.user_id == current_user.id).order_by(FinanceAccount.sort_order).all()


@router.post("/accounts", response_model=FinanceAccountResponse)
def create_account(data: FinanceAccountCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = FinanceAccount(user_id=current_user.id, **data.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.put("/accounts/{account_id}", response_model=FinanceAccountResponse)
def update_account(account_id: int, data: FinanceAccountCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(FinanceAccount).filter(FinanceAccount.id == account_id, FinanceAccount.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    for k, v in data.model_dump().items():
        setattr(account, k, v)
    db.commit()
    db.refresh(account)
    return account


@router.delete("/accounts/{account_id}")
def delete_account(account_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(FinanceAccount).filter(FinanceAccount.id == account_id, FinanceAccount.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(account)
    db.commit()
    return {"message": "Deleted"}


# ========== Categories ==========
@router.get("/categories", response_model=list[FinanceCategoryResponse])
def list_categories(cat_type: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(FinanceCategory).filter(FinanceCategory.user_id == current_user.id)
    if cat_type:
        query = query.filter(FinanceCategory.category_type == cat_type)
    return query.order_by(FinanceCategory.sort_order).all()


@router.post("/categories", response_model=FinanceCategoryResponse)
def create_category(data: FinanceCategoryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = FinanceCategory(user_id=current_user.id, **data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


# ========== Transactions ==========
@router.get("/transactions", response_model=list[FinanceTransactionResponse])
def list_transactions(
    account_id: Optional[int] = None,
    category_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(FinanceTransaction).filter(FinanceTransaction.user_id == current_user.id)
    if account_id:
        query = query.filter(FinanceTransaction.account_id == account_id)
    if category_id:
        query = query.filter(FinanceTransaction.category_id == category_id)
    if transaction_type:
        query = query.filter(FinanceTransaction.transaction_type == transaction_type)
    if start_date:
        query = query.filter(FinanceTransaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(FinanceTransaction.transaction_date <= end_date)
    return query.order_by(FinanceTransaction.transaction_date.desc()).offset((page - 1) * page_size).limit(page_size).all()


@router.post("/transactions", response_model=FinanceTransactionResponse)
def create_transaction(data: FinanceTransactionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tx = FinanceTransaction(
        user_id=current_user.id,
        account_id=data.account_id,
        category_id=data.category_id,
        transaction_type=data.transaction_type,
        amount=data.amount,
        description=data.description,
        transaction_date=data.transaction_date,
        transaction_time=data.transaction_time,
        to_account_id=data.to_account_id,
        tags=data.tags,
    )
    db.add(tx)

    _apply_balance_change(db, data.account_id, data.amount, data.transaction_type, data.to_account_id)

    db.commit()
    db.refresh(tx)
    return tx


@router.put("/transactions/{tx_id}", response_model=FinanceTransactionResponse)
def update_transaction(tx_id: int, data: FinanceTransactionUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tx = db.query(FinanceTransaction).filter(FinanceTransaction.id == tx_id, FinanceTransaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Revert old balance
    _revert_balance_change(db, tx.account_id, tx.amount, tx.transaction_type)

    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(tx, k, v)

    # Apply new balance
    _apply_balance_change(db, tx.account_id, tx.amount, tx.transaction_type, tx.to_account_id)

    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/transactions/{tx_id}")
def delete_transaction(tx_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tx = db.query(FinanceTransaction).filter(FinanceTransaction.id == tx_id, FinanceTransaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    _revert_balance_change(db, tx.account_id, tx.amount, tx.transaction_type)

    db.delete(tx)
    db.commit()
    return {"message": "Deleted"}


# ========== Budgets ==========
@router.get("/budgets", response_model=list[FinanceBudgetResponse])
def list_budgets(period_type: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(FinanceBudget).filter(FinanceBudget.user_id == current_user.id)
    if period_type:
        query = query.filter(FinanceBudget.period_type == period_type)
    return query.all()


@router.post("/budgets", response_model=FinanceBudgetResponse)
def create_budget(data: FinanceBudgetCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    budget = FinanceBudget(user_id=current_user.id, **data.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


# ========== Reports ==========
@router.get("/reports/summary")
def get_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    month_start = date(today.year, today.month, 1)
    _, last_day = calendar.monthrange(today.year, today.month)
    month_end = date(today.year, today.month, last_day)

    income = db.query(func.sum(FinanceTransaction.amount)).filter(
        FinanceTransaction.user_id == current_user.id,
        FinanceTransaction.transaction_type == "income",
        FinanceTransaction.transaction_date.between(month_start, month_end),
    ).scalar() or 0

    expense = db.query(func.sum(FinanceTransaction.amount)).filter(
        FinanceTransaction.user_id == current_user.id,
        FinanceTransaction.transaction_type == "expense",
        FinanceTransaction.transaction_date.between(month_start, month_end),
    ).scalar() or 0

    total_balance = db.query(func.sum(FinanceAccount.current_balance)).filter(
        FinanceAccount.user_id == current_user.id,
    ).scalar() or 0

    return {
        "month_income": income,
        "month_expense": expense,
        "month_net": income - expense,
        "total_balance": total_balance,
    }


@router.get("/reports/monthly", response_model=FinanceMonthlyReport)
def get_monthly_report(year: int, month: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    start = date(year, month, 1)
    _, last_day = calendar.monthrange(year, month)
    end = date(year, month, last_day)

    income = db.query(func.sum(FinanceTransaction.amount)).filter(
        FinanceTransaction.user_id == current_user.id,
        FinanceTransaction.transaction_type == "income",
        FinanceTransaction.transaction_date.between(start, end),
    ).scalar() or 0

    expense = db.query(func.sum(FinanceTransaction.amount)).filter(
        FinanceTransaction.user_id == current_user.id,
        FinanceTransaction.transaction_type == "expense",
        FinanceTransaction.transaction_date.between(start, end),
    ).scalar() or 0

    # Category breakdown
    cat_breakdown = db.query(
        FinanceCategory.name,
        FinanceCategory.color,
        func.sum(FinanceTransaction.amount).label("total"),
    ).join(FinanceTransaction, FinanceTransaction.category_id == FinanceCategory.id).filter(
        FinanceTransaction.user_id == current_user.id,
        FinanceTransaction.transaction_type == "expense",
        FinanceTransaction.transaction_date.between(start, end),
    ).group_by(FinanceCategory.id).all()

    # Daily breakdown
    daily_breakdown = db.query(
        FinanceTransaction.transaction_date,
        func.sum(FinanceTransaction.amount).label("total"),
    ).filter(
        FinanceTransaction.user_id == current_user.id,
        FinanceTransaction.transaction_type == "expense",
        FinanceTransaction.transaction_date.between(start, end),
    ).group_by(FinanceTransaction.transaction_date).all()

    return FinanceMonthlyReport(
        year=year,
        month=month,
        total_income=income,
        total_expense=expense,
        net=income - expense,
        category_breakdown=[{"name": c.name, "color": c.color, "total": c.total} for c in cat_breakdown],
        daily_breakdown=[{"date": d.transaction_date, "total": d.total} for d in daily_breakdown],
    )
