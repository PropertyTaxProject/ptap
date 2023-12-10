import json
import os
import time
import uuid
from logging.config import dictConfig

import boto3
import sentry_sdk
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_mail import Mail
from sentry_sdk.integrations.aws_lambda import AwsLambdaIntegration
from sentry_sdk.integrations.flask import FlaskIntegration
from werkzeug.exceptions import HTTPException

from .db import db
from .mainfct import address_candidates, comparables, process_comps_input
from .utils import get_region

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_BUILD_DIR = os.path.join(os.path.dirname(BASE_DIR), "dist")

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("ENVIRONMENT", "dev"),
    integrations=[AwsLambdaIntegration(), FlaskIntegration()],
    traces_sample_rate=0.1,
    profiles_sample_rate=0.1,
)

dictConfig(
    {
        "version": 1,
        "formatters": {
            "default": {
                "format": "[%(asctime)s] %(levelname)s: %(message)s",
            }
        },
        "handlers": {
            "wsgi": {
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
                "formatter": "default",
            }
        },
        "root": {"level": "INFO", "handlers": ["wsgi"]},
    }
)

app = Flask(
    __name__,
    static_folder=os.path.join(STATIC_BUILD_DIR, "assets"),
    template_folder="./templates/",
)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.config["MAIL_PORT"] = os.getenv("MAIL_PORT")
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")


db.init_app(app)


CORS(app)
mail = Mail(app)


@app.route("/")
def index():
    return send_file(os.path.join(STATIC_BUILD_DIR, "index.html"))


@app.route("/api_v1/pin-lookup", methods=["POST"])
def handle_form0():
    response_dict = address_candidates(
        request.json, {"detroit": 150000, "cook": 225000}
    )
    uid = uuid.uuid4().urn[9:]
    log_params = {"uuid": uid, "region": get_region(request.json), "step": "pin-lookup"}
    app.logger.info(f"LOG_STEP: {json.dumps({**request.json, **log_params})}")
    response_dict["uuid"] = uid
    resp = jsonify({"request_status": time.time(), "response": response_dict})

    return resp


@app.route("/api_v1/submit", methods=["POST"])
def handle_form():
    owner_data = request.json
    log_params = {"region": get_region(request.json), "step": "comparables"}
    app.logger.info(f"LOG_STEP: {json.dumps({**request.json, **log_params})}")
    response_dict = comparables(owner_data)
    resp = jsonify({"request_status": time.time(), "response": response_dict})
    return resp


@app.route("/api_v1/submit2", methods=["POST"])
def handle_form2():
    # submit selected comps / finalize appeal / send to summary or complete page
    comps_data = request.json
    download = False
    log_params = {"region": get_region(request.json), "step": "submit"}
    app.logger.info(f"LOG_STEP: {json.dumps({**comps_data, **log_params})}")
    response_dict = process_comps_input(comps_data, mail)
    if download:
        return send_file(
            response_dict["file_stream"],
            as_attachment=True,
            attachment_filename="%s-appeal.docx"
            % comps_data["name"].lower().replace(" ", "-"),
        )
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
    sentry_sdk.capture_exception(error)
    return jsonify({"error": str(error)}), 500
