import io
import os
import string
from datetime import datetime
from tempfile import NamedTemporaryFile, TemporaryDirectory

import numpy as np
import pandas as pd
import requests
from docx.shared import Inches
from docxtpl import DocxTemplate, InlineImage
from PIL import Image
from pillow_heif import register_heif_opener
from rapidfuzz import process

from .computils import find_comps
from .dataqueries import address_candidates_query, ecdf, get_pin
from .submitappeal import submit_cook_sf, submit_detroit_sf


# TODO: Pydantic to enforce types on input? https://pypi.org/project/Flask-Pydantic/
def address_candidates(input_data, cutoff_info):
    """
    Returns address candidates
    """
    output = {}
    st_num = input_data["st_num"]
    st_name = input_data["st_name"]

    if input_data["appeal_type"] == "detroit_single_family":
        cutoff = cutoff_info["detroit"]
        region = "detroit"

    elif input_data["appeal_type"] == "cook_county_single_family":
        cutoff = cutoff_info["cook"]
        region = "cook"

    candidates = address_candidates_query(region, st_num)
    parcel_dict = {p.street_name.upper(): p.as_dict() for p in candidates}
    results = process.extract(st_name.upper(), parcel_dict.keys(), score_cutoff=50)

    selected = pd.DataFrame([parcel_dict[r[0]] for r in results])

    selected["Distance"] = 0
    selected["address"] = selected["street_number"] + " " + selected["street_name"]

    # if input_data["appeal_type"] == "detroit_single_family":
    #     selected = prettify_detroit(selected, False)
    # elif input_data["appeal_type"] == "cook_county_single_family":
    #     selected = prettify_cook(selected, False)

    selected["eligible"] = selected.assessed_value <= cutoff
    # Don't need this to be returned so dropping
    selected.drop("geom", axis=1, inplace=True)
    selected.replace({np.nan: None}, inplace=True)
    output["candidates"] = selected.to_dict(orient="records")

    if len(output["candidates"]) == 0:  # if none found raise
        raise Exception("No Matches Found")
    return output


def comparables(input_data, sales_comps=False):
    """
    Returns comparables
    """
    target_pin = input_data["pin"]

    # set constants
    if input_data["appeal_type"] == "detroit_single_family":
        max_comps = 7
        sales_comps = True
        region = "detroit"
        targ = get_pin(region, target_pin)
        if targ.empty:
            raise Exception("Invalid PIN")
        targ["Distance"] = 0
        partone = "Taxpayer of Record: " + targ["taxpayer"].to_string(index=False) + "."
        partone = string.capwords(partone)
        parttwo = (
            " Current Principal Residence Exemption (PRE)  Exemption Status: "
            + targ["homestead_exemption"].to_string(index=False)
            + "%."
        )
        prop_info = partone + parttwo
    elif input_data["appeal_type"] == "cook_county_single_family":
        max_comps = 9
        sales_comps = False
        region = "cook"
        targ = get_pin(region, target_pin)
        if targ.empty:
            raise Exception("Invalid PIN")
        targ["Distance"] = 0
        prop_info = ""

    # call comp funtion
    new_targ, cur_comps = find_comps(targ, region, sales_comps)

    # TODO: Below here is the real analysis code
    # TODO: Enum to represent regions
    # process comps

    # add weights based on Cook PINS AA-SS-BBB-PPP-UUUU
    # pos 7 high
    # 6 medium
    # 5 low

    dist_weight = 1
    valuation_weight = 3

    cur_comps["dist_dist"] = ecdf(cur_comps.distance)(cur_comps.distance, True)
    cur_comps["val_dist"] = ecdf(cur_comps.assessed_value)(
        cur_comps.assessed_value, True
    )
    cur_comps["score"] = (
        dist_weight * cur_comps["dist_dist"] + valuation_weight * cur_comps["val_dist"]
    )

    if input_data["appeal_type"] == "detroit_single_family":  # neighborhood bonus
        cur_comps["neigborhoodmatch"] = (
            cur_comps["neighborhood"] == targ["neighborhood"].values[0]
        )
        cur_comps["neigborhoodmatch"] = cur_comps["neigborhoodmatch"].astype(int)
        cur_comps["score"] = cur_comps["score"] + 1 * cur_comps["neigborhoodmatch"]
        cur_comps = cur_comps.drop(["neigborhoodmatch"], axis=1)

    cur_comps = cur_comps.sort_values(by=["score"], ascending=False)
    cur_comps = cur_comps.head(max_comps)
    new_targ = new_targ.round(2)
    cur_comps = cur_comps.round(2).drop(["dist_dist", "val_dist"], axis=1)

    output = {}
    new_targ = new_targ.fillna("").replace({np.nan: None})
    cur_comps = cur_comps.fillna("").replace({np.nan: None})

    if "sale_date" in cur_comps:
        cur_comps["sale_date"] = cur_comps["sale_date"].apply(
            lambda v: v.strftime("%Y-%m-%d")
        )
    output["target_pin"] = new_targ.drop(["geom"], axis=1).to_dict(orient="records")
    output["comparables"] = cur_comps.drop(["geom"], axis=1).to_dict(orient="records")
    output["labeled_headers"] = cur_comps.columns.tolist()
    output["prop_info"] = prop_info
    output["pinav"] = new_targ.assessed_value.mean()

    return output


