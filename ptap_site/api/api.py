import time
from flask import Flask, request

app = Flask(__name__)

@app.route('/api_v1/submit', methods=['POST'])
def handle_form():
    form_data = request.json
    # this is the data submitted by the form

    # placeholder response
    return {'request_status': time.time()}