import json
import os
from datetime import datetime

import gspread
import pandas as pd
import pytz
from docxtpl import DocxTemplate
from google.oauth2 import service_account

from .constants import DAMAGE_TO_CONDITION
from .dataqueries import avg_ecf, get_pin
from .email import cook_submission_email, detroit_submission_email
from .utils import render_doc_to_bytes

gsheet_submission = None


def record_final_submission(submission):
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
    worksheet = client.open(os.getenv("GOOGLE_SHEET_SUBMISSION_NAME")).worksheet(
        "submissions"
    )

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
    return (
        f"{base_url}{os.getenv('GOOGLE_SHEET_SID')}/edit#gid=0&range=A{len(val_list)}"
    )


def submit_cook_sf(comp_submit, mail):
    """
    Output:
    Word Document
    """
    owner_name = comp_submit.get(
        "name", f'{comp_submit["first_name"]} {comp_submit["last_name"]}'
    )
    rename_dict = {
        "address": "Address",
        "bedrooms": "Beds",
        "age": "Age",
        "stories": "Stories",
        "assessed_value": "Assessed Value",
        "building_sq_ft": "Square Footage",
        "exterior": "Exterior Material",
        "distance": "Dist.",
    }

    t_df = pd.DataFrame([comp_submit["target_pin"]])
    comps_df = pd.DataFrame(comp_submit["comparables"])

    pin_av = t_df.assessed_value[0]
    pin = t_df.pin[0]
    comps_avg = comps_df["assessed_value"].mean()

    # rename cols
    t_df = t_df.rename(columns=rename_dict)
    comps_df = comps_df.rename(columns=rename_dict)

    # tbl cols
    target_cols = ["Beds", "Square Footage", "Age", "Exterior Material", "Stories"]

    comp_cols = ["Address", "Dist."] + target_cols  # + ['Sale Price', 'Sale Year']

    # check for char input
    if "characteristicsinput" not in comp_submit:
        comp_submit["characteristicsinput"] = "NO STRUCTURAL DAMAGE REPORTED"

    base_dir = os.path.dirname(os.path.abspath(__file__))

    # generate docx
    output_name = (
        f"{pin} Protest Letter Updated {datetime.today().strftime('%m_%d_%y')}.docx"
    )
    comp_submit["output_name"] = output_name
    doc = DocxTemplate(
        os.path.join(base_dir, "templates", "docs", "cook_template_2024.docx")
    )

    allinfo = []
    propinfo = []
    # skip_ls = ['target_pin', 'comparables', 'output_name']
    # for key, val in comp_submit.items():
    #    if key not in skip_ls:
    #        allinfo.append([key, val])

    # for i, j in get_pin('detroit', pin).to_dict(orient='records')[0].items():
    #    propinfo.append([i, j])

    context = {
        "pin": pin,
        "address": comp_submit["address"],
        "homeowner_name": owner_name,
        "assessor_av": "{:,.0f}".format(pin_av),
        "assessor_mv": "${:,.0f}".format(pin_av * 10),
        "contention_av": "{:,.0f}".format(comps_avg / 10),
        "contention_mv": "${:,.0f}".format(comps_avg),
        "target_labels": target_cols,
        "target_contents": t_df[target_cols].to_numpy().tolist(),
        "comp_labels": comp_cols,
        "comp_contents": comps_df[comp_cols].to_numpy().tolist(),
        "damage_descript": comp_submit.get("characteristicsinput"),
        "allinfo": allinfo,
        "propinfo": propinfo,
    }

    # TODO: What is this used for?
    output = {}

    comp_submit["file_stream"] = render_doc_to_bytes(doc, context, comp_submit["files"])

    """
    # update submission log
    targ = get_pin('detroit', pin)

    if comp_submit['validcharacteristics'] == 'No':
        c_flag = 'Yes. Homeowner Input: ' + comp_submit['characteristicsinput']
    else:
        c_flag = 'No'

    sub_dict = {
        'Client Name' : comp_submit['name'],
        'Address' : comp_submit['address'],
        'Taxpayer of Record' : targ['taxpayer'].to_string(index=False),
        'pin' : pin,
        'Phone Number' : comp_submit['phone'],
        'Email Address' : comp_submit['email'],
        'Preferred Contact Method' : comp_submit['preferred'],
        'PRE' : targ['homestead_exemption'].to_string(index=False),
        'Eligibility Flag' : comp_submit['eligibility'],
        'Characteristics Flag': c_flag,
        'SEV' : str(pin_av),
        'TV' : targ['taxable_va'].to_string(index=False),
        'CV' : str(comps_avg)
    }

    log_url = record_final_submission(sub_dict)
    comp_submit['log_url'] = log_url
    """
    if os.getenv("GOOGLE_SHEET_SID"):
        comp_submit["log_url"] = "https://docs.google.com/spreadsheets/d/" + os.getenv(
            "GOOGLE_SHEET_SID"
        )

    # send email
    cook_submission_email(mail, comp_submit)

    return output


