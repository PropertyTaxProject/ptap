import sqlite3
from math import acos, cos, radians, sin

import pandas as pd
from numpy import searchsorted, sort

from .models import CookParcel, DetroitParcel

con = sqlite3.connect("api/database/data.db", check_same_thread=False)


# helper functions
def great_circle(lon1, lat1, lon2, lat2):
    """
    https://medium.com/@petehouston/calculate-distance-of-two-locations-on-earth-using-python-1501b1944d97
    """
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    return 3958.756 * (
        acos(sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon1 - lon2))
    )


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


def query_on(col, val, range_val, filter_type):
    """
    type:
    1 -> categorical
    3 -> continuous
    """
    if (filter_type == 1) & (range_val == "Match"):  # categorical
        qs = ' AND "' + col + '" = "' + str(val) + '"'
        return qs
    elif filter_type == 3:  # continuous
        qs = (
            ' AND "'
            + col
            + '" >= '
            + str(val - range_val)
            + ' AND "'
            + col
            + '" <= '
            + str(val + range_val)
        )
        return qs
    else:
        raise Exception("Query On Error")


# TODO: Replace distance here with spatialite
def run_comps_query(query, val, range_val):
    print(query)
    data = pd.read_sql(query, con)
    if data.shape[0] > 1:
        data["Distance"] = data.apply(
            lambda x: great_circle(val[0], val[1], x.Longitude, x.Latitude), axis=1
        )
    else:
        data["Distance"] = None
    return data[data["Distance"] < range_val]


def avg_ecf(neighborhood):
    data = pd.read_sql(
        'SELECT "total_squa", "Sale Price" FROM detroit WHERE "Sale Price" is not null and Neighborhood = "'  # noqa
        + neighborhood
        + '"',
        con,
    )
    data["price_per_sqft"] = data["Sale Price"] / data["total_squa"]
    return data["price_per_sqft"].mean()
