import pandas as pd
from geoalchemy2.functions import ST_Distance
from sqlalchemy import literal_column

from .db import db
from .models import CookParcel, DetroitParcel

MILE_IN_METERS = 1609.34


# TODO: Use this one instead
def calculate_comps_alt(targ, region, sales_comps, multiplier):
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
    query_filters = [
        model.pin != pin_val,
        model.age >= int(targ["age"].values[0]) - age_dif,
        model.age <= int(targ["age"].values[0]) + age_dif,
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
                model.total_floor_area
                >= float(targ["total_floor_area"].values[0]) - floor_dif,
                model.total_floor_area
                <= float(targ["total_floor_area"].values[0]) + floor_dif,
                model.exterior_category == int(targ["exterior_category"].values[0]),
            ]
        )
    elif region == "cook":
        query_filters.extend(
            [
                model.property_class == targ["property_class"].values[0],
                model.building_sq_ft
                >= float(targ["building_sq_ft"].values[0]) - build_dif,
                model.building_sq_ft
                <= float(targ["building_sq_ft"].values[0]) + build_dif,
                model.land_sq_ft >= float(targ["land_sq_ft"].values[0]) - land_dif,
                model.land_sq_ft <= float(targ["land_sq_ft"].values[0]) + land_dif,
                model.rooms >= int(targ["rooms"].values[0]) - rooms_dif,
                model.rooms <= int(targ["rooms"].values[0]) + rooms_dif,
                model.bedrooms >= int(targ["bedrooms"].values[0]) - bedroom_dif,
                model.bedrooms <= int(targ["bedrooms"].values[0]) + bedroom_dif,
                model.assessed_value >= int(targ["assessed_value"].values[0]) - av_dif,
                model.assessed_value <= int(targ["assessed_value"].values[0]) + av_dif,
                model.wall_material == targ["wall_material"].values[0],
                model.stories == int(targ["stories"].values[0]),
                model.basement == bool(targ["basement"].values[0]),
                model.garage == bool(targ["garage"].values[0]),
            ]
        )
    else:
        raise Exception("Invalid Region for Comps")

    if debug:
        print(query_filters)

    result = pd.DataFrame(
        [
            {**m.as_dict(), "distance": d}
            for (m, d) in db.session.query(
                model, ST_Distance(model.geom, targ["geom"][0], 1).label("distance")
            ).filter(*query_filters, literal_column("distance") < distance)
        ]
    )

    if region == "detroit":
        return targ, result
    elif region == "cook":
        return targ, result


def find_comps(targ, region, sales_comps, multiplier=1):
    new_targ, cur_comps = calculate_comps_alt(targ, region, sales_comps, multiplier)
    if multiplier > 8:  # no comps found within maximum search area---hault
        raise Exception("Comparables not found with given search")
    elif cur_comps.shape[0] < 10:  # find more comps
        # TODO: There has to be a more efficient way of finding this than repeating it
        return find_comps(targ, region, sales_comps, multiplier * 1.25)
    else:  # return best comps
        return new_targ, cur_comps
