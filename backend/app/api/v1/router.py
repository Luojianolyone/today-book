# today_book/backend/app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1 import auth, diary, review, item, finance, stats, search

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(diary.router)
api_router.include_router(review.router)
api_router.include_router(item.router)
api_router.include_router(finance.router)
api_router.include_router(stats.router)
api_router.include_router(search.router)
