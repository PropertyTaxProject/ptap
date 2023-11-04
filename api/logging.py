import json
import os
import time
import uuid

import gspread
import pandas as pd
from google.oauth2 import service_account

gsheet_logs = None
gsheet_submission = None

LOGGING_ENABLED = os.getenv("GOOGLE_LOGGING_ENABLED")

if os.getenv("GOOGLE_SERVICE_ACCOUNT"):
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
    gsheet_logs = client.open("Copy of ptap-log").sheet1

    gsheet_submission = client.open("PTAP_Submissions").sheet1


# TODO: Parse logs from CloudWatch and submit those to Google instead?
def record_log(uuid_val, process_step_id, exception, form_data):
    if gsheet_logs is None or not LOGGING_ENABLED:
        return

    new = {}
    new["uuid"] = uuid_val
    new["process_step_id"] = process_step_id
    new["exception"] = repr(exception)
    new["time"] = time.time()

    # google sheets log
    cnt = 1
    for i, j in form_data.items():
        if i == "target_pin":
            new[i] = j["pin"]
        elif i in ["comparables", "comparablesPool", "selectedComparables"]:
            for comp in j:
                new["comp_" + str(cnt)] = comp["pin"]
                cnt += 1
        else:
            new[i] = j

    if exception:
        tmp = pd.DataFrame(new, index=[0])
        tmp = pd.concat(
            [tmp, pd.json_normalize(form_data).drop("uuid", axis=1, errors="ignore")],
            axis=1,
        )
        print(tmp.T)

    gsheet_logs.append_rows([list(new.keys())] + [list(new.values())])


def record_final_submission(sub_dict):
    if gsheet_submission is None:
        return

    # add values
    gsheet_submission.append_rows([list(sub_dict.values())])
    # make url
    val_list = gsheet_submission.col_values(1)
    base_url = "https://docs.google.com/spreadsheets/d/"

    return f"{base_url}{gsheet_submission.id}/edit#gid=0&range=A{len(val_list)}"


def logger(form_data, process_step_id, exception=""):
    if process_step_id == "address_finder":  # give uuid
        uuid_val = uuid.uuid4().urn[9:]
    elif "uuid" in form_data:  # if uuid given
        uuid_val = form_data["uuid"]
    else:  # missing
        uuid_val = "missing"
    record_log(uuid_val, process_step_id, exception, form_data)
