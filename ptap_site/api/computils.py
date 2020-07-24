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

#comp finder functions
def comps_cook_sf(targ, cook_sf, multiplier):
    ###
    #constants
    age_dif = 10 * multiplier
    build_dif = 0.05 * targ['Building Square Feet'].values[0] * multiplier
    land_dif = 0.25 * targ['Land Square Feet'].values[0] * multiplier
    rooms_dif = 1 * multiplier
    bedroom_dif = 1 * multiplier
    
    wall_material = "Match" #wall material 1=wood, 2=masonry, 3=wood&masonry, 4=stucco
    stories = "Match" #1, 2, or 3 stories
    basement = "Match" #1 full, 0 partial
    garage_ind = "Match" #1 any garage 0 no garage
    
    distance_filter = 1 * multiplier #miles
    
    cook_sf_cols = ['PIN', 'Property Class', 'Age', 'Building Square Feet', 'Land Square Feet', 
    'Rooms', 'Bedrooms', 'Wall Material', 'stories_recode', 'basement_recode', 'Garage indicator',
    'Distance', 'CERTIFIED']

    cook_sf_rename_dict = {
        'Property Class':'property_class',
        'Building Square Feet':'building_sqft',
        'Land Square Feet':'land_sqft',
        'Wall Material':'wall_material',
        'Garage indicator':'garage',
        'CERTIFIED':'assessed_value'
    }
    ###
       
    new = cook_sf[cook_sf['PIN'] != targ['PIN'].values[0]]
    new = filter_on(new, 'Age', targ['Age'].values[0], age_dif)
    new = filter_on(new, 'Building Square Feet', targ['Building Square Feet'].values[0], build_dif)
    new = filter_on(new, 'Land Square Feet', targ['Land Square Feet'].values[0], land_dif)
    new = filter_on(new, 'Rooms', targ['Rooms'].values[0], rooms_dif)
    new = filter_on(new, 'Bedrooms', targ['Bedrooms'].values[0], bedroom_dif)
    
    new = filter_on(new, 'Wall Material', targ['Wall Material'].values[0], wall_material)
    new = filter_on(new, 'stories_recode', targ['stories_recode'].values[0], stories)
    new = filter_on(new, 'basement_recode', targ['basement_recode'].values[0], basement)
    new = filter_on(new, 'Garage indicator', targ['Garage indicator'].values[0], garage_ind)

    new = filter_on(new, 'Distance', (targ['Longitude'].values[0], targ['Latitude'].values[0]), distance_filter)
            
    return(targ[cook_sf_cols].rename(columns=cook_sf_rename_dict), new[cook_sf_cols].rename(columns=cook_sf_rename_dict))

def comps_detroit_sf(targ, detroit_sf, multiplier):
    ###
    #constants
    #eventually need to switch to sales comps
    square_dif = 100 * multiplier
    acre_dif = .05 * multiplier
    floor_dif = 50 * multiplier
    age_dif = 15 * multiplier
    distance_filter = 1 * multiplier #miles
    
    detroit_sf_cols = ['parcel_num', 'address', 'zip_code', 'taxpayer_1', 'property_c',
                        'total_squa', 'total_acre', 'total_floo', 'year_built', 'assessed_v', 'Distance']
    detroit_sf_rename_dict = {
        'parcel_num' : 'PIN',
        'taxpayer_1' : 'taxpayer',
        'property_c' : 'class',
        'total_squa' : 'total_sqft',
        'total_floo' : 'total_floorarea', 
        'assessed_v' : 'assessed_value'
    }
    ###

    new = detroit_sf[detroit_sf['parcel_num'] != targ['parcel_num'].values[0]]
    new = filter_on(new, 'year_built', targ['year_built'].values[0], age_dif)
    new = filter_on(new, 'total_floo', targ['total_floo'].values[0], floor_dif)
    new = filter_on(new, 'total_acre', targ['total_acre'].values[0], acre_dif)
    new = filter_on(new, 'total_squa', targ['total_squa'].values[0], square_dif)
    new = filter_on(new, 'Distance', (targ['Longitude'].values[0], targ['Latitude'].values[0]), distance_filter)

    return(targ[detroit_sf_cols].rename(columns=detroit_sf_rename_dict), new[detroit_sf_cols].rename(columns=detroit_sf_rename_dict))
