import time
from flask import Flask, request
import pandas as pd
from cook import process_cook, submit_cook_sf
from detroit import process_detroit, generate_detroit_sf

#load data
cook_sf = pd.read_csv('../../cook county/data/cooksf.csv',
                     dtype={'PIN':str})

detroit_sf = pd.read_csv('../../detroit/data/detroit_sf.csv',
                        dtype={'zip_code':str})

app = Flask(__name__)

page1_data = {}

@app.route('/api_v1/submit', methods=['POST'])
def handle_form():
    #page 1 form
    print('page 1 submit')
    form_data = request.json

    response_dict = get_comps(form_data)
    global page1_data
    page1_data = form_data

    #finalize_appeal(form_data)

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
    if form_data['appeal_type'] == "detroit_single_family":
        data_json = process_detroit(form_data, detroit_sf, 10)
    elif form_data['appeal_type'] == "cook_county_single_family":
        data_json = process_cook(form_data, cook_sf, 10)
    else:
        data_json = {}

    return(data_json)


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
    response_dict = submit_cook_sf(form_data, page1_data)
    #response_dict = submit_cook_sf(process_cook(form_data, cook_sf, 5), page1_data)


    return {'request_status': time.time(),
    'response': response_dict}
