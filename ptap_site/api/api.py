import time
from flask import Flask, request, jsonify, send_file
import pandas as pd
from .mainfct import process_comps_input, process_input
from flask_cors import CORS

#load data
cook_sf = pd.read_csv('cook county/data/cooksf.csv',
                     dtype={'PIN':str})

detroit_sf = pd.read_csv('detroit/data/detroit_sf.csv',
                        dtype={'zip_code':str})


#cook example pin '16052120090000'
#detroit example pin '14010903.'

app = Flask(__name__)
CORS(app)

@app.route('/api_v1/submit', methods=['POST'])
def handle_form():
    #page 1 form
    print('page 1 submit')
    page1_data = request.json
    print('PAGE DATA', request.json)
    print('REQUEST OBJECT', request)
    try:
        response_dict = get_comps(page1_data)
        resp = jsonify({'request_status': time.time(),
        'response': response_dict})
    except Exception as e:
        resp = jsonify({'error': str(e)})
        print(e)

    # resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp



@app.route('/api_v1/submit2', methods=['POST'])
def handle_form2():
    #page 2 form
    print('page 2 submit')
    form_data = request.json

    response_dict = finalize_appeal(form_data)

    if (form_data['appeal_type'] == "detroit_single_family"):
        return send_file(response_dict['file_stream'], as_attachment=True, attachment_filename='%s-appeal.docx' % form_data['name'].lower().replace(' ', '-'))

    resp = jsonify({'request_status': time.time(),
    'response': response_dict})

    return resp


def get_comps(form_data):
    """     
    Output:
    {
        target_pin : [{char1:val1,...}],
        comparables : [{char1:val1,...},{char1:val1,...}] #sorted by best to worst
        labeled_headers : [h1, h2, ...] #headers sorted in display order
        prop_info: 'str' #a string of info to display
    }
    """
    data_dict = {}
    data_dict['cook_sf'] = cook_sf
    data_dict['detroit_sf'] = detroit_sf

    return process_input(form_data, data_dict)

def finalize_appeal(form_data):
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
       
    Output:
    {
        success: bool,
        contention_value: val,
        message: txt
    }
    '''
    print("~~~~~~~~~")
    print(form_data)
    print("~~~~~~~~~")

    return process_comps_input(form_data)
