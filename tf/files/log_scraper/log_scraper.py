import base64
import gzip
import json
import os

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
    worksheet = client.open(os.getenv("GOOGLE_SHEET_NAME")).sheet1  # noqa

    # Store a dictionary referencing each UUID so we can get the latest event for each
    step_dict = {}

    cloudwatch_event = load_compressed_event(event["awslogs"]["data"])
    print(cloudwatch_event)
    for record in cloudwatch_event["logEvents"]:
        message = record["message"].split(prefix)[-1]
        step = json.loads(message)
        print(step)
        if "uuid" in step:
            step_dict[step["uuid"]] = step
        # TODO: Get latest event for each UUID
        # if "uuid" in log_data["message"]:
        #     message_dict["uuid"] = log_data

    # for log_data in step_dict.values():
    #     update_google_spreadsheet(worksheet, log_data["message"], log_data["data"])


def load_compressed_event(b64_str):
    bytes_gz = base64.b64decode(b64_str)
    return json.loads(gzip.decompress(bytes_gz).decode("utf-8"))


def update_google_spreadsheet(worksheet, message, data):
    cell = worksheet.find(data, in_column=worksheet.col_values(2))

    if cell:
        row_index = cell.row
        worksheet.update("A{}".format(row_index), message)
    else:
        # If the value is not found, append a new row
        worksheet.append_row([message, data])
