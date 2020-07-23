import pandas as pd
import pickle
from docxtpl import DocxTemplate
from datetime import datetime
from computils import comps_cook_sf, comps_detroit_sf, ecdf


def process_input(input_data, data_dict, multiplier=1):
    target_pin = input_data['pin']

    if input_data['appeal_type'] == "detroit_single_family":
        data = data_dict['detroit_sf']
        max_comps = 9
        targ = data[data['parcel_num'] == target_pin].copy(deep=True)
        targ['Distance'] = 0
        new_targ, cur_comps = comps_detroit_sf(targ, data, multiplier)

    elif input_data['appeal_type'] == "cook_county_single_family":
        data = data_dict['cook_sf']
        max_comps = 9
        targ = data[data['PIN'] == target_pin].copy(deep=True)
        targ['Distance'] = 0
        new_targ, cur_comps = comps_cook_sf(targ, data, multiplier)

    if(multiplier > 3): #no comps found with parameters stop search
        return ''
    elif(cur_comps.shape[0] < 10): # find more comps
        return process_input(input_data, data_dict, multiplier*1.25)
    else: # return best comps
        dist_weight = 1
        valuation_weight = 3
        
        cur_comps['dist_dist'] = ecdf(cur_comps.Distance)(cur_comps.Distance)
        cur_comps['val_dist'] = ecdf(cur_comps.assessed_value)(cur_comps.assessed_value)
        cur_comps['score'] = dist_weight * cur_comps['dist_dist'] + valuation_weight * cur_comps['val_dist']
        cur_comps = cur_comps.sort_values(by=['score'])
        cur_comps = cur_comps.head(max_comps)

        targ = targ.round(2)
        cur_comps = cur_comps.round(2).drop(['dist_dist', 'val_dist'], axis=1)

        output = {}
        output['target_pin'] = new_targ.to_dict(orient='records')
        output['comparables'] = cur_comps.to_dict(orient='records') 

        return output


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
        'zip': ''
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
    t_dict = comp_submit['target_pin'][0]
    comps_df = pd.DataFrame(comp_submit['comparables'])
    pin_av = t_dict['assessed_value']
    comps_avg = comps_df.assessed_value.mean()
    PIN = t_dict['PIN']
    hypen_pin = PIN[0:2] + "-" + PIN[2:4] + "-" + PIN[4:7] + "-" + PIN[7:10] + "-" + PIN[10:] 
    comp_csv_name = "tmp_data/Comparable PINs for " + hypen_pin + ".csv"

    #generate comps csv
    comps_df.to_csv(comp_csv_name)

    #generate appeal narrative
    output_name = 'tmp_data/' + t_dict['PIN'] + ' Appeal Narrative.docx'

    doc = DocxTemplate("cook_template.docx")
    context = {
        'pin' : t_dict['PIN'],
        'target_av' : '${:,.2f}'.format(pin_av),
        'comp_av' : '${:,.2f}'.format(comps_avg),
        'target_labels' : list(t_dict.keys()),
        'target_contents' : [list(t_dict.values())],
        'comp_labels' : list(comps_df.columns),
        'comp_contents' : comps_df.to_numpy().tolist()
            }
    doc.render(context)
    doc.save(output_name)


    #info for autofiler
    filer_info = {}

    begin_appeal = {}
    begin_appeal['PIN'] = PIN

    filer = {}
    filer['attorney_num'] = '123456' #TMP
    filer['attorney_email'] = 'tmp@tmp.com' #TMP
    filer['owner_name'] = comp_submit['name'] 
    filer['owner_address'] = comp_submit['address']
    filer['owner_zip'] = comp_submit['zip']
    filer['owner_phone'] = comp_submit['phone']
    filer['owner_email'] = comp_submit['email']

    attachments = {}
    attachments['appeal_narrative'] = 'tmp_data/' + PIN + '_narrative.pdf'
    attachments['attorney_auth_form'] = 'attorney.pdf' #TBD file does not exist
    attachments['comparable_form'] = comp_csv_name  #submit this to form

    filer_info['begin_appeal'] = begin_appeal
    filer_info['filer'] = filer
    filer_info['attachments'] = attachments 

    #save autofiler info to pickle
    with open('tmp_data/' + PIN + '.pickle', 'wb') as handle:
        pickle.dump(filer_info, handle, protocol=pickle.HIGHEST_PROTOCOL)

    output = {}

    output['success'] = 'true'
    output['contention_value'] = '${:,.2f}'.format(comps_avg / 2)
    output['message'] = 'appeal filed successfully'
    
    return output

def generate_detroit_sf(comp_submit):
    '''
    Output:
    Word Document
    '''
    t_dict = comp_submit['target_pin'][0]
    comps_df = pd.DataFrame(comp_submit['comparables'])
    pin_av = t_dict['assessed_value']
    comps_avg = comps_df.assessed_value.mean()
    output_name = 'tmp_data/' + t_dict['PIN'] + ' Protest Letter Updated ' +  datetime.today().strftime('%m_%d_%y') + '.docx'

    doc = DocxTemplate("detroit_template.docx")
    context = {
        'pin' : t_dict['PIN'],
        'owner' : comp_submit['name'],
        'address' : comp_submit['address'],
        'formal_owner' : comp_submit['name'],
        'current_sev' : '${:,.2f}'.format(pin_av / 2),
        'current_faircash' : '${:,.2f}'.format(pin_av),
        'contention_sev' : '${:,.2f}'.format(comps_avg / 2),
        'contention_faircash' : '${:,.2f}'.format(comps_avg),
        'target_labels' : list(t_dict.keys()),
        'target_contents' : [list(t_dict.values())],
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
    
    return output