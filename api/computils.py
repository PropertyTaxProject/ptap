from .dataqueries import query_on, run_comps_query

def calculate_comps(targ, region, sales_comps, multiplier):
    ###
    #constants
    if region == 'detroit':
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
        pin_name = 'parcel_num'
        sale_name = 'Sale Price'
        debug = True
    elif region == 'cook':
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
        pin_name = 'PIN'
        sale_name = 'Sale Price'
        debug = True

    ###construct query
    pin_val = targ[pin_name].values[0]
    baseq = 'SELECT * FROM ' + region + ' WHERE ' + pin_name + ' != "' + pin_val + '"'

    if sales_comps:
        baseq += ' AND "' + sale_name + '" IS NOT NULL'

    if debug:
        print("~~~" + region + "~~~")
        print(targ[pin_name].values[0] + " |||| multiplier " + str(multiplier))

    if region == 'detroit':
        baseq += query_on('year_built', targ['year_built'].values[0], age_dif, 3)
        baseq += query_on('total_floo', targ['total_floo'].values[0], floor_dif, 3)
        baseq += query_on('total_acre', targ['total_acre'].values[0], acre_dif, 3)
        baseq += query_on('total_squa', targ['total_squa'].values[0], square_dif, 3)

        baseq += query_on('heightcat', targ['heightcat'].values[0], height, 1)
        baseq += query_on('extcat', targ['extcat'].values[0], exterior, 1,)
        baseq += query_on('bathcat', targ['bathcat'].values[0], bath, 1)
        baseq += query_on('has_basement', targ['has_basement'].values[0], basement, 1)
        baseq += query_on('has_garage', targ['has_garage'].values[0], garage, 1)
    elif region == 'cook':
        baseq += query_on('Age', targ['Age'].values[0], age_dif, 3)
        baseq += query_on('Building Square Feet', targ['Building Square Feet'].values[0], build_dif, 3)
        baseq += query_on('Land Square Feet', targ['Land Square Feet'].values[0], land_dif, 3)
        baseq += query_on('Rooms', targ['Rooms'].values[0], rooms_dif, 3)
        baseq += query_on('Bedrooms', targ['Bedrooms'].values[0], bedroom_dif, 3)
        baseq += query_on('CERTIFIED', targ['CERTIFIED'].values[0], av_dif, 3)

        baseq += query_on('Wall Material', targ['Wall Material'].values[0], wall_material, 1)
        baseq += query_on('stories_recode', targ['stories_recode'].values[0], stories, 1)
        baseq += query_on('basement_recode', targ['basement_recode'].values[0], basement, 1)
        baseq += query_on('Garage indicator', targ['Garage indicator'].values[0], garage_ind, 1)
    else:
        raise Exception('Invalid Region for Comps')

    if debug:
        print(baseq)
    ### run query and distance
    new = run_comps_query(
        baseq, (targ['Longitude'].values[0], targ['Latitude'].values[0]), distance_filter)

    if debug:
        print(new.shape)
    if region == 'detroit':
        return (prettify_detroit(targ, sales_comps), prettify_detroit(new, sales_comps))
    elif region == 'cook':
        return (prettify_cook(targ, sales_comps), prettify_cook(new, sales_comps))

def find_comps(targ, region, sales_comps, multiplier=1):
    try:
        new_targ, cur_comps = calculate_comps(targ, region, sales_comps, multiplier)
    except Exception as e:
        raise Exception('error in calc_comps: ' + str(e))
    if multiplier > 8: #no comps found within maximum search area---hault
        raise Exception('Comparables not found with given search')
    elif cur_comps.shape[0] < 10: #find more comps
        return find_comps(targ, region, sales_comps, multiplier*1.25)
    else: # return best comps
        return new_targ, cur_comps

def prettify_cook(data, sales_comps):
    cook_sf_cols = ['PIN', 'Property Address', 'Property Class',
                    'Age', 'Building Square Feet', 'Land Square Feet',
                    'Rooms', 'Bedrooms', 'Wall Material', 'stories_recode',
                    'basement_recode', 'Garage indicator', 'Distance', 'CERTIFIED']

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
        'heightcat' : 'Stories (not including basements)',
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
                    "Stories (not including basements)": height_d,
                    "Exterior": exterior_d
                    })

    return data
