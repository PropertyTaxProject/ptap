import pandas as pd
import pickle
import time
from docxtpl import DocxTemplate
from datetime import datetime
from fuzzywuzzy import process
import io
import os
from .computils import comps_cook_sf, comps_detroit_sf, ecdf, prettify_detroit, prettify_cook

def address_candidates(input_data, data_dict, cutoff_info):
    output = {}
    st_num = input_data['st_num']
    st_name = input_data['st_name']
    
    if input_data['appeal_type'] == "detroit_single_family":
        mini = data_dict['detroit_sf']
        cutoff = cutoff_info['detroit']

    elif input_data['appeal_type'] == "cook_county_single_family":
        mini = data_dict['cook_sf']
        cutoff = cutoff_info['cook']
    
    mini = mini[mini['st_num'] == st_num]
    candidate_matches = process.extractBests(st_name, mini.st_name, score_cutoff=50)    
    selected = mini[mini['st_name'].isin([i for i, _, _ in candidate_matches])].copy()
    selected['Distance'] = 0

    if input_data['appeal_type'] == "detroit_single_family":
        selected = prettify_detroit(selected, False)
    elif input_data['appeal_type'] == "cook_county_single_family":
        selected = prettify_cook(selected, False)

    selected['eligible'] = selected.assessed_value <= cutoff
    output['candidates'] = selected.to_dict(orient='records')

    if len(output['candidates']) == 0: #if none found raise
        raise Exception('No Matches Found')

    return output

def process_input(input_data, data_dict, multiplier=1, sales_comps=False):
    target_pin = input_data['pin']

    if input_data['appeal_type'] == "detroit_single_family":
        data = data_dict['detroit_sf']
        max_comps = 9
        sales_comps = True
        targ = data[data['parcel_num'] == target_pin].copy(deep=True)
        if targ.empty:
            raise Exception('Invalid PIN')
        targ['Distance'] = 0
        try:
            new_targ, cur_comps = comps_detroit_sf(targ, data, multiplier, sales_comps)
        except:
            print('Error Finding Comparables')
        prop_info = 'Taxpayer of Record: ' + targ['taxpayer_1'].to_string(index=False) + '\nCurrent Homestead Status: ' + targ['homestead_'].to_string(index=False)
    elif input_data['appeal_type'] == "cook_county_single_family":
        data = data_dict['cook_sf']
        max_comps = 9
        targ = data[data['PIN'] == target_pin].copy(deep=True)
        if targ.empty:
            raise Exception('Invalid PIN')
        targ['Distance'] = 0
        try:
            new_targ, cur_comps = comps_cook_sf(targ, data, multiplier, sales_comps)
        except:
            print('Error Finding Comparables')
        prop_info = ''

    if(multiplier > 8): #no comps found within maximum search area---hault
        raise Exception('Comparables not found with given search')
    elif(cur_comps.shape[0] < 10): #find more comps
        return process_input(input_data, data_dict, multiplier*1.25, sales_comps)
    else: # return best comps
        try:
            dist_weight = 1
            valuation_weight = 3
            
            cur_comps['dist_dist'] = ecdf(cur_comps.Distance)(cur_comps.Distance)
            cur_comps['val_dist'] = ecdf(cur_comps.assessed_value)(cur_comps.assessed_value)
            cur_comps['score'] = dist_weight * cur_comps['dist_dist'] + valuation_weight * cur_comps['val_dist']
            cur_comps = cur_comps.sort_values(by=['score'])
            cur_comps = cur_comps.head(max_comps)

            new_targ = new_targ.round(2)
            cur_comps = cur_comps.round(2).drop(['dist_dist', 'val_dist'], axis=1)

            output = {}
            new_targ = new_targ.fillna('')
            cur_comps = cur_comps.fillna('')

            output['target_pin'] = new_targ.to_dict(orient='records')
            output['comparables'] = cur_comps.to_dict(orient='records') 
            output['labeled_headers'] = cur_comps.columns.tolist()
            output['prop_info'] = prop_info
            output['pinav'] = new_targ.assessed_value.mean()

            return output

        except:
            print('Error Producing Comps Output')


def process_comps_input(comp_submit):
    '''
    Input:
    {
        'target_pin': [{}],
        'comparables': [{},{},{},{}]
        'appeal_type': '', 
        'pin': '', 
        'name': '', 
        'email': '', 
        'address': '', 
        'phone': '', 
        'city': '', 
        'state': '', 
        'zip': '',
        'preferred': ''
    }
    '''

    if comp_submit['appeal_type'] == "detroit_single_family":
        return generate_detroit_sf(comp_submit)

    elif comp_submit['appeal_type'] == "cook_county_single_family":
        return submit_cook_sf(comp_submit)
    


