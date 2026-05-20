# today_book/backend/app/models/types.py
import json
from sqlalchemy import TypeDecorator, Text


class JSONList(TypeDecorator):
    """Stores a Python list as a JSON string in the database.
    Usage: Column(JSONList, default=[])
    """
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return json.dumps(value, ensure_ascii=False)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return None
