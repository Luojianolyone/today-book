# today_book/backend/app/utils/upload.py
import os
import uuid
import mimetypes
from app.config import settings

# Allowed MIME types grouped by category
ALLOWED_TYPES = {
    "diary": {
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/pdf",
    },
    "item": {
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
}

# Extension whitelist for extra safety
ALLOWED_EXTENSIONS = {
    "diary": {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"},
    "item": {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx"},
}


def validate_file(file_filename: str, file_content_type: str, category: str) -> None:
    """Validate file type and extension. Raises ValueError on failure."""
    ext = os.path.splitext(file_filename)[1].lower()
    allowed_exts = ALLOWED_EXTENSIONS.get(category, set())
    if ext not in allowed_exts:
        raise ValueError(f"不支持的文件类型: {ext}。允许: {', '.join(sorted(allowed_exts))}")

    allowed_mimes = ALLOWED_TYPES.get(category, set())
    if file_content_type and file_content_type not in allowed_mimes:
        raise ValueError(f"不支持的文件格式: {file_content_type}")


def validate_file_size(size: int) -> None:
    """Validate file size against MAX_UPLOAD_SIZE. Raises ValueError on failure."""
    if size > settings.MAX_UPLOAD_SIZE:
        max_mb = settings.MAX_UPLOAD_SIZE / (1024 * 1024)
        raise ValueError(f"文件大小超过限制 (最大 {max_mb:.0f}MB)")


def safe_filename(original_filename: str) -> str:
    """Generate a secure filename preserving only the extension."""
    ext = os.path.splitext(original_filename)[1].lower()
    return f"{uuid.uuid4().hex}{ext}"


def build_upload_path(user_id: int, category: str, sub_id: str) -> str:
    """Build a safe upload directory path."""
    path = os.path.join(settings.UPLOAD_DIR, str(user_id), category, str(sub_id))
    # Resolve to absolute path and verify it's under UPLOAD_DIR
    abs_path = os.path.realpath(path)
    abs_upload_dir = os.path.realpath(settings.UPLOAD_DIR)
    if not abs_path.startswith(abs_upload_dir):
        raise ValueError("非法上传路径")
    os.makedirs(abs_path, exist_ok=True)
    return abs_path
