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
    elif region == "cook":
        model = CookParcel
        age_dif = 15
        build_dif = (0.1 * multiplier) * targ["building_sq_ft"].values[0]
        land_dif = (0.1 * multiplier) * targ["land_sq_ft"].values[0]
        distance = MILE_IN_METERS * multiplier

    # construct query
    pin_val = targ["pin"].values[0]

    # Not using a query for the absolute value on the diff so that we can take advantage
    # of the compound index scan, which isn't triggered for abs()
    query_filters = [
        model.pin != pin_val,
        *min_max_query(model, "age", int, targ["age"].values[0], age_dif),
    ]

    # TODO: Handle nulls more gracefully, should be fixed when moving away from pandas
    # TODO: sales_comps never used
    if sales_comps:
        query_filters.extend(
            [
                model.sale_price is not None,
                model.sale_price
                <= (targ["assessed_value"].values[0] or 0) * 3 + 1000 * multiplier,
                model.sale_year >= 2019,
                model.sale_price > 500,
            ]
        )

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
                model.exterior == int(targ["exterior"].values[0] or 0),
            ]
        )
    elif region == "cook":
        prop_class = targ["property_class"].values[0]
        one_story_classes = ["202", "203", "204"]
        two_story_classes = ["205", "206", "207", "208", "209"]
        prop_class_query = model.property_class == prop_class
        if prop_class in one_story_classes:
            prop_class_query = model.property_class.in_(one_story_classes)
        if prop_class in two_story_classes:
            prop_class_query = model.property_class.in_(two_story_classes)

        query_filters.extend(
            [
                # TODO: Neighborhood, but not loaded
                prop_class_query,
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
            ]
        )
        # If not stucco (4) then include this filter
        exterior_value = int(targ["exterior"].values[0] or 0)
        if exterior_value != 4:
            query_filters.append(model.exterior == exterior_value)
    else:
        raise Exception("Invalid Region for Comps")

    distance_subquery = (
        db.session.query(
            model,
            ST_DistanceSphere(model.geom, targ["geom"][0]).label("distance"),
        )
        .filter(*query_filters)
        .subquery()
    )
    model_alias = aliased(model, distance_subquery)

    region_dist_weighting = 2 if region == "cook" else 1
    # TODO: dist_weight 1, valuation weight 3, neighborhood match detroit
    diff_score = (
        (literal_column("distance") / MILE_IN_METERS) * region_dist_weighting
    ) + func.abs(model_alias.age - int(targ["age"].values[0] or 0)) / 15

    if region == "detroit":
        diff_score = (
            diff_score
            + func.abs(
                model_alias.total_floor_area
                - float(targ["total_floor_area"].values[0] or 0)
            )
            / 100
            - (model_alias.neighborhood == targ["neighborhood"].values[0]).cast(Integer)
        )
    elif region == "cook":
        diff_score = (
            diff_score
            + (
                func.abs(
                    model_alias.building_sq_ft
                    - float(targ["building_sq_ft"].values[0] or 0)
                )
                / (float(targ["building_sq_ft"].values[0] or 0) * 0.10)
            )
            + (
                func.abs(
                    model_alias.land_sq_ft - float(targ["land_sq_ft"].values[0] or 0)
                )
                / (float(targ["land_sq_ft"].values[0] or 0) * 0.10)
            )
        )

    query_limit = 30 if region == "cook" else 10
    query = (
        db.session.query(
            aliased(model, distance_subquery),
            distance_subquery.c.distance,
            diff_score.label("diff_score"),
        )
        .filter(literal_column("distance") < distance)
        .order_by(literal_column("diff_score"))
        .limit(query_limit)
    )

    result = pd.DataFrame(
        [{**m.as_dict(), "distance": d, "diff_score": s} for (m, d, s) in query]
    )

    if region == "detroit":
        return targ, result
    elif region == "cook":
        return targ, result


def find_comps(targ, region, sales_comps, multiplier=4):
    new_targ, cur_comps = calculate_comps(targ, region, sales_comps, multiplier)
    # TODO: Fix this check
    if multiplier > 4:  # no comps found within maximum search area---hault
        raise Exception("Comparables not found with given search")
    else:  # return best comps
        return new_targ, cur_comps


# Using this rather than func.abs to make sure compound index is used
def min_max_query(model, attr, type_, value, diff):
    if value is None:
        return []
    return [
        getattr(model, attr) >= type_(value) - diff,
        getattr(model, attr) <= type_(value) + diff,
    ]
