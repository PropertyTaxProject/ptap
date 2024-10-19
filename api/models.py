from datetime import datetime
from typing import Union

from geoalchemy2 import Geometry
from sqlalchemy.dialects.postgresql import JSONB

from . import db


class CookParcel(db.Model):
    __tablename__ = "cook"
    id = db.Column(db.Integer, primary_key=True)
    pin = db.Column(db.String(64), index=True)
    street_number = db.Column(db.String(64), index=True)
    street_name = db.Column(db.String(64), index=True)
    street_address = db.Column(db.String(128))
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
        db.Index(
            "cook_street_address_trgm_index",
            "street_address",
            postgresql_using="gin",
            postgresql_ops={"street_address": "gin_trgm_ops"},
        ),
    )


class DetroitParcel(db.Model):
    __tablename__ = "detroit"
    id = db.Column(db.Integer, primary_key=True)
    pin = db.Column(db.String(64), index=True)
    street_number = db.Column(db.String(64), index=True)
    street_name = db.Column(db.String(64), index=True)
    street_address = db.Column(db.String(128))
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
        db.Index(
            "detroit_street_address_trgm_index",
            "street_address",
            postgresql_using="gin",
            postgresql_ops={"street_address": "gin_trgm_ops"},
        ),
    )


class MilwaukeeParcel(db.Model):
    __tablename__ = "milwaukee"
    id = db.Column(db.Integer, primary_key=True)
    pin = db.Column(db.String(64), index=True)
    street_number = db.Column(db.String(64), index=True)
    street_name = db.Column(db.String(64), index=True)
    street_address = db.Column(db.String(128))
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
    __table_args__ = (
        db.Index("milwaukee_compound_match_index", "pin", "age", "total_sq_ft"),
        db.Index(
            "milwaukee_street_address_trgm_index",
            "street_address",
            postgresql_using="gin",
            postgresql_ops={"street_address": "gin_trgm_ops"},
        ),
    )


ParcelType = Union[CookParcel, DetroitParcel, MilwaukeeParcel]


class Submission(db.Model):
    __tablename__ = "submissions"
    uuid = db.Column(db.String(64), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    data = db.Column(JSONB, default=dict)
