import base64
import gzip
import json
import os
import string
from datetime import datetime

import gspread
from google.oauth2 import service_account

prefix = "LOG_STEP: "


def lambda_handler(event, context):
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
    worksheet = client.open(os.getenv("GOOGLE_SHEET_NAME")).sheet1

    # Store a dictionary referencing each UUID so we can get the latest event for each
    step_dict = {}

    cloudwatch_event = load_compressed_event(event["awslogs"]["data"])
    for record in cloudwatch_event["logEvents"]:
        message = record["message"].split(prefix)[-1]
        step = json.loads(message)
        if "uuid" in step:
            step_dict[step["uuid"]] = {
                **step,
                "timestamp": datetime.fromtimestamp(
                    record["timestamp"] / 1000
                ).isoformat(),
            }

    for log_data in step_dict.values():
        update_google_spreadsheet(worksheet, log_data)


def load_compressed_event(b64_str):
    bytes_gz = base64.b64decode(b64_str)
    return json.loads(gzip.decompress(bytes_gz).decode("utf-8"))


def update_google_spreadsheet(worksheet, log_data):
    cell = worksheet.find(log_data["uuid"], in_column=2)
    row = row_from_data(log_data)

    if cell:
        col_range_end = string.ascii_uppercase[len(row)]
        worksheet.update(f"A{cell.row}:{col_range_end}{cell.row}", [row])
    else:
        worksheet.append_row(row)


def row_from_data(data):
    return [
        data.get("timestamp"),
        data.get("uuid"),
        data.get("step"),
        data.get("region"),
        data.get("name"),
        data.get("address"),
        data.get("email"),
        data.get("phone"),
        json.dumps(data),
    ]
