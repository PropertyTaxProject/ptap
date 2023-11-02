import os
import time
import uuid

import boto3
import sentry_sdk
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_mail import Mail
from sentry_sdk.integrations.aws_lambda import AwsLambdaIntegration
from sentry_sdk.integrations.flask import FlaskIntegration
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

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("ENVIRONMENT", "dev"),
    integrations=[AwsLambdaIntegration(), FlaskIntegration()],
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
)

app = Flask(
    __name__,
    static_folder=os.path.join(STATIC_BUILD_DIR, "static"),
    template_folder="./templates/",
)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["MAIL_SERVER"] = "smtp.sendgrid.net"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.getenv("SENDGRID_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("SENDGRID_API_KEY")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")

# app.config["JSON_PROVIDER_CLASS"] = "api.json.SQLAlchemyJSONProvider"
# TODO: Figure this out
# app.json_provider_class = SQLAlchemyJSONProvider
# app.json = app.json_provider_class(app)
# app.config["SQLALCHEMY_ECHO"] = True

db.init_app(app)


CORS(app)
mail = Mail(app)


@app.route("/")
def index():
    return send_file(os.path.join(STATIC_BUILD_DIR, "index.html"))


@app.route("/api_v1/pin-lookup", methods=["POST"])
def handle_form0():
    # get pin from address / send to owner input page
    print("pin finder submit")
    pf_data = request.json
    print("PAGE DATA", request.json)
    print("REQUEST OBJECT", request)
    response_dict = address_candidates(pf_data, {"detroit": 150000, "cook": 225000})
    print("got address candidates")
    response_dict["uuid"] = logger(pf_data, "address_finder")
    print("ran logger")
    resp = jsonify({"request_status": time.time(), "response": response_dict})

    return resp


@app.route("/api_v1/submit", methods=["POST"])
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


@app.route("/api_v1/submit2", methods=["POST"])
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


@app.route("/api_v1/estimates", methods=["POST"])
def handle_form3():
    # given pin and select comp, generate estimate/appendix file
    print("estimate submit")
    est_data = request.json
    response_dict = process_estimate(est_data, True)
    logger(est_data, "est_submit")
    return send_file(
        response_dict["file_stream"],
        mimetype="application/octet-stream",
        as_attachment=True,
        download_name="test.docx",
    )


@app.route("/api_v1/estimates2", methods=["POST"])
def handle_form4():
    # given pin and select comp, generate estimate/appendix file
    print("estimate submit")
    est_data = request.json
    response_dict = process_estimate(est_data, False)
    logger(est_data, "est_submit")
    resp = jsonify({"request_status": time.time(), "response": response_dict})

    return resp


@app.route("/api/upload", methods=["POST"])
def handle_upload():
    s3_client = boto3.client("s3")
    s3_key = f"{uuid.uuid4()}/{request.json['filename']}"
    return jsonify(
        s3_client.generate_presigned_post(
            os.getenv("S3_UPLOADS_BUCKET"), s3_key, ExpiresIn=3600
        )
    )


@app.errorhandler(404)
def page_not_found(error):
    return send_file(os.path.join(STATIC_BUILD_DIR, "index.html"))


@app.errorhandler(Exception)
def handle_error(error):
    if isinstance(error, HTTPException):
        return error

    return jsonify({"error": str(error)}), 500
