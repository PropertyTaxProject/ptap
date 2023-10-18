from geoalchemy2 import Geometry
from thefuzz import process

from .db import db


# TODO:
def fuzzy_address_matches(street, parcels):
    parcel_dict = {p.street_name: p for p in parcels}
    results = process.extractBests(street, parcel_dict.keys(), score_cutoff=50)
    return [parcel_dict[r[0]] for r in results]


class CookParcel(db.Model):
    __tablename__ = "cook"
    id = db.Column(db.Integer, primary_key=True)
    pin = db.Column(db.String(64))
    street_number = db.Column(db.String(64))
    street_name = db.Column(db.String(64))
    sale_price = db.Column(db.Float)
    sale_year = db.Column(db.Integer)
    property_class = db.Column(db.String(10))
    age = db.Column(db.Integer)
    building_sq_ft = db.Column(db.Integer)
    land_sq_ft = db.Column(db.Integer)
    rooms = db.Column(db.Integer)
    bedrooms = db.Column(db.Integer)
    certified = db.Column(db.Integer)  # TODO: ?
    wall_material = db.Column(db.String(32))
    stories = db.Column(db.Integer)
    basement = db.Column(db.Integer)  # TODO: ?
    garage = db.Column(db.Boolean)
    geom = db.Column(Geometry("POINT"))


class DetroitParcel(db.Model):
    __tablename__ = "detroit"
    id = db.Column(db.Integer, primary_key=True)
    pin = db.Column(db.String(64))
    street_number = db.Column(db.String(64))
    street_name = db.Column(db.String(64))
    sale_price = db.Column(db.Float)
    sale_year = db.Column(db.Integer)
    year_built = db.Column(db.Integer)
    total_floor_area = db.Column(db.Float)
    extcat = db.Column(db.String(10))
    geom = db.Column(Geometry("POINT"))
    # TODO: More columns
