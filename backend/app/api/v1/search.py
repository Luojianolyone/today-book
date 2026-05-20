# today_book/backend/app/api/v1/search.py
from fastapi import APIRouter, Depends
from sqlalchemy import or_
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.diary import Diary
from app.models.item import Item
from app.models.finance import FinanceTransaction, FinanceAccount
from app.models.review import Review
from app.utils.auth import get_current_user
from sqlalchemy.orm import Session

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/")
def global_search(
    q: str,
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not q or len(q.strip()) < 1:
        return {"diaries": [], "items": [], "transactions": [], "reviews": []}

    kw = f"%{q.strip()}%"

    diaries = db.query(Diary).filter(
        Diary.user_id == current_user.id,
        or_(Diary.title.ilike(kw), Diary.content.ilike(kw)),
    ).order_by(Diary.date.desc()).limit(limit).all()

    items = db.query(Item).filter(
        Item.user_id == current_user.id,
        or_(Item.name.ilike(kw), Item.description.ilike(kw), Item.asset_tag.ilike(kw)),
    ).order_by(Item.created_at.desc()).limit(limit).all()

    transactions = db.query(FinanceTransaction).filter(
        FinanceTransaction.user_id == current_user.id,
        FinanceTransaction.description.ilike(kw),
    ).order_by(FinanceTransaction.transaction_date.desc()).limit(limit).all()

    reviews = db.query(Review).filter(
        Review.user_id == current_user.id,
        or_(Review.title.ilike(kw), Review.content.ilike(kw)),
    ).order_by(Review.period_start.desc()).limit(limit).all()

    return {
        "diaries": [
            {"id": d.id, "date": d.date, "title": d.title, "mood": d.mood, "type": "diary"}
            for d in diaries
        ],
        "items": [
            {"id": i.id, "name": i.name, "asset_tag": i.asset_tag, "current_value": i.current_value, "type": "item"}
            for i in items
        ],
        "transactions": [
            {"id": t.id, "description": t.description, "amount": t.amount, "date": t.transaction_date, "tx_type": t.transaction_type, "type": "transaction"}
            for t in transactions
        ],
        "reviews": [
            {"id": r.id, "title": r.title, "review_type": r.type, "period": f"{r.period_start} ~ {r.period_end}", "type": "review"}
            for r in reviews
        ],
    }
