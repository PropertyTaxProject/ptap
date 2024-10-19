from typing import Optional, Type

from . import db
from .models import CookParcel, DetroitParcel, MilwaukeeParcel


def model_from_region(region: str) -> Type[db.Model]:
    if region == "cook":
        return CookParcel
    elif region == "detroit":
        return DetroitParcel
    elif region == "milwaukee":
        return MilwaukeeParcel


def yes_no(value: Optional[bool]) -> str:
    if value is None:
        return ""
    return "Yes" if value else "No"
