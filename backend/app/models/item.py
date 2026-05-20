# today_book/backend/app/models/item.py
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class ItemCategory(Base):
    __tablename__ = "item_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    parent_id = Column(Integer, ForeignKey("item_categories.id"))
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    items = relationship("Item", back_populates="category")


class ItemLocation(Base):
    __tablename__ = "item_locations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    parent_id = Column(Integer, ForeignKey("item_locations.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    items = relationship("Item", back_populates="location")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category_id = Column(Integer, ForeignKey("item_categories.id"))
    location_id = Column(Integer, ForeignKey("item_locations.id"))
    purchase_date = Column(Date)
    purchase_price = Column(Float)
    current_value = Column(Float)
    quantity = Column(Integer, default=1)
    is_consumable = Column(Boolean, default=False)
    warranty_expire = Column(Date)
    notes = Column(Text)
    asset_tag = Column(String(50))
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="items")
    category = relationship("ItemCategory", back_populates="items")
    location = relationship("ItemLocation", back_populates="items")
    attachments = relationship("ItemAttachment", back_populates="item", cascade="all, delete-orphan")


class ItemAttachment(Base):
    __tablename__ = "item_attachments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    attachment_type = Column(String(20))  # photo/receipt/warranty
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    item = relationship("Item", back_populates="attachments")
