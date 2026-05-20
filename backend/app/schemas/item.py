# today_book/backend/app/schemas/item.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ItemCategoryCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None


class ItemLocationCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None


class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    location_id: Optional[int] = None
    purchase_date: Optional[str] = None
    purchase_price: Optional[float] = None
    current_value: Optional[float] = None
    quantity: int = 1
    is_consumable: bool = False
    warranty_expire: Optional[str] = None
    notes: Optional[str] = None


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    location_id: Optional[int] = None
    purchase_date: Optional[str] = None
    purchase_price: Optional[float] = None
    current_value: Optional[float] = None
    quantity: Optional[int] = None
    is_consumable: Optional[bool] = None
    warranty_expire: Optional[str] = None
    notes: Optional[str] = None
    is_archived: Optional[bool] = None


class ItemResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    category_id: Optional[int]
    location_id: Optional[int]
    purchase_date: Optional[str]
    purchase_price: Optional[float]
    current_value: Optional[float]
    quantity: int
    is_consumable: bool
    warranty_expire: Optional[str]
    notes: Optional[str]
    asset_tag: Optional[str]
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ItemStatsSummary(BaseModel):
    total_items: int
    total_value: float
    total_purchase_value: float
    category_breakdown: list[dict]
    location_breakdown: list[dict]
