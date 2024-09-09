from typing import List, Optional, Tuple

from geoalchemy2.functions import ST_DistanceSphere
from sqlalchemy import func

from .db import db
from .models import ParcelType
from .utils import model_from_region


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
    # TODO: To list
    return (
        model.query.filter(func.similarity(model.street_address, address) > 0.3)
        .order_by(func.similarity(model.street_address, address).desc())
        .limit(10)
        .all()
    )
