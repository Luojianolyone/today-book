# today_book/backend/app/api/v1/item.py
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.database import get_db
from app.models.item import Item, ItemCategory, ItemLocation, ItemAttachment
from app.models.user import User
from app.schemas.item import (
    ItemCreate, ItemUpdate, ItemResponse,
    ItemCategoryCreate, ItemLocationCreate, ItemStatsSummary,
)
from app.utils.auth import get_current_user
from app.config import settings
from app.utils.upload import validate_file, validate_file_size, safe_filename, build_upload_path
import os
import aiofiles

router = APIRouter(prefix="/items", tags=["items"])


# ========== Categories ==========
@router.get("/categories")
def list_categories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ItemCategory).filter(ItemCategory.user_id == current_user.id).order_by(ItemCategory.sort_order).all()


@router.post("/categories")
def create_category(data: ItemCategoryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = ItemCategory(user_id=current_user.id, name=data.name, parent_id=data.parent_id)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return {"id": cat.id, "name": cat.name, "parent_id": cat.parent_id}


# ========== Locations ==========
@router.get("/locations")
def list_locations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ItemLocation).filter(ItemLocation.user_id == current_user.id).all()


@router.post("/locations")
def create_location(data: ItemLocationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loc = ItemLocation(user_id=current_user.id, name=data.name, parent_id=data.parent_id)
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return {"id": loc.id, "name": loc.name, "parent_id": loc.parent_id}


# ========== Items ==========
@router.get("/", response_model=list[ItemResponse])
def list_items(
    category_id: Optional[int] = None,
    location_id: Optional[int] = None,
    is_archived: bool = False,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Item).filter(Item.user_id == current_user.id, Item.is_archived == is_archived)
    if category_id:
        query = query.filter(Item.category_id == category_id)
    if location_id:
        query = query.filter(Item.location_id == location_id)
    if search:
        query = query.filter(Item.name.contains(search))
    return query.order_by(Item.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()


@router.post("/", response_model=ItemResponse)
def create_item(data: ItemCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Generate asset tag
    count = db.query(func.count(Item.id)).filter(Item.user_id == current_user.id).scalar() or 0
    asset_tag = f"TB-{count + 1:04d}"
    item = Item(user_id=current_user.id, asset_tag=asset_tag, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id, Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.put("/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, data: ItemUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id, Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id, Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


@router.post("/{item_id}/attachments")
async def upload_item_attachment(
    item_id: int,
    attachment_type: str = "photo",
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(Item).filter(Item.id == item_id, Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Validate file type and extension
    try:
        validate_file(file.filename, file.content_type or "", "item")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    content = await file.read()

    # Validate file size
    try:
        validate_file_size(len(content))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Build safe upload path
    user_dir = build_upload_path(current_user.id, "items", str(item_id))

    # Generate safe filename
    safe_name = safe_filename(file.filename)
    filepath = os.path.join(user_dir, safe_name)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    attachment = ItemAttachment(
        item_id=item_id,
        filename=safe_name,
        filepath=filepath,
        attachment_type=attachment_type,
    )
    db.add(attachment)
    db.commit()
    return {"filename": safe_name, "size": len(content)}


# ========== Stats ==========
@router.get("/stats/summary", response_model=ItemStatsSummary)
def get_stats_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_items = db.query(func.count(Item.id)).filter(Item.user_id == current_user.id, Item.is_archived == False).scalar() or 0
    total_value = db.query(func.sum(Item.current_value)).filter(Item.user_id == current_user.id, Item.is_archived == False).scalar() or 0
    total_purchase = db.query(func.sum(Item.purchase_price)).filter(Item.user_id == current_user.id, Item.is_archived == False).scalar() or 0

    cat_breakdown = db.query(
        ItemCategory.name,
        func.count(Item.id).label("count"),
        func.sum(Item.current_value).label("value"),
    ).join(Item, Item.category_id == ItemCategory.id).filter(
        Item.user_id == current_user.id,
        Item.is_archived == False,
    ).group_by(ItemCategory.id).all()

    loc_breakdown = db.query(
        ItemLocation.name,
        func.count(Item.id).label("count"),
    ).join(Item, Item.location_id == ItemLocation.id).filter(
        Item.user_id == current_user.id,
        Item.is_archived == False,
    ).group_by(ItemLocation.id).all()

    return ItemStatsSummary(
        total_items=total_items,
        total_value=total_value or 0,
        total_purchase_value=total_purchase or 0,
        category_breakdown=[{"name": c.name, "count": c.count, "value": c.value or 0} for c in cat_breakdown],
        location_breakdown=[{"name": l.name, "count": l.count} for l in loc_breakdown],
    )
