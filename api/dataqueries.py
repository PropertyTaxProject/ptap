import pandas as pd
from numpy import searchsorted, sort
from sqlalchemy.sql import func

from .db import db
from .models import CookParcel, DetroitParcel


def ecdf(x):
    x = sort(x)
    n = len(x)

    def _ecdf(v, reverse=False):
        # side='right' because we want Pr(x <= v)
        prob = (searchsorted(x, v, side="right") + 1) / n
        if reverse:
            return 1 - prob
        return prob

    return _ecdf


# TODO: autocomplete/typeahead?
# sql query things
def address_candidates_query(region, st_num):
    # TODO: Fix this
    model = None
    if region == "cook":
        model = CookParcel
    elif region == "detroit":
        model = DetroitParcel
    return model.query.filter(model.street_number == st_num)


def get_pin(region, pin):
    if region == "cook":
        model = CookParcel
    elif region == "detroit":
        model = DetroitParcel
    return pd.DataFrame([p.as_dict() for p in model.query.filter(model.pin == pin)])


def avg_ecf(neighborhood):
    return (
        db.session.query(func.avg(DetroitParcel.sale_price / DetroitParcel.total_sq_ft))
        .filter(
            DetroitParcel.sale_price.isnot(None),
            DetroitParcel.total_sq_ft.isnot(None),
            DetroitParcel.total_sq_ft > 0,
            DetroitParcel.neighborhood == neighborhood,
        )
        .scalar()
    )