def submit_cook_sf(comp_submit):
    '''
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
    rename_dict = {
        'PIN' : 'Pin',
        'assessed_value' : 'Assessed Value',
        'building_sqft' : 'Building',
        'land_sqft' : 'Land',
    }

    t_df = pd.DataFrame([comp_submit['target_pin']])
    comps_df = pd.DataFrame(comp_submit['comparables'])
    pin_av = t_df.assessed_value[0]
    comps_avg = comps_df.assessed_value.mean()
    pin = t_df.PIN[0]
    hypen_pin = pin[0:2] + "-" + pin[2:4] + "-" + pin[4:7] + "-" + pin[7:10] + "-" + pin[10:] 
    comp_csv_name = "api/tmp_data/Comparable PINs for " + hypen_pin + ".csv"

    #rename cols
    t_df = t_df.rename(columns=rename_dict)
    comps_df = comps_df.rename(columns=rename_dict).drop(['score'], axis=1)

    #generate comps csv
    comps_df.to_csv(comp_csv_name, index=False)

    #generate appeal narrative
    output_name = 'api/tmp_data/' + pin + ' Appeal Narrative.docx'

    doc = DocxTemplate("api/cook_template.docx")
    context = {
        'pin' : pin,
        'target_av' : '${:,.2f}'.format(pin_av),
        'comp_av' : '${:,.2f}'.format(comps_avg),
        'target_labels' : list(t_df.columns),
        'target_contents' : t_df.to_numpy().tolist(),
        'comp_labels' : list(comps_df.columns),
        'comp_contents' : comps_df.to_numpy().tolist()
            }
    doc.render(context)
    doc.save(output_name)

    #info for autofiler
    filer_info = {}

    begin_appeal = {}
    begin_appeal['PIN'] = pin

    filer = {}
    filer['attorney_num'] = '123456' #TMP
    filer['attorney_email'] = 'tmp@tmp.com' #TMP
    filer['owner_name'] = comp_submit['name'] 
    filer['owner_address'] = comp_submit['address']
    filer['owner_zip'] = comp_submit['zip']
    filer['owner_phone'] = comp_submit['phone']
    filer['owner_email'] = comp_submit['email']

    attachments = {}
    attachments['appeal_narrative'] = output_name
    attachments['attorney_auth_form'] = 'attorney.pdf' #TBD file does not exist
    attachments['comparable_form'] = comp_csv_name  #submit this to form

    filer_info['begin_appeal'] = begin_appeal
    filer_info['filer'] = filer
    filer_info['attachments'] = attachments 

    #save autofiler info to pickle
    with open('api/tmp_data/' + pin + '.pickle', 'wb') as handle:
        pickle.dump(filer_info, handle, protocol=pickle.HIGHEST_PROTOCOL)

    output = {}

    output['success'] = 'true'
    output['contention_value'] = '${:,.2f}'.format(comps_avg / 2)
    output['message'] = 'appeal filed successfully'

    # also save a byte object to return
    file_stream = io.BytesIO()
    doc.save(file_stream) # save to stream
    file_stream.seek(0) # reset pointer to head
    output['file_stream'] = file_stream
    
    return output

def generate_detroit_sf(comp_submit):
    '''
    Output:
    Word Document
    '''
    rename_dict = {
        'PIN' : 'Parcel ID',
        'assessed_value' : 'Assessed Value',
        'total_acre' : 'Acres',
        'total_floorarea' : 'Floor Area',
        'total_sqft' : 'SqFt'
    }
    t_df = pd.DataFrame([comp_submit['target_pin']])
    comps_df = pd.DataFrame(comp_submit['comparables'])
    pin_av = t_df.assessed_value[0]
    pin = t_df.PIN[0]
    comps_avg = comps_df.assessed_value.mean()

    #rename cols
    t_df = t_df.rename(columns=rename_dict)
    comps_df = comps_df.rename(columns=rename_dict).drop(['score'], axis=1)

    #generate docx
    output_name = 'api/tmp_data/' + pin + ' Protest Letter Updated ' +  datetime.today().strftime('%m_%d_%y') + '.docx'
    doc = DocxTemplate("api/detroit_template.docx")

    context = {
        'pin' : pin,
        'owner' : comp_submit['name'],
        'address' : comp_submit['address'],
        'formal_owner' : comp_submit['name'],
        'current_sev' : '${:,.2f}'.format(pin_av / 2),
        'current_faircash' : '${:,.2f}'.format(pin_av),
        'contention_sev' : '${:,.2f}'.format(comps_avg / 2),
        'contention_faircash' : '${:,.2f}'.format(comps_avg),
        'target_labels' : list(t_df.columns),
        'target_contents' : t_df.to_numpy().tolist(),
        'comp_labels' : list(comps_df.columns),
        'comp_contents' : comps_df.to_numpy().tolist()
            }

    doc.render(context)
    doc.save(output_name)
    
    output = {}

    output['success'] = 'true' #add error handling
    output['contention_value'] = '${:,.2f}'.format(comps_avg / 2)
    output['message'] = 'appeal filed successfully' #add error handling
    output['file_loc'] = output_name
    
    # also save a byte object to return
    file_stream = io.BytesIO()
    doc.save(file_stream) # save to stream
    file_stream.seek(0) # reset pointer to head
    output['file_stream'] = file_stream

    return output

def record_log(uuid_val, process_step_id, exception, form_data):
    new = {}
    new['uuid'] = uuid_val
    new['process_step_id'] = process_step_id,
    new['exception'] = exception
    new['time'] = time.time()

    tmp = pd.DataFrame.from_dict(new)
    tmp = pd.concat([tmp, pd.json_normalize(form_data).drop('uuid', axis=1, errors='ignore')], axis=1)
    p = 'tmp_log.csv'

    tmp.to_csv(p, index=False, mode='a')#, header=not os.path.exists(p))

    if exception:
        print(tmp.T)