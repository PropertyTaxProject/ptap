import os
import uuid
from logging.config import dictConfig

import boto3
import sentry_sdk
from flask import Flask, abort, jsonify, request, send_file
from flask_cors import CORS
from flask_mail import Mail
from flask_pydantic import validate
from jinja2 import Environment, FileSystemLoader
from sentry_sdk.integrations.aws_lambda import AwsLambdaIntegration
from sentry_sdk.integrations.flask import FlaskIntegration
from werkzeug.exceptions import HTTPException

from .comparables import find_comparables
from .db import db
from .dto import ParcelResponseBody, RequestBody, ResponseBody, SearchResponseBody
from .email import CookDocumentMailer, DetroitDocumentMailer, MilwaukeeDocumentMailer
from .queries import find_address_candidates, find_parcel
from .tasks import send_reminders
from .utils import load_s3_json, log_step

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
app.config["S3_CLIENT"] = boto3.client("s3")


db.init_app(app)


CORS(app)
mail = Mail(app)


@app.route("/")
def index():
    return send_file(os.path.join(STATIC_BUILD_DIR, "index.html"))


@app.route("/robots.txt", methods=["GET"])
def robots():
    return send_file(os.path.join(STATIC_BUILD_DIR, "robots.txt"))


@app.route("/api/search-pin/<region>/<address>", methods=["GET"])
@validate()
def search_pin(region: str, address: str):
    candidates = find_address_candidates(region, address)
    uid = uuid.uuid4().urn[9:]
    # TODO: Logging, implement as middleware? Include request and response
    return SearchResponseBody(
        uuid=uid,
        search_properties=[
            ParcelResponseBody.from_parcel(candidate) for candidate in candidates
        ],
    )


@app.route("/api/user-form", methods=["POST"])
@validate()
def handle_user_form(body: RequestBody):
    target = find_parcel(body.pin)
    comparables = find_comparables(body.region, target)

    # TODO: Logging
    return ResponseBody(
        **body,
        comparables=[
            ParcelResponseBody.from_parcel(comp, distance)
            for (comp, distance) in comparables
        ],
    )


@app.route("/api/submit-appeal", methods=["POST"])
@validate()
def handle_submit_appeal(body: RequestBody):
    # TODO: Logging
    if body.region == "cook":
        mailer = CookDocumentMailer(body)
    elif body.region == "detroit":
        mailer = DetroitDocumentMailer(body)
    elif body.region == "milwaukee":
        mailer = MilwaukeeDocumentMailer(body)
    else:
        raise ValueError("Invalid region supplied")

    mailer.send_mail(mail)

    return ("", 204)


@app.route("/api/agreement", methods=["POST"])
def handle_agreement(body: RequestBody):
    log_step(app.logger, {**request.json, "step": "agreement"})
    if body.region == "cook":
        mailer = CookDocumentMailer(body)
    elif body.region == "detroit":
        mailer = DetroitDocumentMailer(body)
    elif body.region == "milwaukee":
        mailer = MilwaukeeDocumentMailer(body)
    else:
        raise ValueError("Invalid region supplied")

    mailer.send_agreement_email(mail)
    return ("", 204)


@app.route("/api/upload", methods=["POST"])
def handle_upload():
    s3_key = f"{uuid.uuid4()}/{request.json['filename']}"
    return jsonify(
        app.config["S3_CLIENT"].generate_presigned_post(
            os.getenv("S3_UPLOADS_BUCKET"), s3_key, ExpiresIn=3600
        )
    )


@app.route("/cron/reminders", methods=["GET"])
def handle_reminder():
    send_reminders(mail, app.logger)
    return ("", 200)


@app.route("/<region>/resume", methods=["GET"])
def resume(region):
    app.logger.info("STARTING")
    bucket = os.getenv("S3_SUBMISSIONS_BUCKET")
    key = request.args.get("submission", "")
    app.logger.info(f"RESUME: {key}")

    # Restrict access to submissions subpath, not ideal
    if not key.startswith("submissions/"):
        return abort(404)

    try:
        # TODO: Add prop so emails not all re-sent?
        data = load_s3_json(app.config["S3_CLIENT"], bucket, key)
    except Exception as e:
        sentry_sdk.capture_exception(e)
        return abort(404)

    jinja_env = Environment(loader=FileSystemLoader(STATIC_BUILD_DIR))
    return jinja_env.get_template("index.html").render(frontend_props=data)


@app.errorhandler(404)
def page_not_found(error):
    return send_file(os.path.join(STATIC_BUILD_DIR, "index.html"))


@app.errorhandler(Exception)
def handle_error(error):
    if isinstance(error, HTTPException):
        return error
    sentry_sdk.capture_exception(error)
    return jsonify({"error": str(error)}), 500