def process_estimate(form_data, download):
    # TODO: Should break this into two requests, one to do the logic, one to format

    # rename_dict = {
    #     "pin": "Parcel ID",
    #     "assessed_value": "Assessed Value",
    #     "total_acre": "Acres",
    #     "total_floorarea": "Floor Area",
    #     "total_sqft": "Square Footage (Abv. Ground)",
    #     "Age": "Year Built",
    #     "Exterior": "Exterior Material",
    #     "Distance": "Dist.",
    #     "Stories (not including basement)": "Number of Stories",
    # }

    t_df = pd.DataFrame([form_data["target_pin"]])
    c_df = pd.DataFrame(form_data["selectedComparables"])
    comps_df = pd.DataFrame(form_data["comparablesPool"])

    pin_av = t_df["assessed_value"][0]
    pin = t_df.pin[0]

    comps_avg = c_df["sale_price"].mean()

    # rename cols
    # t_df = t_df.rename(columns=rename_dict)
    # c_df = c_df.rename(columns=rename_dict)
    # comps_df = comps_df.rename(columns=rename_dict)

    output = {}

    base_dir = os.path.dirname(os.path.abspath(__file__))

    # generate docx
    if download:
        doc = DocxTemplate(
            os.path.join(
                base_dir,
                "templates",
                "docs",
                "detroit_template_2023_alt.docx",
            )
        )
        # tbl cols
        target_cols = [
            "Baths",
            "Square Footage (Abv. Ground)",
            "Year Built",
            "Exterior Material",
            "Number of Stories",
            "Neighborhood",
        ]
        comp_labels = [
            "Address",
            "Distance",
            "Sale Price",
            "Sale Date",
        ] + target_cols
        comp_records = comps_df.to_dict(orient="records")
        comp_contents = []
        for comp_rec in comp_records:
            comp_contents.append(
                [
                    comp_rec["street_number"] + " " + comp_rec["street_name"],
                    format_distance(comp_rec["distance"]),
                    "${:,.0f}".format(comp_rec["sale_price"]),
                    comp_rec["sale_date"],
                    format_baths(comp_rec["baths"]),
                    comp_rec["total_sq_ft"],
                    comp_rec["year_built"],
                    format_exterior(comp_rec["exterior"]),
                    format_stories(comp_rec["stories"]),
                    comp_rec["neighborhood"],
                ]
            )

        target_rec_base = t_df.to_dict(orient="records")[0]
        target_rec = [
            format_baths(target_rec_base["baths"]),
            target_rec_base["total_sq_ft"],
            target_rec_base["year_built"],
            format_exterior(target_rec_base["exterior"]),
            format_stories(target_rec_base["stories"]),
            target_rec_base["neighborhood"],
        ]

        context = {
            "pin": pin,
            "address": target_rec_base["street_number"]
            + " "
            + target_rec_base["street_name"],
            "comp_address": comp_contents[0][0],
            "comp_sale": "${:,.0f}".format(comp_records[0]["sale_price"]),
            "comp_date": comp_records[0]["sale_date"],
            "current_sev": "${:,.0f}".format(pin_av),
            "current_faircash": "${:,.0f}".format(pin_av * 2),
            "contention_sev": "${:,.0f}".format(comps_avg / 2),
            "contention_faircash": "${:,.0f}".format(comps_avg),
            "target_labels": target_cols,
            "target_contents": [target_rec],
            "target_contents2": [comp_contents[0][4:]],
            "comp_labels": comp_labels,
            "comp_contents": comp_contents,
        }

        with TemporaryDirectory() as temp_dir:
            images = process_images(doc, form_data["files"], temp_dir)
            doc.render({**context, "images": images, "has_images": len(images) > 0})
            # also save a byte object to return
            file_stream = io.BytesIO()
            doc.save(file_stream)  # save to stream
            file_stream.seek(0)  # reset pointer to head
            output["file_stream"] = file_stream
            output["output_name"] = f"{pin}{datetime.today().strftime('%m_%d_%y')}.docx"
    else:
        # serve information for website display
        delta = (comps_avg / 2) - pin_av
        tax_bill = 0.06 * delta
        tax_str = "{:,.0f}".format(abs(tax_bill))

        if delta < 0:
            d_str2 = " less"  # overassessed
        else:
            d_str2 = " more"  # underassessed

        l1 = (
            "In 2023, the City assigned your property an assessed value of "
            + "{:,.0f}".format(pin_av)
            + ", "
        )
        l2 = (
            "meaning it believes your home is worth "
            + "{:,.0f}".format(2 * pin_av)
            + ". "
        )
        l3 = "Since your home is actually worth " + "{:,.0f}".format(comps_avg) + ","
        l4 = (
            " a more accurate assessed value is "
            + "{:,.0f}".format(comps_avg / 2)
            + ". "
        )
        l5 = (
            "Based on estimated current tax rates, if the City correctly assessed your property’s value, your tax bill would be $"  # noqa
            + tax_str
            + d_str2
            + ". "
        )

        output["estimate"] = l1 + l2 + l3 + l4 + l5

    return output


