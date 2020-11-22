from math import radians, sin, cos, acos
import sqlite3
from numpy import searchsorted, sort
import pandas as pd

con = sqlite3.connect('api/data.sqlite', check_same_thread=False)

# helper functions
def great_circle(lon1, lat1, lon2, lat2):
    '''
    https://medium.com/@petehouston/calculate-distance-of-two-locations-on-earth-using-python-1501b1944d97
    '''
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    return 3958.756 * (
        acos(sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon1 - lon2))
    )

def ecdf(x):
    x = sort(x)
    n = len(x)
    def _ecdf(v):
        # side='right' because we want Pr(x <= v)
        return (searchsorted(x, v, side='right') + 1) / n
    return _ecdf

# sql query things
def address_candidates_query(region, st_num):
    return pd.read_sql('SELECT * FROM ' + region + ' WHERE st_num = ' + st_num, con)

def get_pin(region, pin):
    if region == 'detroit':
        pin_name = 'parcel_num'
    elif region == 'cook':
        pin_name = 'PIN'
    qs = 'SELECT * FROM ' + region + ' WHERE ' + pin_name + ' = "' + pin + '"'

    return pd.read_sql(qs, con)

def query_on(col, val, range_val, filter_type):
    '''
    type:
    1 -> categorical
    3 -> continuous
    '''
    if (filter_type == 1) & (range_val == 'Match'): #categorical
        qs = ' AND "' + col + '" = "' + str(val) + '"'
        return qs
    elif filter_type == 3: #continuous
        qs = ' AND "' + col + '" >= ' + \
             str(val - range_val) + ' AND "' + col + '" <= ' + str(val + range_val)
        return qs
    else:
        raise Exception('Query On Error')

def run_comps_query(query, val, range_val):
    data = pd.read_sql(query, con)
    data['Distance'] = data.apply(
        lambda x: great_circle(val[0], val[1], x.Longitude, x.Latitude), axis=1)
    return data[data['Distance'] < range_val]
