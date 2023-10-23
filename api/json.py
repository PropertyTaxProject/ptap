import json
from datetime import datetime

from flask.json.provider import JSONProvider
from geoalchemy2 import WKBElement
from geoalchemy2.shape import to_shape
from sqlalchemy.ext.declarative import DeclarativeMeta


class SQLAlchemyJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj.__class__, DeclarativeMeta) and hasattr(obj, "as_dict"):
            obj_dict = {}
            for col in obj.__table__.columns:
                obj_value = getattr(obj, col.name)
                if isinstance(obj_value, datetime):
                    obj_value = obj_value.strftime("%Y-%m-%d")
                elif isinstance(obj_value, WKBElement):
                    point = to_shape(obj_value)
                    obj_value = {"type": "Point", "coordinates": [point.x, point.y]}
                obj_dict[col.name] = obj_value
            breakpoint()
            return obj_dict

        return json.JSONEncoder.default(self, obj)


class SQLAlchemyJSONProvider(JSONProvider):
    def dumps(self, obj, **kwargs):
        breakpoint()
        return json.dumps(obj, **kwargs, cls=SQLAlchemyJSONEncoder)