def submit_detroit_sf(comp_submit, mail):
    owner_name = comp_submit.get(
        "name", f'{comp_submit["first_name"]} {comp_submit["last_name"]}'
    )
    rename_dict = {
        "pin": "Parcel ID",
        "address": "Address",
        "assessed_value": "Assessed Value",
        "total_acreage": "Acres",
        "total_floor_area": "Floor Area",
        "total_sq_ft": "Square Footage (Abv. Ground)",
        "year_built": "Year Built",
        "exterior": "Exterior Material",
        "distance": "Dist.",
        "stories": "Number of Stories",
        "sale_price": "Sale Price",
        "neighborhood": "Neighborhood",
        "baths": "Baths",
        "sale_date": "Sale Date",
    }
    t_df = pd.DataFrame([comp_submit["target_pin"]])
    comps_df = pd.DataFrame(comp_submit["comparables"])
    pin_av = t_df.assessed_value[0]
    pin = t_df.pin[0]
    if "sale_price" not in comps_df:
        comps_df["sale_price"] = 0
    comps_avg = comps_df["sale_price"].mean()

    # rename cols
    t_df = t_df.rename(columns=rename_dict)
    comps_df = comps_df.rename(columns=rename_dict)

    # tbl cols
    target_cols = [
        "Baths",
        "Square Footage (Abv. Ground)",
        "Year Built",
        "Exterior Material",
        "Number of Stories",
        "Neighborhood",
    ]

    comp_cols = ["Address", "Dist.", "Sale Price", "Sale Date"] + target_cols
    comps_df = comps_df.reindex(columns=comp_cols)

    # avg ecf price
    avg_ecf_price = avg_ecf(t_df["Neighborhood"].values[0])

    # generate docx
    base_dir = os.path.dirname(os.path.abspath(__file__))

    comp_submit[
        "output_name"
    ] = f"{pin} Protest Letter Updated {datetime.today().strftime('%m_%d_%y')}.docx"
    doc = DocxTemplate(
        os.path.join(base_dir, "templates", "docs", "detroit_template_2024.docx")
    )

    allinfo = []
    propinfo = []
    skip_ls = ["target_pin", "comparables", "output_name"]
    for key, val in comp_submit.items():
        if key not in skip_ls:
            allinfo.append([key, val])

    allinfo.append(["Average Price Per Sqft in ECF", round(avg_ecf_price, 3)])

    for i, j in get_pin("detroit", pin).to_dict(orient="records")[0].items():
        propinfo.append([i, j])

    # update submission log
    targ = get_pin("detroit", pin)

    if comp_submit.get("validcharacteristics") == "No":
        c_flag = "Yes. Homeowner Input: " + (
            comp_submit.get("characteristicsinput") or "No"
        )
    else:
        c_flag = "No"

    sub_dict = {
        "Client Name": owner_name,
        "Address": comp_submit["address"],
        "Taxpayer of Record": targ["taxpayer"].to_string(index=False),
        "pin": pin,
        "Phone Number": comp_submit["phone"],
        "Email Address": comp_submit["email"],
        "Phone Contact Time": comp_submit.get("phonetime", ""),
        "PRE": targ["homestead_exemption"].to_string(index=False),
        "Eligibility Flag": comp_submit["eligible"],
        "Characteristics Flag": c_flag,
        "SEV": str(pin_av),
        "TV": targ["taxable_value"].to_string(index=False),
        "CV": str(comps_avg),
    }

    if not os.getenv("ATTACH_LETTERS"):
        log_url = record_final_submission(comp_submit)
        comp_submit["log_url"] = log_url

        # send email
        detroit_submission_email(mail, comp_submit)
        return

    context = {
        "pin": pin,
        "owner": owner_name,
        "address": comp_submit["address"],
        "formal_owner": owner_name,
        "current_sev": "{:,.0f}".format(pin_av),
        "current_faircash": "${:,.0f}".format(pin_av * 2),
        "contention_sev": "{:,.0f}".format(comps_avg / 2),
        "contention_faircash": "${:,.0f}".format(comps_avg),
        "target_labels": ["Beds"] + target_cols,
        "target_contents": [["XXX"] + t_df[target_cols].to_numpy().tolist()[0]],
        "comp_labels": comp_cols,
        "comp_contents": comps_df[comp_cols].to_numpy().tolist(),
        "allinfo": allinfo,
        "propinfo": propinfo,
        "year": 2024,
        # **detroit_depreciation(None, None, None, None),
    }

    # TODO:
    output = {}

    comp_submit["file_stream"] = render_doc_to_bytes(doc, context, comp_submit["files"])

    log_url = record_final_submission(sub_dict)
    comp_submit["log_url"] = log_url

    # send email
    detroit_submission_email(mail, comp_submit)

    return output


def detroit_depreciation(actual_age, effective_age, damage, damage_level):
    condition = DAMAGE_TO_CONDITION.get(damage_level, [0, 0, 0])
    percent_good = 100 - effective_age
    schedule_incorrect = effective_age < actual_age and not (
        actual_age >= 55 and effective_age >= 55
    )
    damage_incorrect = condition[2] < percent_good
    damage_correct = condition[0] > percent_good

    return {
        "age": actual_age,
        "actual_age": min(actual_age, 55),
        "effective_age": effective_age,
        "new_effective_age": 100 - actual_age,
        "percent_good": percent_good,
        "schedule_incorrect": schedule_incorrect,
        "damage": damage,
        "damage_level": damage_level.title().replace("_", " "),
        "damage_midpoint": condition[1],
        "damage_incorrect": damage_incorrect,
        "damage_correct": damage_correct,
        "show_depreciation": not schedule_incorrect and damage_correct,
    }
