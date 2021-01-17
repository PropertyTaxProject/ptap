from datetime import datetime
import io
from docxtpl import DocxTemplate
import pandas as pd
from .email import detroit_submission_email
from .logging import record_final_submission
from .dataqueries import get_pin

def submit_cook_sf(comp_submit, mail):
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

    #rename cols
    t_df = t_df.rename(columns=rename_dict)
    comps_df = comps_df.rename(columns=rename_dict).drop(['score'], axis=1)

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

    output = {}

    #appeal narrative to file stream
    file_stream = io.BytesIO()
    doc.save(file_stream) # save to stream
    file_stream.seek(0) # reset pointer to head
    output['file_stream'] = file_stream

    #generate comps csv
    #hypen_pin = pin[0:2] + "-" + pin[2:4] + "-" + pin[4:7] + "-" + pin[7:10] + "-" + pin[10:]
    #comp_csv_name = "api/tmp_data/Comparable PINs for " + hypen_pin + ".csv"
    #comps_df.to_csv(comp_csv_name, index=False)

    return output

def submit_detroit_sf(comp_submit, mail):
    '''
    Output:
    Word Document
    '''
    download = False #boolean to turn download on/off

    rename_dict = {
        'PIN' : 'Parcel ID',
        'assessed_value' : 'Assessed Value',
        'total_acre' : 'Acres',
        'total_floorarea' : 'Floor Area',
        'total_sqft' : 'Square Footage (Abv. Ground)',
        'Age' : 'Year Built',
        'Exterior' : 'Exterior Material',
        'Distance' : 'Dist.',
        'Stories (not including basement)' : 'Number of Stories',
    }
    t_df = pd.DataFrame([comp_submit['target_pin']])
    comps_df = pd.DataFrame(comp_submit['comparables'])
    pin_av = t_df.assessed_value[0]
    pin = t_df.PIN[0]
    comps_avg = comps_df['Sale Price'].map(lambda x: float(x[1:].replace(',', ''))).mean()

    #rename cols
    t_df = t_df.rename(columns=rename_dict)
    comps_df = comps_df.rename(columns=rename_dict)

    #tbl cols
    target_cols = ['Baths', 'Square Footage (Abv. Ground)', 'Year Built', \
        'Exterior Material', 'Number of Stories']
    
    comp_cols = ['Address', 'Dist.', 'Sale Price', 'Sale Date'] + target_cols

    #generate docx
    output_name = 'api/tmp_data/' + pin + \
        ' Protest Letter Updated ' +  datetime.today().strftime('%m_%d_%y') + '.docx'
    comp_submit['output_name'] = output_name
    doc = DocxTemplate("api/template_files/detroit_template_2021.docx")

    allinfo = []
    propinfo = []
    skip_ls = ['target_pin', 'comparables', 'output_name']
    for key, val in comp_submit.items():
        if key not in skip_ls:
            allinfo.append([key, val])

    for i, j in get_pin('detroit', pin).to_dict(orient='records')[0].items():
        propinfo.append([i, j])

    context = {
        'pin' : pin,
        'owner' : comp_submit['name'],
        'address' : comp_submit['address'],
        'formal_owner' : comp_submit['name'],
        'current_sev' : '{:,.0f}'.format(pin_av),
        'current_faircash' : '${:,.0f}'.format(pin_av * 2),
        'contention_sev' : '{:,.0f}'.format(comps_avg / 2),
        'contention_faircash' : '${:,.0f}'.format(comps_avg),
        'target_labels' : ['Beds'] + target_cols,
        'target_contents' : [['XXX'] + t_df[target_cols].to_numpy().tolist()[0]],
        'comp_labels' : comp_cols,
        'comp_contents' : comps_df[comp_cols].to_numpy().tolist(),
        'allinfo' : allinfo,
        'propinfo' : propinfo
            }
        
    doc.render(context)
    doc.save(output_name)

    output = {}
    if download:
        # also save a byte object to return
        file_stream = io.BytesIO()
        doc.save(file_stream) # save to stream
        file_stream.seek(0) # reset pointer to head
        output['file_stream'] = file_stream

    # update submission log
    targ = get_pin('detroit', pin)
    
    if comp_submit['validcharacteristics'] == 'No':
        c_flag = 'Yes. Homeowner Input: ' + comp_submit['characteristicsinput']
    else:
        c_flag = 'No'

    sub_dict = {
        'Client Name' : comp_submit['name'],
        'Address' : comp_submit['address'],
        'Taxpayer of Record' : targ['taxpayer_1'].to_string(index=False),
        'PIN' : pin,
        'Phone Number' : comp_submit['phone'],
        'Email Address' : comp_submit['email'],
        'Preferred Contact Method' : comp_submit['preferred'],
        'PRE' : targ['homestead_'].to_string(index=False),
        'Eligibility Flag' : comp_submit['eligibility'],
        'Characteristics Flag': c_flag,
        'SEV' : str(pin_av),
        'TV' : targ['taxable_va'].to_string(index=False),
        'CV' : str(comps_avg)
    }

    log_url = record_final_submission(sub_dict)
    comp_submit['log_url'] = log_url

    # send email
    detroit_submission_email(mail, comp_submit)

    return output
