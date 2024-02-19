import json
import os
from datetime import datetime, timedelta

import boto3
import gspread
import pytz
from google.oauth2 import service_account


def load_worksheet():
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
    return client.open(os.getenv("GOOGLE_SHEET_SUBMISSION_NAME")).worksheet(
        "submissions"
    )


def submission_row(submission):
    timestamp = datetime.strptime(submission["timestamp"], "%Y-%m-%dT%H:%M:%SZ")
    key = f"submissions/{timestamp.strftime('%Y/%m/%d')}/{submission.get('uuid')}.json"

    info = submission.get("user", {})
    eligibility = submission.get("eligibility", {})
    return [
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


if __name__ == "__main__":
    s3 = boto3.client("s3")
    bucket = os.getenv("S3_SUBMISSIONS_BUCKET")
    today = datetime.now(pytz.timezone("America/Detroit"))
    submissions_to_add = []

    submission_keys = []
    for day_diff in range(0, 90):
        day = today - timedelta(day_diff)
        res = s3.list_objects_v2(
            Bucket=bucket, Prefix="submissions/" + day.strftime("%Y/%m/%d/")
        )
        for obj in res.get("Contents", []):
            submission_keys.append(obj["Key"])

    for key in submission_keys:
        data = json.load(s3.get_object(Bucket=bucket, Key=key)["Body"])
        if data.get("step") == "submit":
            submissions_to_add.append(data)

    worksheet = load_worksheet()
    submission_uuids = worksheet.col_values(1)
    rows_to_add = []
    for submission in submissions_to_add:
        if submission["uuid"] not in submission_uuids:
            rows_to_add.append(submission_row(submission))

    rows_to_add = sorted(rows_to_add, key=lambda r: r[2])
    print(rows_to_add[0][2])
    print(rows_to_add[-1][2])
    print(len(rows_to_add))
    worksheet.append_rows(rows_to_add)
