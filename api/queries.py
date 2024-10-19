import json
from datetime import date, datetime
from typing import List, Mapping, Optional, Tuple

from geoalchemy2.functions import ST_DistanceSphere
from sqlalchemy import func

from . import db
from .models import ParcelType, Submission
from .utils import model_from_region


def iso8601_serializer(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def address_candidates_query(region, st_num):
    model = model_from_region(region)
    return model.query.filter(model.street_number == st_num.strip())


def find_parcel(region: str, pin: str) -> Optional[ParcelType]:
    model = model_from_region(region)
    return model.query.filter(model.pin == pin).first()


def find_parcel_with_distance(region, pin, parcel):
    model = model_from_region(region)
    result = (
        db.session.query(
            model, ST_DistanceSphere(model.geom, parcel.geom).label("distance")
        )
        .filter(model.pin == pin)
        .first()
    )
    if result is None:
        return (None, None)
    return result


def find_parcels_from_ids_with_distance(
    region: str, parcel: ParcelType, ids: List[str]
) -> List[Tuple[ParcelType, float]]:
    model = model_from_region(region)
    result = (
        db.session.query(model, ST_DistanceSphere(model.geom, parcel.geom))
        .filter(model.pin.in_(ids))
        .all()
    )
    return [(parcel_item, distance) for (parcel_item, distance) in result]


def find_address_candidates(region: str, address: str) -> List[ParcelType]:
    model = model_from_region(region)
    return (
        model.query.filter(func.similarity(model.street_address, address) > 0.3)
        .order_by(func.similarity(model.street_address, address).desc())
        .limit(10)
        .all()
    )


def log_step(logger, data):
    logger.info(f"LOG_STEP: {json.dumps(data, default=iso8601_serializer)}")
    create_or_update_submission(data.get("uuid"), data)


def create_or_update_submission(uuid: str, data: Mapping) -> Submission:
    submission = Submission.query.filter_by(uuid=uuid).first()
    if submission:
        submission.data = data
    else:
        json_data = json.loads(json.dumps(data, default=iso8601_serializer))
        submission = Submission(uuid=uuid, data=json_data)
        db.session.add(submission)
    db.session.commit()
    return submission
