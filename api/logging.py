import json
import os

import gspread
from google.oauth2 import service_account

gsheet_submission = None


def record_final_submission(sub_dict):
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
    worksheet = client.open(os.getenv("GOOGLE_SHEET_SUBMISSION_NAME")).sheet1

    worksheet.append_rows([list(sub_dict.values())])
    val_list = worksheet.col_values(1)
    base_url = "https://docs.google.com/spreadsheets/d/"

    # TODO: Pull SID dynamically
    return (
        f"{base_url}{os.getenv('GOOGLE_SHEET_SID')}/edit#gid=0&range=A{len(val_list)}"
    )
