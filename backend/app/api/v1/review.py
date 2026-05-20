# today_book/backend/app/api/v1/review.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.database import get_db
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse
from app.utils.auth import get_current_user
from app.utils.date_utils import get_week_range, get_month_range, get_year_range

router = APIRouter(prefix="/review", tags=["review"])


@router.get("/", response_model=list[ReviewResponse])
def list_reviews(
    review_type: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Review).filter(Review.user_id == current_user.id)
    if review_type:
        query = query.filter(Review.type == review_type)
    return query.order_by(Review.period_start.desc()).offset((page - 1) * page_size).limit(page_size).all()


@router.post("/", response_model=ReviewResponse)
def create_review(data: ReviewCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = Review(
        user_id=current_user.id,
        type=data.type,
        period_start=data.period_start,
        period_end=data.period_end,
        title=data.title,
        content=data.content,
        accomplishments=data.accomplishments,
        challenges=data.challenges,
        next_plans=data.next_plans,
        mood_score=data.mood_score,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(review_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id, Review.user_id == current_user.id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(review_id: int, data: ReviewUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id, Review.user_id == current_user.id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(review, k, v)
    db.commit()
    db.refresh(review)
    return review


@router.delete("/{review_id}")
def delete_review(review_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id, Review.user_id == current_user.id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"message": "Deleted"}


@router.get("/template/{review_type}")
def get_template(review_type: str, period_start: Optional[str] = None, period_end: Optional[str] = None):
    """Get a review template with suggested structure."""
    templates = {
        "weekly": {
            "title": "周复盘",
            "content": "## 本周总结\n\n## 完成事项\n\n## 遇到的挑战\n\n## 下周计划\n\n## 心情评分",
        },
        "monthly": {
            "title": "月复盘",
            "content": "## 本月总结\n\n## 重大成就\n\n## 需要改进\n\n## 下月目标\n\n## 心情评分",
        },
        "yearly": {
            "title": "年复盘",
            "content": "## 年度总结\n\n## 年度成就\n\n## 年度挑战\n\n## 明年规划\n\n## 心情评分",
        },
    }
    template = templates.get(review_type, templates["weekly"])
    if period_start and period_end:
        template["period_start"] = period_start
        template["period_end"] = period_end
    return template


@router.get("/stats/summary")
def get_review_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from datetime import date
    today = date.today()

    total = db.query(Review).filter(Review.user_id == current_user.id).count()
    completed = db.query(Review).filter(Review.user_id == current_user.id, Review.is_completed == True).count()

    by_type = db.query(Review.type, func.count(Review.id)).filter(
        Review.user_id == current_user.id
    ).group_by(Review.type).all()

    return {
        "total": total,
        "completed": completed,
        "completion_rate": round(completed / total * 100, 1) if total > 0 else 0,
        "by_type": {t: c for t, c in by_type},
    }
