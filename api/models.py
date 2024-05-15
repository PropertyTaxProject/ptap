from datetime import datetime

from geoalchemy2 import Geometry, WKBElement
from geoalchemy2.shape import to_shape

from .constants import DETROIT_EXTERIOR_MAP
from .db import db


def as_dict(obj):
    return {col.name: getattr(obj, col.name) for col in obj.__table__.columns}


def as_json_dict(obj):
    obj_dict = {}
    for col in obj.__table__.columns:
        obj_value = getattr(obj, col.name)
        if isinstance(obj_value, datetime):
            obj_value = datetime.strftime("%Y-%m-%d")
        elif isinstance(obj_value, WKBElement):
            point = to_shape(obj_value)
            obj_value = {"type": "Point", "coordinates": [point.x, point.y]}
        obj_dict[col.name] = obj_value
    return obj_dict


class CookParcel(db.Model):
    __tablename__ = "cook"
    id = db.Column(db.Integer, primary_key=True)
    pin = db.Column(db.String(64), index=True)
    street_number = db.Column(db.String(64), index=True)
    street_name = db.Column(db.String(64), index=True)
    neighborhood = db.Column(db.String(64), index=True)
    assessed_value = db.Column(db.Float)
    sale_price = db.Column(db.Float)
    sale_year = db.Column(db.Integer)
    property_class = db.Column(db.String(10))
    age = db.Column(db.Integer)
    year_built = db.Column(db.Integer)
    building_sq_ft = db.Column(db.Float)
    land_sq_ft = db.Column(db.Float)
    price_per_sq_ft = db.Column(db.Float)
    stories = db.Column(db.Integer)
    rooms = db.Column(db.Integer)
    bedrooms = db.Column(db.Integer)
    exterior = db.Column(db.Integer)
    basement = db.Column(db.Boolean)
    garage = db.Column(db.Boolean)
    geom = db.Column(Geometry(geometry_type="POINT", srid=4326))
    as_dict = as_dict
    as_json_dict = as_json_dict
    __table_args__ = (
        db.Index(
            "cook_compound_match_index",
            "pin",
            "age",
            "property_class",
            "building_sq_ft",
            "land_sq_ft",
            "exterior",
        ),
    )


class DetroitParcel(db.Model):
    __tablename__ = "detroit"
    id = db.Column(db.Integer, primary_key=True)
    pin = db.Column(db.String(64), index=True)
    street_number = db.Column(db.String(64), index=True)
    street_name = db.Column(db.String(64), index=True)
    neighborhood = db.Column(db.String(64), index=True)
    assessed_value = db.Column(db.Float)
    taxable_value = db.Column(db.Float)
    sale_price = db.Column(db.Float)
    sale_date = db.Column(db.Date)
    sale_year = db.Column(db.Integer)
    age = db.Column(db.Integer)
    effective_age = db.Column(db.Integer)
    year_built = db.Column(db.Integer)
    total_sq_ft = db.Column(db.Float)
    price_per_sq_ft = db.Column(db.Float)
    total_acreage = db.Column(db.Float)
    total_floor_area = db.Column(db.Float)
    stories = db.Column(db.Integer)
    baths = db.Column(db.Integer)
    basement = db.Column(db.Boolean)
    garage = db.Column(db.Boolean)
    exterior = db.Column(db.Integer)
    taxpayer = db.Column(db.String(128))
    homestead_exemption = db.Column(db.String(64))
    geom = db.Column(Geometry(geometry_type="POINT", srid=4326))
    as_dict = as_dict
    as_json_dict = as_json_dict
    __table_args__ = (
        db.Index(
            "detroit_compound_match_index",
            "pin",
            "age",
            "sale_price",
            "sale_year",
            "total_floor_area",
            "exterior",
        ),
    )

    @property
    def exterior_display(self):
        return DETROIT_EXTERIOR_MAP.get(self.exterior, "")


class MilwaukeeParcel(db.Model):
    __tablename__ = "milwaukee"
    id = db.Column(db.Integer, primary_key=True)
    pin = db.Column(db.String(64), index=True)
    street_number = db.Column(db.String(64), index=True)
    street_name = db.Column(db.String(64), index=True)
    neighborhood = db.Column(db.String(64), index=True)
    assessed_value = db.Column(db.Float)
    sale_price = db.Column(db.Float)
    sale_date = db.Column(db.Date)
    sale_year = db.Column(db.Integer)
    sale_validity = db.Column(db.String(64))
    age = db.Column(db.Integer)
    year_built = db.Column(db.Integer)
    total_sq_ft = db.Column(db.Float)
    price_per_sq_ft = db.Column(db.Float)
    bedrooms = db.Column(db.Integer)
    kitchen = db.Column(db.Integer)
    baths = db.Column(db.Integer)
    half_baths = db.Column(db.Integer)
    improved_status = db.Column(db.String(16))
    building_category = db.Column(db.String(32))
    building_sequence = db.Column(db.Integer)
    building_type = db.Column(db.String(16))
    condition = db.Column(db.String(16))
    quality = db.Column(db.String(16))
    rating_kitchen = db.Column(db.String(16))
    rating_bath = db.Column(db.String(16))
    rating_half_bath = db.Column(db.String(16))
    geom = db.Column(Geometry(geometry_type="POINT", srid=4326))
    as_dict = as_dict
    as_json_dict = as_json_dict
    __table_args__ = (
        db.Index("milwaukee_compound_match_index", "pin", "age", "total_sq_ft"),
    )
