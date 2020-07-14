from computils import filter_on, ecdf
from subprocess import Popen
import csv


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
            
    return(targ[cook_sf_cols].rename(columns=cook_sf_rename_dict), new[cook_sf_cols].rename(columns=cook_sf_rename_dict))

def process_one_pin(input_data, cook_sf, max_comps, multiplier=1):
    # for now, input only as pin 
    # for now, let's do cook sf only
    # eventually we will need to determine if a pin/address is cook sf, cook condos, detroit

    #example pin '16052120090000'

    target_pin = input_data['pin']
    targ = cook_sf[cook_sf['PIN'] == target_pin].copy(deep=True)
    targ['Distance'] = 0

    new_targ, cur_comps = comps_cook_sf(targ, cook_sf, multiplier)
    
    if(multiplier > 3): #no comps found with parameters stop search
        return ''
    elif(cur_comps.shape[0] < 10): # find more comps
        return process_one_pin(input_data, multiplier*1.25, 'All')
    else: # return best comps
        dist_weight = 1
        valuation_weight = 3
        
        cur_comps['dist_dist'] = ecdf(cur_comps.Distance)(cur_comps.Distance)
        cur_comps['val_dist'] = ecdf(cur_comps.CERTIFIED)(cur_comps.CERTIFIED)
        cur_comps['score'] = dist_weight * cur_comps['dist_dist'] + valuation_weight * cur_comps['val_dist']
        cur_comps = cur_comps.sort_values(by=['score'])
        if max_comps != 'All': #return all comps if 'All' else filter
            cur_comps = cur_comps.head(max_comps)

        targ = targ.round(2)
        cur_comps = cur_comps.round(2).drop(['dist_dist', 'val_dist'], axis=1)

        output = {}
        output['target_pin'] = new_targ.to_dict(orient='records')
        output['comparables'] = cur_comps.to_dict(orient='records') 

        return output

def submit_cook_sf(comp_submit, page_one_submit):
    '''
    Input:
    page_one_submit =
    {
        tbd
    }

    comps_submit = 
    {
        target_pin : [{char1:val1,...}],
        comparables : [{char1:val1,...},{char1:val1,...}] #selected comparables only
    }

    Info for autofiler:
    {
        'begin_appeal' : {'PIN':val},
        'filer': {'attorney_num' : val,
                  'attorney_email': val,
                  'owner_name': val,
                  'owner_address': val,
                  'owner_zip': val,
                  'owner_phone': val,
                  'owner_email': val},
        'attachments': {'appeal_narrative': file_loc,
                        'attorney_auth_form': file_loc,
                        'comparable_form': file_loc}

    }

    Output:
    {
        success: bool,
        contention_value: val,
        message: txt
    }
    '''
    print(page_one_submit)


    #generating attachments
    PIN = comp_submit['target_pin'][0]['PIN']
    file_pred = 'tmp_data/' + PIN 

    with open(file_pred + '_target.csv', 'w') as f:
        w =  csv.DictWriter(f, comp_submit['target_pin'][0].keys())
        w.writeheader()
        w.writerow(comp_submit['target_pin'][0])

    with open(file_pred + '_comps.csv', 'w') as f:
        w =  csv.DictWriter(f, comp_submit['comparables'][0].keys())
        w.writeheader()
        w.writerows(comp_submit['comparables'])

    Popen(['Rscript', '--vanilla', 'make_attachments_py.R', file_pred + '_target.csv', file_pred + '_comps.csv'], shell=False)

    #info for autofiler
    filer_info = {}

    begin_appeal = {}
    begin_appeal['PIN'] = '16052120090000'

    hypen_pin = PIN[0:2] + "-" + PIN[2:4] + "-" + PIN[4:7] + "-" + PIN[7:10] + "-" + PIN[10:] 

    filer = {}
    filer['attorney_num'] = '123456' #TMP
    filer['attorney_email'] = 'tmp@tmp.com' #TMP
    filer['owner_name'] = page_one_submit['name'] 
    filer['owner_address'] = page_one_submit['address']
    filer['owner_zip'] = page_one_submit['zip']
    filer['owner_phone'] = page_one_submit['phone']
    filer['owner_email'] = page_one_submit['email']

    attachments = {}
    attachments['appeal_narrative'] = 'tmp_data/' + PIN + '_narrative.pdf'
    attachments['attorney_auth_form'] = 'attorney.pdf' #TBD file does not exist
    attachments['comparable_form_alt'] = 'tmp_data/' + PIN + '_comps.pdf'
    attachments['comparable_form'] = "tmp_data/Comparable PINs for " + hypen_pin + ".csv"

    filer_info['begin_appeal'] = begin_appeal
    filer_info['filer'] = filer
    filer_info['attachments'] = attachments 

    ###
    # call run autofilier here
    # output = run_autofiler(filer_info)
    ####

    # autofilier sends email on success

    '''
    {
        success: bool,
        contention_value: val,
        message: txt
    }
    '''

    #dummy data
    output = {}

    output['success'] = 'true'
    output['contention_value'] = 12345
    output['message'] = 'appeal filed successfully'
    
    return output