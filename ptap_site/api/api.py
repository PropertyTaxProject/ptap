import time
from flask import Flask, request
import pandas as pd
from cook_sf import process_one_pin, submit_cook_sf

#load data
cook_sf = pd.read_csv('../../cook county/data/cooksf.csv',
                     dtype={'PIN':str})

app = Flask(__name__)

tmp_data = {}

@app.route('/api_v1/submit', methods=['POST'])
def handle_form():
    #page 1 form
    form_data = request.json

    response_dict = get_comps(form_data)
    global tmp_data
    tmp_data = form_data

    return {'request_status': time.time(),
    'response': response_dict}


@app.route('/api_v1/submit2', methods=['POST'])
def handle_form2():
    #page 2 form
    form_data = request.json

    response_dict = finalize_appeal(form_data)

    return {'request_status': time.time(),
    'response': response_dict}


def get_comps(form_data):

    # for now, input only as pin 
    # for now, let's do cook sf only
    # eventually we will need to determine if a pin/address is cook sf, cook condos, detroit

    """     
    Output:
    {
        target_pin : [{char1:val1,...}],
        comparables : [{char1:val1,...},{char1:val1,...}] #sorted by best to worst
    }
    """
    data_json = process_one_pin(form_data, cook_sf, 25)

    return(data_json)


def finalize_appeal(form_data):
    # convert form input to filed appeal
    # for now, let's do cook sf only
    # eventually we will need to deal with cook sf, cook condos, detroit
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
    response_dict = submit_cook_sf(form_data, tmp_data)

    return {'request_status': time.time(),
    'response': response_dict}
