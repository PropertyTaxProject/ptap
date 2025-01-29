import json
import os
import time
from datetime import datetime, timedelta

import gspread
import pytz
import sentry_sdk
from google.oauth2 import service_account

from . import db
from .email import detroit_reminder_email
from .models import Submission
from .queries import find_parcel
from .utils import yes_no


def get_submission_worksheet(region: str) -> gspread.Worksheet:
    if not os.getenv("GOOGLE_SERVICE_ACCOUNT"):
        return

    credentials_json = json.loads(os.getenv("GOOGLE_SERVICE_ACCOUNT"))
    credentials = service_account.Credentials.from_service_account_info(
        credentials_json,
        scopes=[
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive",
        ],
    )

    client = gspread.authorize(credentials)
    sheet_name = os.getenv("GOOGLE_SHEET_SUBMISSION_NAME")
    if region == "milwaukee":
        sheet_name = os.getenv("MKE_GOOGLE_SHEET_SUBMISSION_NAME")
    return client.open(sheet_name).worksheet("submissions")


def sync_submissions_spreadsheet(worksheet, region, since=None):
    if since is None:
        since = datetime.now(pytz.timezone("America/Detroit")) - timedelta(days=3)
    sheet_uuids = set(worksheet.col_values(1))
    submitted_uuids = [
        str(uuid[0])
        for uuid in db.session.query(Submission.uuid)
        .filter(
            Submission.data["step"].astext == "submit",
            Submission.data["region"].astext == region,
            Submission.created_at >= since,
        )
        .all()
    ]
    uuids_to_add = set(submitted_uuids) - sheet_uuids
    submissions_to_add = (
        Submission.query.filter(Submission.uuid.in_(uuids_to_add))
        .order_by(Submission.created_at)
        .all()
    )
    rows = []

    app_subdomain = "app"
    if not os.getenv("ENVIRONMENT") == "prod":
        app_subdomain = "dev"

    for rec in submissions_to_add:
        submission = rec.data
        info = submission.get("user", {})
        eligibility = submission.get("eligibility", {})
        user_property = submission.get("property", {})
        street_address = ""
        if submission.get("pin"):
            parcel = find_parcel(submission.get("region"), submission["pin"])
            street_address = parcel.street_address

        rows.append(
            [
                rec.uuid,
                rec.created_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
                info.get("name", f'{info["first_name"]} {info["last_name"]}'),
                street_address,
                info.get("email"),
                info.get("phone"),
                info.get("phonetype"),
                submission.get("pin"),
                info.get("city"),
                info.get("state"),
                yes_no(eligibility.get("residence")),
                yes_no(eligibility.get("owner")),
                yes_no(eligibility.get("hope")),
                info.get("mailingaddress"),
                info.get("altcontactname"),
                info.get("heardabout"),
                info.get("localinput"),
                info.get("socialmedia"),
                user_property.get("validcharacteristics"),
                submission.get("characteristicsinput"),
                user_property.get("valueestimate"),
                len(submission.get("selected_comparables", [])),
                submission.get("damage_level"),
                submission.get("damage"),
                len(submission.get("files", [])),
                yes_no(submission.get("resumed")),
                f"https://{app_subdomain}.propertytaxproject.com/{region}/resume?submission={rec.uuid}",  # noqa
            ]
        )

    worksheet.append_rows(rows)


def send_reminders(mail, logger):
    logger.info("CRON: send reminders")
    today = datetime.now(pytz.timezone("America/Detroit"))
    # We should only send emails when someone hasn't been contacted already and doesn't
    # have a separate completed submission. This will ignore someone who submits two
    # days ago and then has an incomplete submission the next day, but since landlords
    # aren't allowed that shouldn't be an issue and is lower risk
    emails_to_ignore = set()
    # Make sure we only send one email per email address
    email_map = {}

    for submission in (
        Submission.query.filter(
            Submission.created_at >= (today - timedelta(2)),
            Submission.data["region"].astext == "detroit",
        )
        .order_by(Submission.created_at)
        .all()
    ):
        try:
            data = submission.data
            email = data.get("user", {}).get("email", "").lower()
            # Ignore user email if they've submitted or been sent a reminder
            if (data.get("step") == "submit") or data.get("reminder_sent"):
                emails_to_ignore.add(email)
            else:
                submission.data["reminder_sent"] = True
                db.session.add(submission)
                email_map[email] = data
        except Exception as e:
            sentry_sdk.capture_exception(e)

    for email, data in email_map.items():
        if email in emails_to_ignore:
            continue

        logger.info(f"CRON: send_reminders: {email}")
        try:
            reminder_email = detroit_reminder_email(data)
            if reminder_email:
                mail.send(detroit_reminder_email(data))
                logger.info(f"CRON: send_reminders: sent for {email}")
        except Exception as e:
            sentry_sdk.capture_exception(e)
        time.sleep(3)

    db.session.commit()
