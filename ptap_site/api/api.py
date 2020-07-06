import time
from flask import Flask, request
import pandas as pd

from cook_sf import process_one_pin #module

#load data
cook_sf = pd.read_csv('../../cook county/data/cooksf.csv',
                     dtype={'PIN':str})

app = Flask(__name__)

@app.route('/api_v1/submit', methods=['POST'])
def handle_form():
    form_data = request.json # this is the data submitted by the form

    response_dict = get_comps(form_data) # this is the data to send back

    return {'request_status': time.time(),
    'response': response_dict}


def get_comps(form_data):

    # for now, input only as pin 
    # for now, let's do cook sf only
    # eventually we will need to determine if a pin/address is cook sf, cook condos, detroit

    # response format
    """     
    {
        target_pin : [{char1:val1,...}],
        comparables : [{char1:val1,...},{char1:val1,...}] #sorted by best to worst
    }
    """
    data_json = process_one_pin(form_data, cook_sf)
    #print(data_json)

    return(data_json)


