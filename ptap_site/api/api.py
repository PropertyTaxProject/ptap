import time
from flask import Flask, request, jsonify, send_file
import pandas as pd
import uuid
from .mainfct import process_comps_input, process_input, address_candidates, record_log
from flask_cors import CORS

#load data
cook_sf = pd.concat([pd.read_csv('cook county/data/cooksf1.csv', dtype={'PIN':str}), 
                     pd.read_csv('cook county/data/cooksf2.csv', dtype={'PIN':str})])
               
detroit_sf = pd.read_csv('detroit/data/detroit_sf.csv')


#cook example pin '16052120090000'
#detroit example pin '14010903.'

app = Flask(__name__)
CORS(app)


@app.route('/api_v1/pin-lookup', methods=['POST'])
def handle_form0():
    #page 0 form find pin from address
    print('page 0 submit')
    page0_data = request.json
    print('PAGE DATA', request.json)
    print('REQUEST OBJECT', request)
    try:
        response_dict = get_pin(page0_data)
        response_dict['uuid'] = logger(page0_data, 'address_finder')
        resp = jsonify({'request_status': time.time(),
        'response': response_dict})
    except Exception as e:
        resp = jsonify({'error': str(e)})
        logger(page0_data, 'address_finder', e)

    return resp

@app.route('/api_v1/submit', methods=['POST'])
def handle_form():
    #page 1 form
    print('page 1 submit')
    page1_data = request.json
    print('PAGE DATA', request.json)
    print('REQUEST OBJECT', request)
    try:
        response_dict = get_comps(page1_data)
        logger(page1_data, 'get_comps')
        resp = jsonify({'request_status': time.time(),
        'response': response_dict})
    except Exception as e:
        resp = jsonify({'error': str(e)})
        logger(page1_data, 'get_comps', e)

    return resp



@app.route('/api_v1/submit2', methods=['POST'])
def handle_form2():
    #page 2 form
    print('page 2 submit')
    form_data = request.json
    try:
        response_dict = finalize_appeal(form_data)
        logger(form_data, 'submit')

        if (form_data['appeal_type'] == "detroit_single_family"):
            return send_file(response_dict['file_stream'], as_attachment=True, attachment_filename='%s-appeal.docx' % form_data['name'].lower().replace(' ', '-'))

        resp = jsonify({'request_status': time.time(),
        'response': response_dict})
    except Exception as e:
        resp = jsonify({'error': str(e)})
        logger(form_data, 'submit', e)

    return resp


def logger(form_data, process_step_id, exception=''):
    if process_step_id == 'address_finder':
        uuid_val = uuid.uuid4()
        record_log(uuid_val.bytes, process_step_id, exception, form_data)
        return uuid_val
    else:
        if uuid in form_data:
            record_log(form_data['uuid'], process_step_id, exception, form_data)
        else:
            record_log('placeholder', process_step_id, exception, form_data)
        return

def get_pin(form_data):
    '''
    Input:
    {
        st_num : 'num' #street number,
        st_name : 'str' #street name/rest of address
    }
    Output:
    {
        candidates: [{'address':val,'parcel_num':val},{}]
    }
    '''
    data_dict = {}
    data_dict['cook_sf'] = cook_sf
    data_dict['detroit_sf'] = detroit_sf

    return address_candidates(form_data, data_dict)


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
    return process_comps_input(form_data)
