import string
from fuzzywuzzy import process
from .computils import prettify_detroit, prettify_cook, find_comps
from .dataqueries import address_candidates_query, get_pin, ecdf
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
        max_comps = 9
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
    dist_weight = 1
    valuation_weight = 3

    cur_comps['dist_dist'] = ecdf(cur_comps.Distance)(cur_comps.Distance)
    cur_comps['val_dist'] = ecdf(cur_comps.assessed_value)(cur_comps.assessed_value)
    cur_comps['score'] = dist_weight * cur_comps['dist_dist'] + \
        valuation_weight * cur_comps['val_dist']
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

    if comp_submit['appeal_type'] == "detroit_single_family":
        return submit_detroit_sf(comp_submit, mail)

    elif comp_submit['appeal_type'] == "cook_county_single_family":
        return submit_cook_sf(comp_submit), mail
