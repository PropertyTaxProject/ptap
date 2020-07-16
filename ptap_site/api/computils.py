from math import radians, degrees, sin, cos, asin, acos, sqrt
from numpy import searchsorted, sort

#utility functions
def ecdf(x):
    x = sort(x)
    n = len(x)
    def _ecdf(v):
        # side='right' because we want Pr(x <= v)
        return (searchsorted(x, v, side='right') + 1) / n
    return _ecdf

def filter_on(df, col, val, range_val, debug=False):
    if debug:
        print(df.shape)

    if df.shape[0] == 0:
        print('cannot filter a dataframe with 0 rows')
        return df
    
    if (col in ['Wall Material', 'stories_recode', 'basement_recode', 'Garage indicator']) & (range_val == 'Match'):
        if debug:
            print('filtering ' + col + ' ' + str(val) + ' on ' + str(range_val))
        return df[df[col] == val]
    elif col == 'Distance':
        if debug:
            print('filtering on distance less than', str(range_val), 'miles away')
        df['Distance'] = df.apply(lambda x: great_circle(val[0], val[1], x.Longitude, x.Latitude), axis=1) 
        return df[df[col] < range_val]
    else:
        if debug:
            print('filtering ' + col + ' ' + str(val) + ' +/- ' + str(range_val))
        return df[df[col].between(val - range_val, val + range_val)]
    
def great_circle(lon1, lat1, lon2, lat2):
    '''
    https://medium.com/@petehouston/calculate-distance-of-two-locations-on-earth-using-python-1501b1944d97
    '''
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    return 3958.756 * (
        acos(sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon1 - lon2))
    )