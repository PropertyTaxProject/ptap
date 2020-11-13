def address_candidates_query(region, st_num):
    return pd.read_sql('SELECT * FROM ' + region + ' WHERE st_num = ' + st_num, CON)

def get_pin(region, pin):
    if region == 'detroit':
        pin_name = 'parcel_num'
    elif region == 'cook':
        pin_name = 'PIN'
    qs = 'SELECT * FROM ' + region + ' WHERE ' + pin_name + ' = "' + pin + '"'
    return pd.read_sql(qs, CON)

def query_on(df, col, val, range_val, filter_type, debug=False):
    '''
    type: 
    1 -> categorical
    2 -> distance
    3 -> continuous 
    '''
    if debug:
        print(df.shape)
    if df.shape[0] == 0:
        print('cannot filter a dataframe with 0 rows')
        return df
    elif (filter_type == 1) & (range_val == 'Match'): #categorical
        if debug:
            print('filtering ' + col + ' ' + str(val) + ' on ' + str(range_val))
        return df[df[col] == val]
    elif filter_type == 2: #distance
        if debug:
            print('filtering on distance less than', str(range_val), 'miles away')
        df['Distance'] = df.apply(lambda x: great_circle(val[0], val[1], x.Longitude, x.Latitude), axis=1) 
        return df[df[col] < range_val]
    elif filter_type == 3: #continuous
        if debug:
            print('filtering ' + col + ' ' + str(val) + ' +/- ' + str(range_val))
        return df[df[col].between(val - range_val, val + range_val)]
    else:
        #throw error
        print('error')
        return 