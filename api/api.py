import json
import os
import uuid

import sentry_sdk
from flask import abort, jsonify, request, send_file
from flask_pydantic import validate  # type: ignore
from jinja2 import Environment, FileSystemLoader
from werkzeug.exceptions import HTTPException

from . import STATIC_BUILD_DIR, create_app, mail
from .comparables import find_comparables
from .dto import ParcelResponseBody, RequestBody, ResponseBody, SearchResponseBody
from .email import (
    BaseMailer,
    CookDocumentMailer,
    DetroitDocumentMailer,
    MilwaukeeDocumentMailer,
)
from .models import Submission
from .queries import find_address_candidates, find_parcel, iso8601_serializer, log_step
from .tasks import (
    get_submission_worksheet,
    send_reminders,
    sync_submissions_spreadsheet,
)
from .utils import model_from_region

app = create_app()


@app.route("/")
def index():
    return send_file(os.path.join(STATIC_BUILD_DIR, "index.html"))


@app.route("/robots.txt", methods=["GET"])
def robots():
    return send_file(os.path.join(STATIC_BUILD_DIR, "robots.txt"))


@app.route("/api/search-pin/<region>/<address>", methods=["GET"])
@validate()
def search_pin(region: str, address: str):
    uid = uuid.uuid4().urn[9:]
    log_step(
        app.logger,
        {"region": region, "address": address, "uuid": uid, "step": "pin-lookup"},
    )

    candidates = find_address_candidates(region, address)
    return SearchResponseBody(
        uuid=uid,
        search_properties=[
            ParcelResponseBody.from_parcel(candidate) for candidate in candidates
        ],
    )


@app.route("/api/user-form", methods=["POST"])
@validate()
def handle_user_form(body: RequestBody):
    log_step(app.logger, {**body.model_dump(), "step": "comparables"})

    target = find_parcel(body.region, body.pin)
    if target is None:
        raise ValueError("Parcel not found")
    comparables = find_comparables(body.region, target)
    parcel_body = ParcelResponseBody.from_parcel(target)
    if parcel_body is None:
        raise ValueError("Parcel not able to be parsed")
    return ResponseBody(
        **body.model_dump(),
        target=parcel_body,
        comparables=[
            ParcelResponseBody.from_parcel(comp, distance)
            for (comp, distance) in comparables
        ],
    )


@app.route("/api/submit-appeal", methods=["POST"])
@validate()
def handle_submit_appeal(body: RequestBody):
    submission = log_step(app.logger, {**body.model_dump(), "step": "submit"})

    mailer: BaseMailer
    if body.region == "cook":
        mailer = CookDocumentMailer(body, submission)
    elif body.region == "detroit":
        mailer = DetroitDocumentMailer(body, submission)
    elif body.region == "milwaukee":
        mailer = MilwaukeeDocumentMailer(body, submission)
    else:
        raise ValueError("Invalid region supplied")

    mailer.send_mail(mail)

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


@app.route("/cron/submissions", methods=["GET"])
def handle_submissions():
    for region in ["detroit", "milwaukee"]:
        app.logger.info(f"Syncing submissions to spreadsheet: {region}")
        worksheet = get_submission_worksheet(region)
        sync_submissions_spreadsheet(worksheet, region)
    return ("", 200)


@app.route("/<region>/resume", methods=["GET"])
def resume(region):
    uuid = request.args.get("submission", "")
    app.logger.info(f"RESUME: {uuid}")
    submission = Submission.query.filter_by(uuid=uuid).first()

    data = {}
    if submission:
        data = submission.data
        parcel = find_parcel(region, data["pin"])
        parcel_data = ParcelResponseBody.from_parcel(parcel).model_dump()
        submission.data["target"] = parcel_data
        submission.data["search_properties"] = [parcel_data]
        model = model_from_region(region)
        data["selected_comparables"] = [
            ParcelResponseBody.from_parcel(parcel).model_dump()
            for parcel in model.query.filter(
                model.pin.in_(data["selected_comparables"])
            )
        ]
    else:
        return abort(404)

    if "agreement_date" not in data:
        data["agreement_date"] = data["timestamp"][:10]
    # Hack to avoid adding a custom filter since it's only used here
    data = json.loads(json.dumps(data, default=iso8601_serializer))

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
