from computils import filter_on, ecdf
from subprocess import Popen
import csv


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

def process_detroit(input_data, detroit_sf, max_comps, multiplier=1):
    #example pin '14010903.'

    target_pin = input_data['pin']
    targ = detroit_sf[detroit_sf['parcel_num'] == target_pin].copy(deep=True)
    targ['Distance'] = 0

    new_targ, cur_comps = comps_detroit_sf(targ, detroit_sf, multiplier)
    
    if(multiplier > 3): #no comps found with parameters stop search
        return ''
    elif(cur_comps.shape[0] < 10): # find more comps
        return process_detroit(input_data, multiplier*1.25, 'All')
    else: # return best comps
        dist_weight = 1
        valuation_weight = 3
        cur_comps['dist_dist'] = ecdf(cur_comps.Distance)(cur_comps.Distance)
        cur_comps['val_dist'] = ecdf(cur_comps.assessed_v)(cur_comps.assessed_v)
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

def generate_detroit_sf(comp_submit, page_one_submit):
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
    attachments['comparable_form_alt'] = 'tmp_data/' + PIN + '_comps.pdf' #keeping this for now, but likely will delete later
    attachments['comparable_form'] = "tmp_data/Comparable PINs for " + hypen_pin + ".csv" #submit this to form

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