# today_book/backend/app/utils/date_utils.py
from datetime import date, timedelta
import calendar


def get_week_range(year: int, week: int) -> tuple[str, str]:
    """Get start and end date of a given ISO week."""
    jan1 = date(year, 1, 1)
    # Find the first Monday of the year
    first_monday = jan1 + timedelta(days=(7 - jan1.weekday()) % 7)
    start = first_monday + timedelta(weeks=week - 1)
    end = start + timedelta(days=6)
    return start.isoformat(), end.isoformat()


def get_month_range(year: int, month: int) -> tuple[str, str]:
    """Get start and end date of a given month."""
    start = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end = date(year, month, last_day)
    return start.isoformat(), end.isoformat()


def get_year_range(year: int) -> tuple[str, str]:
    return f"{year}-01-01", f"{year}-12-31"


def get_today_str() -> str:
    return date.today().isoformat()


def get_week_number(d: date) -> int:
    return d.isocalendar()[1]
