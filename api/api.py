import os
import time

from flask import Flask, jsonify, render_template, request, send_file
from flask_cors import CORS
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event

from .logging import logger
from .mainfct import (
    address_candidates,
    comparables,
    process_comps_input,
    process_estimate,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

application = Flask(__name__, static_folder="../build/", template_folder="./templates/")
application.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
application.config["MAIL_SERVER"] = "smtp.sendgrid.net"
application.config["MAIL_PORT"] = 587
application.config["MAIL_USE_TLS"] = True
application.config["MAIL_USERNAME"] = os.getenv("SENDGRID_USERNAME")
application.config["MAIL_PASSWORD"] = os.getenv("SENDGRID_API_KEY")
application.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER")


application.config[
    "SQLALCHEMY_DATABASE_URI"
] = f"sqlite://{os.path.join(BASE_DIR, 'database', 'data.sqlite')}"

db = SQLAlchemy(application)

with application.app_context():

    @event.listens_for(db.engine, "connect")
    def load_spatialite(dbapi_conn, connection_record):
        dbapi_conn.enable_load_extension(True)
        dbapi_conn.load_extension("mod_spatialite")


CORS(application)
mail = Mail(application)


@application.route("/")
def index():
    return send_file("../build/index.html")


@application.route("/api_v1/pin-lookup", methods=["POST"])
def handle_form0():
    # get pin from address / send to owner input page
    print("pin finder submit")
    pf_data = request.json
    print("PAGE DATA", request.json)
    print("REQUEST OBJECT", request)
    try:
        response_dict = get_pin(pf_data)
        response_dict["uuid"] = logger(pf_data, "address_finder")
        resp = jsonify({"request_status": time.time(), "response": response_dict})
    except Exception as e:
        resp = jsonify({"error": str(e)})
        logger(pf_data, "address_finder", e)

    return resp


@application.route("/api_v1/submit", methods=["POST"])
def handle_form():
    # owner information submit / get comps / send to comps select page
    print("owner info submit")
    owner_data = request.json
    print("PAGE DATA", request.json)
    print("REQUEST OBJECT", request)
    try:
        response_dict = get_comps(owner_data)
        logger(owner_data, "get_comps")
        resp = jsonify({"request_status": time.time(), "response": response_dict})
    except Exception as e:
        resp = jsonify({"error": str(e)})
        logger(owner_data, "get_comps", e)

    return resp


@application.route("/api_v1/submit2", methods=["POST"])
def handle_form2():
    # submit selected comps / finalize appeal / send to summary or complete page
    print("page 2 submit")
    comps_data = request.json
    download = False
    try:
        response_dict = finalize_appeal(comps_data, mail)
        logger(comps_data, "submit")
        if download:
            return send_file(
                response_dict["file_stream"],
                as_attachment=True,
                attachment_filename="%s-appeal.docx"
                % comps_data["name"].lower().replace(" ", "-"),
            )
        resp = jsonify({"request_status": time.time(), "response": response_dict})
    except Exception as e:
        resp = jsonify({"error": str(e)})
        logger(comps_data, "submit", e)

    return resp


@application.route("/api_v1/estimates", methods=["POST"])
def handle_form3():
    # given pin and select comp, generate estimate/appendix file
    print("estimate submit")
    est_data = request.json
    try:
        response_dict = finalize_estimate(est_data, True)
        logger(est_data, "est_submit")
        return send_file(
            response_dict["file_stream"], as_attachment=True, download_name="test.docx"
        )
    except Exception as e:
        resp = jsonify({"error": str(e)})
        logger(est_data, "submit_estimate", e)

    return resp


@application.route("/api_v1/estimates2", methods=["POST"])
def handle_form4():
    # given pin and select comp, generate estimate/appendix file
    print("estimate submit")
    est_data = request.json
    try:
        response_dict = finalize_estimate(est_data, False)
        logger(est_data, "est_submit")
        resp = jsonify({"request_status": time.time(), "response": response_dict})
    except Exception as e:
        resp = jsonify({"error": str(e)})
        logger(est_data, "submit_estimate2", e)

    return resp


@application.errorhandler(404)
def page_not_found(error):
    return render_template("index.html")


def get_pin(form_data):
    """
    Input:
    {
        st_num : 'num' #street number,
        st_name : 'str' #street name/rest of address
    }
    Output:
    {
        candidates: [{'address':val,'parcel_num':val},{}]
    }
    """
    cutoff_info = {"detroit": 150000, "cook": 225000}

    return address_candidates(form_data, cutoff_info)


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
    return comparables(form_data)


def finalize_appeal(form_data, mail):
    """
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
        'preferred: ''
    }

    Output:
    {
        success: bool,
        contention_value: val,
        message: txt
    }
    """
    return process_comps_input(form_data, mail)


def finalize_estimate(form_data, download=True):
    """
    Input:
    {
        'target_pin': [{}],
        'comparablesPool': [{},{},{},{}]
        'uuid': '',
        'selectedComparables': [{}]
    }

    Output:
    word document OR
    {
        TBD
    }
    """
    return process_estimate(form_data, download)
