import json
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


def load_s3_json(s3, bucket, key):
    try:
        return json.load(s3.get_object(Bucket=bucket, Key=key)["Body"])
    except Exception:
        return
