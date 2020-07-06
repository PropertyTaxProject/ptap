from computils import filter_on, ecdf #module

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
    
    print(new.shape)

    targ['Distance'] = 0
        
    return(targ[cook_sf_cols].rename(columns=cook_sf_rename_dict), new[cook_sf_cols].rename(columns=cook_sf_rename_dict))

def process_one_pin(input_data, cook_sf, multiplier=1):
    # for now, input only as pin 
    # for now, let's do cook sf only
    # eventually we will need to determine if a pin/address is cook sf, cook condos, detroit
    target_pin = '16052120090000' #replace with actual input
    targ = cook_sf[cook_sf['PIN'] == target_pin]

    new_targ, cur_comps = comps_cook_sf(targ, cook_sf, multiplier)
    
    if(multiplier > 3): #no comps found with parameters stop search
        return ''
    elif(cur_comps.shape[0] < 10): # find more comps
        return process_one_pin(input_data, multiplier*1.25)
    else: # return best comps
        dist_weight = 1
        valuation_weight = 3
        
        cur_comps['dist_dist'] = ecdf(cur_comps.Distance)(cur_comps.Distance)
        cur_comps['val_dist'] = ecdf(cur_comps.CERTIFIED)(cur_comps.CERTIFIED)
        cur_comps['score'] = dist_weight * cur_comps['dist_dist'] + valuation_weight * cur_comps['val_dist']
        cur_comps = cur_comps.sort_values(by=['score'])
        output = {}
        output['target_pin'] = new_targ.to_json(orient='records')
        output['comparables'] = cur_comps.to_json(orient='records') 

        print(output)

        return output