def process_images(doc, files, temp_dir):
    """Process images individually after upload"""
    register_heif_opener()

    MAX_WIDTH = Inches(5.5)
    MAX_HEIGHT = Inches(4)
    images = []
    for file in files:
        res = requests.get(file["url"])
        if res.status_code != 200:
            continue
        img = Image.open(io.BytesIO(res.content))
        temp_file = NamedTemporaryFile(dir=temp_dir, suffix=".jpg", delete=False)
        img.save(temp_file.name, format="JPEG")
        # Only constrain the larger dimension
        img_kwargs = (
            {"height": MAX_HEIGHT} if img.height > img.width else {"width": MAX_WIDTH}
        )
        images.append(InlineImage(doc, temp_file.name, **img_kwargs))
    return images


def process_comps_input(comp_submit, mail):
    """
    Input:
    {
        'target_pin': [{}],
        'comparables': [{},{},{},{}]
        'appeal_type': '',
        'pin': '',
        'name': '',
        'email': '',
        'address': '',
        'phone': '',
        'city': '',
        'state': '',
        'zip': '',
        'preferred': ''
    }
    """
    # add property info to allinfo
    if comp_submit["appeal_type"] == "detroit_single_family":
        return submit_detroit_sf(comp_submit, mail)

    elif comp_submit["appeal_type"] == "cook_county_single_family":
        return submit_cook_sf(comp_submit, mail)


def format_baths(baths):
    return {1: "1", 2: "1.5", 3: "2 to 3", 4: "3+"}.get(baths, baths)


def format_exterior(exterior):
    return {
        1: "Siding",
        2: "Brick/other",
        3: "Brick",
        4: "Other",
    }.get(exterior, exterior)


def format_distance(distance):
    return round(distance / 1609.344, 2)


def format_stories(stories):
    return {
        1: "1 to 1.5",
        2: "1.5 to 2.5",
        3: "3+",
    }.get(stories, stories)
