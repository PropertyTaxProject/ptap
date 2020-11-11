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

def filter_on(df, col, val, range_val, filter_type, debug=False):
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
    
    
def great_circle(lon1, lat1, lon2, lat2):
    '''
    https://medium.com/@petehouston/calculate-distance-of-two-locations-on-earth-using-python-1501b1944d97
    '''
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    return 3958.756 * (
        acos(sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon1 - lon2))
    )

#comp finder functions
def comps_cook_sf(targ, cook_sf, multiplier, sales_comps):
    ###
    #constants
    age_dif = 15 * multiplier
    build_dif = 0.10 * targ['Building Square Feet'].values[0] * multiplier
    land_dif = 0.25 * targ['Land Square Feet'].values[0] * multiplier
    rooms_dif = 1.5 * multiplier
    bedroom_dif = 1.5 * multiplier
    av_dif = 0.5 * targ['CERTIFIED'].values[0] * multiplier

    
    wall_material = "Match" #wall material 1=wood, 2=masonry, 3=wood&masonry, 4=stucco
    stories = "Match" #1, 2, or 3 stories
    basement = "Match" #1 full, 0 partial
    garage_ind = "Match" #1 any garage 0 no garage
    
    distance_filter = 1 * multiplier #miles

    debug = False
    fulldebug = False
    ###
    new = cook_sf[cook_sf['PIN'] != targ['PIN'].values[0]]

    if sales_comps:
        new = new[new['Sale Price'].notnull()]

    if debug:
        print("~~~COOK")
        print(targ['PIN'].values[0] + " |||| multiplier " + str(multiplier))
        print(new.shape)

    new = filter_on(new, 'Age', targ['Age'].values[0], age_dif, 3, fulldebug)
    new = filter_on(new, 'Building Square Feet', targ['Building Square Feet'].values[0], build_dif, 3, fulldebug)
    new = filter_on(new, 'Land Square Feet', targ['Land Square Feet'].values[0], land_dif, 3, fulldebug)
    new = filter_on(new, 'Rooms', targ['Rooms'].values[0], rooms_dif, 3, fulldebug)
    new = filter_on(new, 'Bedrooms', targ['Bedrooms'].values[0], bedroom_dif, 3, fulldebug)
    new = filter_on(new, 'CERTIFIED', targ['CERTIFIED'].values[0], av_dif, 3, fulldebug)

    new = filter_on(new, 'Wall Material', targ['Wall Material'].values[0], wall_material, 1, fulldebug)
    new = filter_on(new, 'stories_recode', targ['stories_recode'].values[0], stories, 1, fulldebug)
    new = filter_on(new, 'basement_recode', targ['basement_recode'].values[0], basement, 1, fulldebug)
    new = filter_on(new, 'Garage indicator', targ['Garage indicator'].values[0], garage_ind, 1, fulldebug)

    new = filter_on(new, 'Distance', (targ['Longitude'].values[0], targ['Latitude'].values[0]), distance_filter, 2, fulldebug)

    if debug:
        print(new.shape)
        print("~~~")

    return(prettify_cook(targ, sales_comps), prettify_cook(new, sales_comps))

