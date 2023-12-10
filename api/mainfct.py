import numpy as np
import pandas as pd
from rapidfuzz import process

from .computils import find_comps
from .dataqueries import address_candidates_query, get_pin
from .submitappeal import submit_cook_sf, submit_detroit_sf


# TODO: Pydantic to enforce types on input? https://pypi.org/project/Flask-Pydantic/
def address_candidates(input_data, cutoff_info):
    """
    Returns address candidates
    """
    output = {}
    st_num = input_data["street_number"]
    st_name = input_data["street_name"]

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
    # TODO: sales_comps is never used
    """
    Returns comparables
    """
    target_pin = input_data["pin"]

    # set constants
    if input_data["appeal_type"] == "detroit_single_family":
        sales_comps = True
        region = "detroit"
        targ = get_pin(region, target_pin)
        if targ.empty:
            raise Exception("Invalid PIN")
        targ["Distance"] = 0
    elif input_data["appeal_type"] == "cook_county_single_family":
        sales_comps = False
        region = "cook"
        targ = get_pin(region, target_pin)
        if targ.empty:
            raise Exception("Invalid PIN")
        targ["Distance"] = 0

    # call comp funtion
    new_targ, cur_comps = find_comps(targ, region, sales_comps)

    # TODO: Below here is the real analysis code
    # TODO: Enum to represent regions
    # process comps

    new_targ = new_targ.round(2)
    cur_comps = cur_comps.round(2)

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
    output["pinav"] = new_targ.assessed_value.mean()

    return output


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
