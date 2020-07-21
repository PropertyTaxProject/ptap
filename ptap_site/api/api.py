import time
from flask import Flask, request
import pandas as pd
import mainfct

#load data
cook_sf = pd.read_csv('../../cook county/data/cooksf.csv',
                     dtype={'PIN':str})

detroit_sf = pd.read_csv('../../detroit/data/detroit_sf.csv',
                        dtype={'zip_code':str})


#cook example pin '16052120090000'
#detroit example pin '14010903.'

app = Flask(__name__)

page1_data = {}

@app.route('/api_v1/submit', methods=['POST'])
def handle_form():
    #page 1 form
    print('page 1 submit')
    global page1_data
    page1_data = request.json
    response_dict = get_comps(page1_data)

    return {'request_status': time.time(),
    'response': response_dict}


@app.route('/api_v1/submit2', methods=['POST'])
def handle_form2():
    #page 2 form
    print('page 2 submit')
    form_data = request.json

    response_dict = finalize_appeal(form_data)

    return {'request_status': time.time(),
    'response': response_dict}


def get_comps(form_data):
    """     
    Output:
    {
        target_pin : [{char1:val1,...}],
        comparables : [{char1:val1,...},{char1:val1,...}] #sorted by best to worst
    }
    """
    data_dict = {}
    data_dict['cook_sf'] = cook_sf
    data_dict['detroit_sf'] = detroit_sf

    #tmp = mainfct.process_input(form_data, data_dict)
    #mainfct.process_comps_input(tmp, page1_data)

    return mainfct.process_input(form_data, data_dict)

def finalize_appeal(form_data):
    '''
    Input:
    {
        target_pin : [{char1:val1,...}],
        comparables : [{char1:val1,...},{char1:val1,...}] #selected comparables only
    }
    Output:
    {
        success: bool,
        contention_value: val,
        message: txt
    }
    '''
    return mainfct.process_comps_input(form_data, page1_data)
