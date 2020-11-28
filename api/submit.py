import pickle
from datetime import datetime
import io
from docxtpl import DocxTemplate
import pandas as pd

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

    doc = DocxTemplate("api/template_files/cook_template.docx")
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

def submit_detroit_sf(comp_submit):
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
    output_name = 'api/tmp_data/' + pin + \
        ' Protest Letter Updated ' +  datetime.today().strftime('%m_%d_%y') + '.docx'
    doc = DocxTemplate("api/template_files/detroit_template.docx")

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
