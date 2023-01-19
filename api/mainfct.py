import string
import pandas as pd
from datetime import datetime
import io
import os
from docxtpl import DocxTemplate
from fuzzywuzzy import process
from .computils import prettify_detroit, prettify_cook, find_comps
from .dataqueries import address_candidates_query, get_pin, ecdf, avg_ecf
from .submitappeal import submit_cook_sf, submit_detroit_sf

def address_candidates(input_data, cutoff_info):
    """
    Returns address candidates
    """
    output = {}
    st_num = input_data['st_num']
    st_name = input_data['st_name']

    if input_data['appeal_type'] == "detroit_single_family":
        cutoff = cutoff_info['detroit']
        region = 'detroit'

    elif input_data['appeal_type'] == "cook_county_single_family":
        cutoff = cutoff_info['cook']
        region = 'cook'

    mini = address_candidates_query(region, st_num)
    candidate_matches = process.extractBests(st_name, mini.st_name, score_cutoff=50)
    selected = mini[mini['st_name'].isin([i for i, _, _ in candidate_matches])].copy()
    selected['Distance'] = 0

    if input_data['appeal_type'] == "detroit_single_family":
        selected = prettify_detroit(selected, False)
    elif input_data['appeal_type'] == "cook_county_single_family":
        selected = prettify_cook(selected, False)

    selected['eligible'] = selected.assessed_value <= cutoff
    selected.dropna(axis=0, inplace=True)
    output['candidates'] = selected.to_dict(orient='records')

    if len(output['candidates']) == 0: #if none found raise
        raise Exception('No Matches Found')
    return output

def comparables(input_data, sales_comps=False):
    """
    Returns comparables
    """
    target_pin = input_data['pin']

    #set constants
    if input_data['appeal_type'] == "detroit_single_family":
        max_comps = 7
        sales_comps = True
        region = 'detroit'
        targ = get_pin(region, target_pin)
        if targ.empty:
            raise Exception('Invalid PIN')
        targ['Distance'] = 0
        partone = 'Taxpayer of Record: ' + targ['taxpayer_1'].to_string(index=False) + '.'
        partone = string.capwords(partone)
        parttwo = ' Current Principal Residence Exemption (PRE)  Exemption Status: ' + targ['homestead_'].to_string(index=False) + '%.'
        prop_info = partone + parttwo
    elif input_data['appeal_type'] == "cook_county_single_family":
        max_comps = 9
        sales_comps = False
        region = 'cook'
        targ = get_pin(region, target_pin)
        if targ.empty:
            raise Exception('Invalid PIN')
        targ['Distance'] = 0
        prop_info = ''

    #call comp funtion
    new_targ, cur_comps = find_comps(targ, region, sales_comps)

    #process comps

    ##add weights based on Cook PINS AA-SS-BBB-PPP-UUUU
    ##pos 7 high
    ##6 medium
    ##5 low

    dist_weight = 1
    valuation_weight = 3

    cur_comps['dist_dist'] = ecdf(cur_comps.Distance)(cur_comps.Distance, True)
    cur_comps['val_dist'] = ecdf(cur_comps.assessed_value)(cur_comps.assessed_value, True)
    cur_comps['score'] = dist_weight * cur_comps['dist_dist'] + \
        valuation_weight * cur_comps['val_dist']

    if input_data['appeal_type'] == "detroit_single_family": #neighborhood bonus
        cur_comps['neigborhoodmatch'] = cur_comps['Neighborhood'] == targ['Neighborhood'].values[0]
        cur_comps['neigborhoodmatch'] = cur_comps['neigborhoodmatch'].astype(int)
        cur_comps['score'] = cur_comps['score'] + 1 * cur_comps['neigborhoodmatch']
        cur_comps = cur_comps.drop(['neigborhoodmatch'], axis=1)

    cur_comps = cur_comps.sort_values(by=['score'], ascending=False)
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

