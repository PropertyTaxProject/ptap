import pandas as pd
from geoalchemy2.functions import ST_DistanceSphere
from sqlalchemy import Integer, func, literal_column
from sqlalchemy.orm import aliased

from .db import db
from .models import CookParcel, DetroitParcel

MILE_IN_METERS = 1609.34


def calculate_comps(targ, region, sales_comps, multiplier):
    if region == "detroit":
        model = DetroitParcel
        floor_dif = 100 * multiplier
        age_dif = 15 * multiplier
        distance = MILE_IN_METERS * multiplier
        debug = False
    elif region == "cook":
        model = CookParcel
        age_dif = 15 * multiplier
        build_dif = 0.10 * targ["building_sq_ft"].values[0] * multiplier
        land_dif = 0.25 * targ["land_sq_ft"].values[0] * multiplier
        rooms_dif = 1.5 * multiplier
        bedroom_dif = 1.5 * multiplier
        av_dif = 0.5 * targ["assessed_value"].values[0] * multiplier
        distance = MILE_IN_METERS * multiplier  # miles
        debug = True

    # construct query
    pin_val = targ["pin"].values[0]

    # Not using a query for the absolute value on the diff so that we can take advantage
    # of the compound index scan, which isn't triggered for abs()
    query_filters = [
        model.pin != pin_val,
        *min_max_query(model, "age", int, targ["age"].values[0], age_dif),
    ]

    if sales_comps:
        query_filters.extend(
            [
                model.sale_price is not None,
                model.sale_price
                <= targ["assessed_value"].values[0] * 3 + 1000 * multiplier,
                model.sale_year >= 2019,
                model.sale_price > 500,
            ]
        )
    if debug:
        print("~~~" + region + "~~~")
        print(targ["pin"].values[0] + " |||| multiplier " + str(multiplier))

    if region == "detroit":
        query_filters.extend(
            [
                *min_max_query(
                    model,
                    "total_floor_area",
                    float,
                    targ["total_floor_area"].values[0],
                    floor_dif,
                ),
                model.exterior == int(targ["exterior"].values[0]),
            ]
        )
    elif region == "cook":
        query_filters.extend(
            [
                model.property_class == targ["property_class"].values[0],
                *min_max_query(
                    model,
                    "building_sq_ft",
                    float,
                    targ["building_sq_ft"].values[0],
                    build_dif,
                ),
                *min_max_query(
                    model, "land_sq_ft", float, targ["land_sq_ft"].values[0], land_dif
                ),
                *min_max_query(model, "rooms", int, targ["rooms"].values[0], rooms_dif),
                *min_max_query(
                    model, "bedrooms", int, targ["bedrooms"].values[0], bedroom_dif
                ),
                *min_max_query(
                    model,
                    "assessed_value",
                    int,
                    targ["assessed_value"].values[0],
                    av_dif,
                ),
                model.exterior == int(targ["exterior"].values[0]),
                model.stories == int(targ["stories"].values[0]),
                model.basement == bool(targ["basement"].values[0]),
                model.garage == bool(targ["garage"].values[0]),
            ]
        )
    else:
        raise Exception("Invalid Region for Comps")

    if debug:
        print(query_filters)

    distance_subquery = (
        db.session.query(
            model,
            ST_DistanceSphere(model.geom, targ["geom"][0]).label("distance"),
        )
        .filter(*query_filters)
        .subquery()
    )
    model_alias = aliased(model, distance_subquery)

    # TODO: dist_weight 1, valuation weight 3, neighborhood match detroit
    diff_score = (
        literal_column("distance") / MILE_IN_METERS
        + func.abs(model_alias.age - int(targ["age"].values[0])) / 15
    )

    if region == "detroit":
        diff_score = (
            diff_score
            + func.abs(
                model_alias.total_floor_area - float(targ["total_floor_area"].values[0])
            )
            / 100
            - (model_alias.neighborhood == targ["neighborhood"].values[0]).cast(Integer)
        )
    elif region == "cook":
        diff_score = (
            diff_score
            + (
                func.abs(
                    model_alias.building_sq_ft - float(targ["building_sq_ft"].values[0])
                )
                / (float(targ["building_sq_ft"].values[0]) * 0.10)
            )
            + (
                func.abs(model_alias.land_sq_ft - float(targ["land_sq_ft"].values[0]))
                / (float(targ["land_sq_ft"].values[0]) * 0.10)
            )
            + func.abs(model_alias.rooms - int(targ["rooms"].values[0])) / 1.5
            + func.abs(model_alias.bedrooms - int(targ["bedrooms"].values[0])) / 1.5
            + (
                func.abs(
                    model_alias.assessed_value - float(targ["assessed_value"].values[0])
                )
                / (float(targ["assessed_value"].values[0]) * 0.5)
            )
        )

    query = (
        db.session.query(
            aliased(model, distance_subquery),
            distance_subquery.c.distance,
            diff_score.label("diff_score"),
        )
        .filter(literal_column("distance") < distance)
        .order_by(literal_column("diff_score"))
        .limit(10)
    )

    result = pd.DataFrame(
        [{**m.as_dict(), "distance": d, "diff_score": s} for (m, d, s) in query]
    )

    if region == "detroit":
        return targ, result
    elif region == "cook":
        return targ, result


def find_comps(targ, region, sales_comps, multiplier=1):
    multiplier = 4
    new_targ, cur_comps = calculate_comps(targ, region, sales_comps, multiplier)
    # TODO: Fix this check
    if multiplier > 4:  # no comps found within maximum search area---hault
        raise Exception("Comparables not found with given search")
    else:  # return best comps
        return new_targ, cur_comps


# Using this rather than func.abs to make sure compound index is used
def min_max_query(model, attr, type_, value, diff):
    return [
        getattr(model, attr) >= type_(value) - diff,
        getattr(model, attr) <= type_(value) + diff,
    ]
