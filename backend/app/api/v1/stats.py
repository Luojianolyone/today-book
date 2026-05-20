# today_book/backend/app/api/v1/stats.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.diary import Diary
from app.models.review import Review
from app.models.item import Item
from app.models.finance import FinanceAccount, FinanceTransaction
from app.utils.auth import get_current_user
from datetime import date
import calendar

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/dashboard")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    month_start = date(today.year, today.month, 1)
    _, last_day = calendar.monthrange(today.year, today.month)
    month_end = date(today.year, today.month, last_day)

    # Diary stats
    today_diary = db.query(Diary).filter(Diary.user_id == current_user.id, Diary.date == today).first()
    month_diary_count = db.query(func.count(Diary.id)).filter(
        Diary.user_id == current_user.id,
        Diary.date.between(month_start, month_end),
    ).scalar() or 0

    # Review stats
    review_total = db.query(func.count(Review.id)).filter(Review.user_id == current_user.id).scalar() or 0
    review_completed = db.query(func.count(Review.id)).filter(
        Review.user_id == current_user.id, Review.is_completed == True,
    ).scalar() or 0

    # Item stats
    item_total = db.query(func.count(Item.id)).filter(
        Item.user_id == current_user.id, Item.is_archived == False,
    ).scalar() or 0
    item_total_value = db.query(func.sum(Item.current_value)).filter(
        Item.user_id == current_user.id, Item.is_archived == False,
    ).scalar() or 0

    # Finance stats
    month_income = db.query(func.sum(FinanceTransaction.amount)).filter(
        FinanceTransaction.user_id == current_user.id,
        FinanceTransaction.transaction_type == "income",
        FinanceTransaction.transaction_date >= month_start,
        FinanceTransaction.transaction_date <= month_end,
    ).scalar() or 0

    month_expense = db.query(func.sum(FinanceTransaction.amount)).filter(
        FinanceTransaction.user_id == current_user.id,
        FinanceTransaction.transaction_type == "expense",
        FinanceTransaction.transaction_date >= month_start,
        FinanceTransaction.transaction_date <= month_end,
    ).scalar() or 0

    total_balance = db.query(func.sum(FinanceAccount.current_balance)).filter(
        FinanceAccount.user_id == current_user.id,
    ).scalar() or 0

    # Recent diaries
    recent_diaries = db.query(Diary).filter(
        Diary.user_id == current_user.id,
    ).order_by(Diary.date.desc()).limit(5).all()

    return {
        "today": today_str,
        "diary": {
            "today_written": today_diary is not None,
            "month_count": month_diary_count,
        },
        "review": {
            "total": review_total,
            "completed": review_completed,
        },
        "items": {
            "total": item_total,
            "total_value": item_total_value or 0,
        },
        "finance": {
            "month_income": month_income,
            "month_expense": month_expense,
            "month_net": month_income - month_expense,
            "total_balance": total_balance,
        },
        "recent_diaries": [
            {"date": d.date, "title": d.title or d.date, "mood": d.mood}
            for d in recent_diaries
        ],
    }
