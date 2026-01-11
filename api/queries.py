import json
from datetime import date, datetime
from typing import List, Mapping, Tuple, cast

from geoalchemy2.functions import ST_DistanceSphere
from sqlalchemy import func

from . import db
from .models import ParcelType, Region, Submission
from .utils import model_from_region


def iso8601_serializer(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def address_candidates_query(region, st_num):
    model = model_from_region(cast("Region", region))
    assert model.query is not None
    return model.query.filter(model.street_number == st_num.strip())


def find_parcel(region: str, pin: str) -> ParcelType | None:
    model = model_from_region(cast("Region", region))
    assert model.query is not None
    return model.query.filter(model.pin == pin).first()


def find_parcel_with_distance(region, pin, parcel) -> tuple[ParcelType, float] | None:
    model = model_from_region(cast("Region", region))
    result = (
        db.session.query(
            model, ST_DistanceSphere(model.geom, parcel.geom).label("distance")
        )
        .filter(model.pin == pin)
        .first()
    )
    if result is None:
        return None
    return result


def find_parcels_from_ids_with_distance(
    region: str, parcel: ParcelType, ids: List[str]
) -> List[Tuple[ParcelType, float]]:
    model = model_from_region(cast("Region", region))
    result = (
        db.session.query(model, ST_DistanceSphere(model.geom, parcel.geom))
        .filter(model.pin.in_(ids))
        .all()
    )
    return [(parcel_item, distance) for (parcel_item, distance) in result]


def find_address_candidates(region: str, address: str) -> List[ParcelType]:
    model = model_from_region(cast("Region", region))
    assert model.query is not None
    return (
        model.query.filter(model.street_address.op("%")(address))
        .order_by(func.similarity(model.street_address, address).desc())
        .limit(10)
        .all()
    )


def log_step(logger, data) -> Submission:
    logger.info(f"LOG_STEP: {json.dumps(data, default=iso8601_serializer)}")
    return create_or_update_submission(data.get("uuid"), data)


def create_or_update_submission(uuid: str, data: Mapping) -> Submission:
    assert Submission.query is not None
    submission = Submission.query.filter_by(uuid=uuid).first()  # type: ignore[arg-type]
    json_data = json.loads(json.dumps(data, default=iso8601_serializer))
    if submission:
        submission.data = json_data
    else:
        submission = Submission(uuid=uuid, data=json_data)  # type: ignore[arg-type,call-arg]
        db.session.add(submission)
    db.session.commit()
    return submission
