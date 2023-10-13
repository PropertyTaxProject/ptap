from geoalchemy2 import Geometry

from .api import db


class CookParcel(db.Model):
    __tablename__ = "cook"
    pin = db.Column("PIN", db.String)
    sale_price = db.Column("Sale Price", db.Float)
    sale_year = db.Column("SALE_YEAR", db.Integer)
    property_class = db.Column("Property Class", db.String)
    age = db.Column("Age", db.Integer)
    # TODO: Int?
    building_sq_ft = db.Column("Building Square Feet", db.Integer)
    land_sq_ft = db.Column("Land Square Feet", db.Integer)
    rooms = db.Column("Rooms", db.Integer)
    bedrooms = db.Column("Bedrooms", db.Integer)
    certified = db.Column("CERTIFIED", db.Integer)  # TODO: ?
    wall_material = db.Column("Wall Material", db.String)
    stories = db.Column("stories_record", db.Integer)
    basement = db.Column("basement", db.Integer)  # TODO: ?
    garage = db.Column("Garage indicator", db.Boolean)  # TODO: ?
    # lon = db.Column(db.Float)
    # lat = db.Column(db.Float)
    geom = db.Column(Geometry("POINT"))


# TODO: Add spatialite
class DetroitParcel(db.Model):
    __tablename__ = "detroit"
    pin = db.Column("parcel_num", db.String)
    sale_price = db.Column("Sale Price", db.Float)
    sale_year = db.Column("SALE_YEAR", db.Integer)
    year_built = db.Column(db.Integer)
    total_floor_area = db.Column(db.Float)
    extcat = db.Column(db.String)
    geom = db.Column(Geometry("POINT"))
    # lon = db.Column(db.Float)
    # lat = db.Column(db.Float)