def comps_detroit_sf(targ, detroit_sf, multiplier, sales_comps):
    ###
    #constants
    square_dif = 100 * multiplier
    acre_dif = .05 * multiplier
    floor_dif = 50 * multiplier
    age_dif = 15 * multiplier
    distance_filter = 1 * multiplier #miles
    exterior = 'Match' # (1 siding, 2 brick/other, 3 brick, 4 other)
    basement = 'Match'
    garage = 'Match'
    bath = 'Match' #(1 1.0, 2 1.5, 3 2 to 3, 4 3+)
    height = 'Match' #(1 1 to 1.5, 2 1.5 to 2.5, 3 3+)

    debug = False
    fulldebug = False
    ###
    new = detroit_sf[detroit_sf['parcel_num'] != targ['parcel_num'].values[0]]

    if sales_comps:
        new = new[new['Sale Price'].notnull()]

    if debug:
        print("~~~DETROIT")
        print(targ['parcel_num'].values[0] + " |||| multiplier " + str(multiplier))
        print(new.shape)

    new = filter_on(new, 'year_built', targ['year_built'].values[0], age_dif, 3, fulldebug)
    new = filter_on(new, 'total_floo', targ['total_floo'].values[0], floor_dif, 3, fulldebug)
    new = filter_on(new, 'total_acre', targ['total_acre'].values[0], acre_dif, 3, fulldebug)
    new = filter_on(new, 'total_squa', targ['total_squa'].values[0], square_dif, 3, fulldebug)

    new = filter_on(new, 'heightcat', targ['heightcat'].values[0], height, 1, fulldebug)
    new = filter_on(new, 'extcat', targ['extcat'].values[0], exterior, 1, fulldebug)
    new = filter_on(new, 'bathcat', targ['bathcat'].values[0], bath, 1, fulldebug)
    new = filter_on(new, 'has_basement', targ['has_basement'].values[0], basement, 1, fulldebug)
    new = filter_on(new, 'has_garage', targ['has_garage'].values[0], garage, 1, fulldebug)

    new = filter_on(new, 'Distance', (targ['Longitude'].values[0], targ['Latitude'].values[0]), distance_filter, 2, fulldebug)

    if debug:
        print(new.shape)
        print("~~~")
    
    return(prettify_detroit(targ, sales_comps), prettify_detroit(new, sales_comps))

def prettify_cook(data, sales_comps):
    cook_sf_cols = ['PIN', 'Property Address', 'Property Class', 'Age', 'Building Square Feet', 'Land Square Feet', 
    'Rooms', 'Bedrooms', 'Wall Material', 'stories_recode', 'basement_recode', 'Garage indicator',
    'Distance', 'CERTIFIED']
    
    if sales_comps:
        cook_sf_cols = cook_sf_cols + ['Sale Price', 'Sale Year']

    cook_sf_rename_dict = {
        'Property Class':'Class',
        'Building Square Feet':'building_sqft',
        'Land Square Feet':'land_sqft',
        'Bedrooms':'Beds',
        'Wall Material':'Exterior',
        'stories_recode':'Stories',
        'basement_recode':'Basement',
        'Garage indicator':'Garage',
        'CERTIFIED':'assessed_value',
        'Property Address':'Address'
    }

    wall_d = {
        1:"Wood",
        2:"Masonry",
        3:"Wood/Masonry",
        4:"Stucco"}

    basement_d = {
        0:"Partial/None",
        1:"Full"
    }

    garage_d = {
        0:"None",
        1:"Yes"
    }

    if data.shape[0] != 0:
        data = data[cook_sf_cols].rename(columns=cook_sf_rename_dict)
        data = data.replace({"Exterior": wall_d,
                    "Basement": basement_d,
                    "Garage": garage_d,
                    }) 
    return data


def prettify_detroit(data, sales_comps):
    detroit_sf_cols = ['parcel_num', 'address', 'total_squa', 'total_acre', 
                        'total_floo', 'year_built', 'heightcat', 'extcat', 'bathcat',
                        'has_garage', 'has_basement', 'assessed_v', 'Distance']

    if sales_comps:
        detroit_sf_cols = detroit_sf_cols + ['Sale Price', 'Sale Date']

    detroit_sf_rename_dict = {
        'parcel_num' : 'PIN',
        'total_squa' : 'total_sqft',
        'total_floo' : 'total_floorarea',
        'heightcat' : 'Height',
        'extcat': 'Exterior',
        'bathcat': 'Baths',
        'assessed_v' : 'assessed_value',
        'address' : 'Address',
        'has_basement': 'Basement',
        'has_garage': 'Garage',
        'year_built': 'Age',
    }


    bath_d = {
        1:"1",
        2:"1.5",
        3:"2 to 3",
        4:"3+"
    }

    basement_d = {
        0:"None",
        1:"Yes"
    }

    garage_d = {
        0:"None",
        1:"Yes"
    }

    exterior_d = {
        1:"Siding",
        2:"Brick/other",
        3:"Brick",
        4:"Other"
    }

    height_d = {
        1:"1 to 1.5",
        2:"1.5 to 2.5",
        3:"3+",
    }
    if data.shape[0] != 0:
        data = data[detroit_sf_cols].rename(columns=detroit_sf_rename_dict)
        data = data.replace({"Baths": bath_d,
                    "Basement": basement_d,
                    "Garage": garage_d,
                    "Height": height_d,
                    "Exterior": exterior_d
                    })
    
    return data