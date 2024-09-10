import json
import os
from datetime import datetime
from typing import Type

import boto3
import gspread
import pytz
from google.oauth2 import service_account

from . import db
from .models import CookParcel, DetroitParcel, MilwaukeeParcel


def model_from_region(region: str) -> Type[db.Model]:
    if region == "cook":
        return CookParcel
    elif region == "detroit":
        return DetroitParcel
    elif region == "milwaukee":
        return MilwaukeeParcel


def record_final_submission(submission):
    # TODO:
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
    sheet_sid = os.getenv("GOOGLE_SHEET_SID")
    if submission.get("region") == "milwaukee":
        sheet_name = os.getenv("MKE_GOOGLE_SHEET_SUBMISSION_NAME")
        sheet_sid = os.getenv("MKE_GOOGLE_SHEET_SID")
    worksheet = client.open(sheet_name).worksheet("submissions")

    timestamp = datetime.now(pytz.timezone("America/Detroit"))
    key = f"submissions/{timestamp.strftime('%Y/%m/%d')}/{submission.get('uuid')}.json"
    # TODO: For now just append, in the future update like lambda for resubmission

    info = submission.get("user", {})
    eligibility = submission.get("eligibility", {})
    row_data = [
        submission.get("uuid"),
        key,
        timestamp.strftime("%Y-%m-%dT%H:%M:%SZ"),
        info.get("name", f'{submission["first_name"]} {submission["last_name"]}'),
        info.get("email"),
        info.get("phone"),
        info.get("phonetype"),
        submission.get("pin"),
        submission.get("address"),
        info.get("city"),
        info.get("state"),
        eligibility.get("residence"),
        eligibility.get("owner"),
        eligibility.get("hope"),
        info.get("mailingaddress"),
        info.get("altcontactname"),
        info.get("heardabout"),
        info.get("localinput"),
        info.get("socialmedia"),
        submission.get("validcharacteristics"),
        submission.get("characteristicsinput"),
        submission.get("valueestimate"),
        len(submission.get("selectedComparables", [])),
        submission.get("damage_level"),
        submission.get("damage"),
        len(submission.get("files", [])),
    ]
    worksheet.append_rows([row_data])

    val_list = worksheet.col_values(1)
    base_url = "https://docs.google.com/spreadsheets/d/"

    # TODO: Pull SID dynamically
    return f"{base_url}{sheet_sid}/edit#gid=0&range=A{len(val_list)}"


def load_s3_json(s3, bucket, key):
    data = json.load(s3.get_object(Bucket=bucket, Key=key)["Body"])
    if "agreement_date" not in data:
        data["agreement_date"] = data["timestamp"][:10]
    return data


def log_step(logger, data):
    # TODO: Seems like some LOG_STEPs are getting ignored
    logger.info(f"LOG_STEP: {json.dumps(data)}")
    # Only running for specific steps to reduce latency
    if data.get("step") in ["agreement", "submit"]:
        update_s3_submission(data)


def update_s3_submission(data):
    if not data.get("uuid") or not os.getenv("S3_SUBMISSIONS_BUCKET"):
        return
    timestamp = datetime.now(pytz.timezone("America/Detroit"))
    data["timestamp"] = timestamp.strftime("%Y-%m-%dT%H:%M:%SZ")
    timestamp_path = timestamp.strftime("%Y/%m/%d")

    s3 = boto3.client("s3")
    s3.put_object(
        Body=json.dumps(data),
        Bucket=os.getenv("S3_SUBMISSIONS_BUCKET"),
        Key=f"submissions/{timestamp_path}/{data.get('uuid')}.json",
    )
