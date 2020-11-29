import pickle
from datetime import datetime
import io
from docxtpl import DocxTemplate
import pandas as pd
from .email import detroit_submission_email
from .logging import record_final_submission

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
    comp_submit['output_name'] = output_name
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

    # also save a byte object to return
    file_stream = io.BytesIO()
    doc.save(file_stream) # save to stream
    file_stream.seek(0) # reset pointer to head
    output['file_stream'] = file_stream

    # update submission log
    log_url = record_final_submission()
    comp_submit['log_url'] = log_url

    # send email
    detroit_submission_email(mail, comp_submit)

    return output