def process_estimate(form_data, download):
    '''
    {
        'target_pin': [{}],
        'comparablesPool': [{},{},{},{}]
        'uuid': '',
        'selectedComparables': [{}]
    }
    '''

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
    

    t_df = pd.DataFrame([form_data['target_pin']])
    c_df = pd.DataFrame(form_data['selectedComparables'])
    comps_df = pd.DataFrame(form_data['comparablesPool'])
    pin_av = t_df.assessed_value[0]
    comp_av = c_df.assessed_value[0]
    pin = t_df.PIN[0]
    comps_avg = c_df['Sale Price'].map(lambda x: float(x[1:].replace(',', '')))[0] * (1 + (pin_av - comp_av) / pin_av)

    #rename cols
    t_df = t_df.rename(columns=rename_dict)
    c_df = c_df.rename(columns=rename_dict)
    comps_df = comps_df.rename(columns=rename_dict)

    #tbl cols
    target_cols = ['Baths', 'Square Footage (Abv. Ground)', 'Year Built', \
        'Exterior Material', 'Number of Stories', 'Neighborhood']
    
    comp_cols = ['Address', 'Dist.', 'Sale Price', 'Sale Date'] + target_cols
    output = {}


    #generate docx
    if download:
        output_name = 'api/tmp_data/' + pin + \
            datetime.today().strftime('%m_%d_%y') + '.docx'

        doc = DocxTemplate("api/template_files/detroit_template_2023.docx")

        context = {
            'pin' : pin,
            'address' : t_df.Address[0],
            'comp_address' : c_df.Address[0],
            'comp_sale' : c_df['Sale Price'][0],
            'comp_date' : c_df['Sale Date'][0],
            'current_sev' : '{:,.0f}'.format(pin_av),
            'current_faircash' : '${:,.0f}'.format(pin_av * 2),
            'contention_sev' : '{:,.0f}'.format(comps_avg / 2),
            'contention_faircash' : '${:,.0f}'.format(comps_avg),
            'target_labels' : target_cols,
            'target_contents' : [t_df[target_cols].to_numpy().tolist()[0]],
            'target_contents2' : [c_df[target_cols].to_numpy().tolist()[0]],
            'comp_labels' : comp_cols,
            'comp_contents' : comps_df[comp_cols].to_numpy().tolist(),
            }

        doc.render(context)
        doc.save(output_name)

        # also save a byte object to return
        file_stream = io.BytesIO()
        doc.save(file_stream) # save to stream
        file_stream.seek(0) # reset pointer to head
        output['file_stream'] = file_stream
        output['output_name'] = output_name
    else:
        #serve information for website display
        delta = (comps_avg / 2) - pin_av
        d_str = '{:,.0f}'.format(abs(delta))
        tax_bill = .06*delta
        tax_str = '{:,.0f}'.format(abs(tax_bill))

        if delta < 0:
            d_str2 = " less" #overassessed
        else:
            d_str2 = " greater" #underassessed

        l1 = "Michigan law requires that property assessments be no more than 50 percent of a property's value. "
        l2 = "In 2022, the City assessed your home at " + '{:,.0f}'.format(pin_av) + ". "
        l3 = "A more accurate assessment would be " + '{:,.0f}'.format(comps_avg / 2) + ","
        l4 = " which is " + d_str + d_str2 + " than the City's current assessment. Based on estimated current tax rates, "
        l5 = "if the City correctly assessed your property your tax bill would be about $" + tax_str + d_str2 + ". "
        
        output['estimate'] = l1 + l2 + l3 + l4 + l5

    return output


def process_comps_input(comp_submit, mail):
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
    #add property info to allinfo
    if comp_submit['appeal_type'] == "detroit_single_family":
        return submit_detroit_sf(comp_submit, mail)

    elif comp_submit['appeal_type'] == "cook_county_single_family":
        return submit_cook_sf(comp_submit, mail)
