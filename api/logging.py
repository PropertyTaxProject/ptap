import os
import time
import uuid

import gspread
import pandas as pd
from google.oauth2 import service_account

gsheet = None
gsheet2 = None

if os.path.exists("api/.googleenv/ptap-904555bfffb0.json"):
    # open connection with google sheets personal log
    credentials = service_account.Credentials.from_service_account_file(
        "api/.googleenv/ptap-904555bfffb0.json",
        scopes=[
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive",
        ],
    )

    client = gspread.authorize(credentials)
    gsheet = client.open("ptap-log").sheet1

    # # open connection with google sheets submission account
    credentials2 = service_account.Credentials.from_service_account_file(
        "api/.googleenv/ptap-297022-09570cc5b389.json",
        scopes=[
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive",
        ],
    )

    client2 = gspread.authorize(credentials2)
    gsheet2 = client2.open("PTAP_Submissions").sheet1


def record_log(uuid_val, process_step_id, exception, form_data):
    if gsheet is None:
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
            new[i] = j["PIN"]
        elif i in ["comparables", "comparablesPool", "selectedComparables"]:
            for comp in j:
                new["comp_" + str(cnt)] = comp["PIN"]
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

    gsheet.append_rows([list(new.keys())] + [list(new.values())])


def record_final_submission(sub_dict):
    if gsheet2 is None:
        return

    # add values
    gsheet2.append_rows([list(sub_dict.values())])
    # make url
    val_list = gsheet2.col_values(1)
    base_url = "https://docs.google.com/spreadsheets/d/"
    sid = os.environ.get("PTAP_SHEET_SID")

    return base_url + sid + "/edit#gid=0&range=A" + str(len(val_list))


def logger(form_data, process_step_id, exception=""):
    if process_step_id == "address_finder":  # give uuid
        uuid_val = uuid.uuid4().urn[9:]
    elif "uuid" in form_data:  # if uuid given
        uuid_val = form_data["uuid"]
    else:  # missing
        uuid_val = "missing"
    record_log(uuid_val, process_step_id, exception, form_data)
