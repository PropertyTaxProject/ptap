import os
import time

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_mail import Mail
from sqlalchemy import event
from werkzeug.exceptions import HTTPException

from .db import db
from .logging import logger
from .mainfct import (
    address_candidates,
    comparables,
    process_comps_input,
    process_estimate,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_BUILD_DIR = os.path.join(os.path.dirname(BASE_DIR), "build")

application = Flask(
    __name__,
    static_folder=os.path.join(STATIC_BUILD_DIR, "static"),
    template_folder="./templates/",
)
application.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
application.config["MAIL_SERVER"] = "smtp.sendgrid.net"
application.config["MAIL_PORT"] = 587
application.config["MAIL_USE_TLS"] = True
application.config["MAIL_USERNAME"] = os.getenv("SENDGRID_USERNAME")
application.config["MAIL_PASSWORD"] = os.getenv("SENDGRID_API_KEY")
application.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER")


application.config[
    "SQLALCHEMY_DATABASE_URI"
] = f"sqlite:///{os.path.join(BASE_DIR, 'database', 'data.db')}"
# application.config["JSON_PROVIDER_CLASS"] = "api.json.SQLAlchemyJSONProvider"
# TODO: Figure this out
# application.json_provider_class = SQLAlchemyJSONProvider
# application.json = application.json_provider_class(application)
# application.config["SQLALCHEMY_ECHO"] = True

db.init_app(application)

with application.app_context():

    @event.listens_for(db.engine, "connect")
    def load_spatialite(dbapi_conn, connection_record):
        dbapi_conn.enable_load_extension(True)
        dbapi_conn.load_extension("mod_spatialite")


CORS(application)
mail = Mail(application)


@application.route("/")
def index():
    return send_file(os.path.join(STATIC_BUILD_DIR, "index.html"))


@application.route("/api_v1/pin-lookup", methods=["POST"])
def handle_form0():
    # get pin from address / send to owner input page
    print("pin finder submit")
    pf_data = request.json
    print("PAGE DATA", request.json)
    print("REQUEST OBJECT", request)
    response_dict = address_candidates(pf_data, {"detroit": 150000, "cook": 225000})
    response_dict["uuid"] = logger(pf_data, "address_finder")
    resp = jsonify({"request_status": time.time(), "response": response_dict})

    return resp


@application.route("/api_v1/submit", methods=["POST"])
def handle_form():
    # owner information submit / get comps / send to comps select page
    print("owner info submit")
    owner_data = request.json
    print("PAGE DATA", request.json)
    print("REQUEST OBJECT", request)
    response_dict = comparables(owner_data)
    logger(owner_data, "get_comps")
    resp = jsonify({"request_status": time.time(), "response": response_dict})

    return resp


@application.route("/api_v1/submit2", methods=["POST"])
def handle_form2():
    # submit selected comps / finalize appeal / send to summary or complete page
    print("page 2 submit")
    comps_data = request.json
    download = False
    response_dict = process_comps_input(comps_data, mail)
    logger(comps_data, "submit")
    if download:
        return send_file(
            response_dict["file_stream"],
            as_attachment=True,
            attachment_filename="%s-appeal.docx"
            % comps_data["name"].lower().replace(" ", "-"),
        )
    resp = jsonify({"request_status": time.time(), "response": response_dict})

    return resp


@application.route("/api_v1/estimates", methods=["POST"])
def handle_form3():
    # given pin and select comp, generate estimate/appendix file
    print("estimate submit")
    est_data = request.json
    response_dict = process_estimate(est_data, True)
    logger(est_data, "est_submit")
    return send_file(
        response_dict["file_stream"], as_attachment=True, download_name="test.docx"
    )


@application.route("/api_v1/estimates2", methods=["POST"])
def handle_form4():
    # given pin and select comp, generate estimate/appendix file
    print("estimate submit")
    est_data = request.json
    response_dict = process_estimate(est_data, False)
    logger(est_data, "est_submit")
    resp = jsonify({"request_status": time.time(), "response": response_dict})

    return resp


@application.errorhandler(404)
def page_not_found(error):
    return send_file(os.path.join(STATIC_BUILD_DIR, "index.html"))


@application.errorhandler(Exception)
def handle_error(error):
    if isinstance(error, HTTPException):
        return error

    return jsonify({"error": str(error)}), 500
