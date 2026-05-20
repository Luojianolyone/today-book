# today_book/backend/app/api/v1/diary.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional
from app.database import get_db
from app.models.diary import Diary, DiaryAttachment
from app.models.user import User
from app.schemas.diary import DiaryCreate, DiaryUpdate, DiaryResponse, DiaryCalendarDay
from app.utils.auth import get_current_user
from app.config import settings
from app.utils.date_utils import get_today_str
from app.utils.upload import validate_file, validate_file_size, safe_filename, build_upload_path
import os
import calendar
import aiofiles
from datetime import date

router = APIRouter(prefix="/diary", tags=["diary"])


@router.get("/", response_model=list[DiaryResponse])
def list_diaries(
    year: Optional[int] = None,
    month: Optional[int] = None,
    page: int = 1,
    page_size: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Diary).filter(Diary.user_id == current_user.id)
    if year and month:
        last_day = calendar.monthrange(year, month)[1]
        query = query.filter(Diary.date.between(date(year, month, 1), date(year, month, last_day)))
    elif year:
        query = query.filter(Diary.date.between(date(year, 1, 1), date(year, 12, 31)))

    total = query.count()
    diaries = query.order_by(Diary.date.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return diaries


@router.get("/calendar/{year}/{month}", response_model=list[DiaryCalendarDay])
def get_calendar(
    year: int,
    month: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _, last_day = calendar.monthrange(year, month)
    diaries = db.query(Diary).filter(
        Diary.user_id == current_user.id,
        Diary.date.between(date(year, month, 1), date(year, month, last_day)),
    ).all()
    diary_map = {d.date: d for d in diaries}

    import calendar
    _, last_day = calendar.monthrange(year, month)
    result = []
    for day in range(1, last_day + 1):
        date_str = f"{year}-{month:02d}-{day:02d}"
        entry = diary_map.get(date_str)
        result.append(DiaryCalendarDay(
            date=date_str,
            has_entry=entry is not None,
            mood=entry.mood if entry else None,
        ))
    return result


@router.get("/{date}", response_model=DiaryResponse)
def get_diary(
    date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    diary = db.query(Diary).filter(
        Diary.user_id == current_user.id,
        Diary.date == date,
    ).first()
    if not diary:
        raise HTTPException(status_code=404, detail="Diary not found")
    return diary


@router.post("/", response_model=DiaryResponse)
def upsert_diary(
    data: DiaryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    diary = db.query(Diary).filter(
        Diary.user_id == current_user.id,
        Diary.date == data.date,
    ).first()

    if diary:
        if data.title is not None:
            diary.title = data.title
        if data.content is not None:
            diary.content = data.content
        if data.mood is not None:
            diary.mood = data.mood
        if data.weather is not None:
            diary.weather = data.weather
        if data.tags is not None:
            diary.tags = data.tags
        db.commit()
        db.refresh(diary)
        return diary
    else:
        diary = Diary(
            user_id=current_user.id,
            date=data.date,
            title=data.title,
            content=data.content,
            mood=data.mood,
            weather=data.weather,
            tags=data.tags,
        )
        db.add(diary)
        db.commit()
        db.refresh(diary)
        return diary


@router.delete("/{date}")
def delete_diary(
    date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    diary = db.query(Diary).filter(
        Diary.user_id == current_user.id,
        Diary.date == date,
    ).first()
    if not diary:
        raise HTTPException(status_code=404, detail="Diary not found")
    db.delete(diary)
    db.commit()
    return {"message": "Deleted"}


@router.post("/{date}/attachments")
async def upload_attachment(
    date: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    diary = db.query(Diary).filter(
        Diary.user_id == current_user.id,
        Diary.date == date,
    ).first()
    if not diary:
        raise HTTPException(status_code=404, detail="Diary not found")

    # Validate file type and extension
    try:
        validate_file(file.filename, file.content_type or "", "diary")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    content = await file.read()

    # Validate file size
    try:
        validate_file_size(len(content))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Build safe upload path
    user_dir = build_upload_path(current_user.id, "diary", date)

    # Generate safe filename
    safe_name = safe_filename(file.filename)
    filepath = os.path.join(user_dir, safe_name)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    attachment = DiaryAttachment(
        diary_id=diary.id,
        filename=safe_name,
        filepath=filepath,
        file_size=len(content),
        mime_type=file.content_type,
    )
    db.add(attachment)
    db.commit()
    return {"filename": safe_name, "size": len(content)}
