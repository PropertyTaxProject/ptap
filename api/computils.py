import pandas as pd
from geoalchemy2.functions import ST_Distance
from sqlalchemy import literal_column

from .dataqueries import query_on, run_comps_query
from .db import db
from .models import CookParcel, DetroitParcel

MILE_IN_METERS = 1609.34


def calculate_comps(targ, region, sales_comps, multiplier):
    ###
    # constants
    if region == "detroit":
        # square_dif = 200 * multiplier
        # acre_dif = .05 * multiplier
        floor_dif = 100 * multiplier
        age_dif = 15 * multiplier
        lat_dif = 0.02 * multiplier
        lon_dif = 0.02 * multiplier
        distance_filter = 2 * multiplier  # miles
        exterior = "Match"  # (1 siding, 2 brick/other, 3 brick, 4 other)
        # basement = 'Match'
        # garage = 'Match'
        # bath = 'Match' #(1 1.0, 2 1.5, 3 2 to 3, 4 3+)
        # height = 'Match' #(1 1 to 1.5, 2 1.5 to 2.5, 3 3+)
        pin_name = "parcel_num"
        sale_name = "Sale Price"
        debug = False
    elif region == "cook":
        age_dif = 15 * multiplier
        build_dif = 0.10 * targ["Building Square Feet"].values[0] * multiplier
        land_dif = 0.25 * targ["Land Square Feet"].values[0] * multiplier
        rooms_dif = 1.5 * multiplier
        bedroom_dif = 1.5 * multiplier
        av_dif = 0.5 * targ["CERTIFIED"].values[0] * multiplier
        wall_material = (
            "Match"  # wall material 1=wood, 2=masonry, 3=wood&masonry, 4=stucco
        )
        stories = "Match"  # 1, 2, or 3 stories
        basement = "Match"  # 1 full, 0 partial
        garage_ind = "Match"  # 1 any garage 0 no garage
        distance_filter = 1 * multiplier  # miles
        pin_name = "PIN"
        sale_name = "Sale Price"
        debug = True

    # construct query
    pin_val = targ[pin_name].values[0]
    baseq = "SELECT * FROM " + region + " WHERE " + pin_name + ' != "' + pin_val + '"'

    if sales_comps:
        baseq += ' AND "' + sale_name + '" IS NOT NULL'
        baseq += (
            ' AND "'
            + sale_name
            + '" <= '
            + str(targ["assessed_v"].values[0] * 3 + 1000 * multiplier)
        )
        baseq += ' AND "SALE_YEAR" >= 2019'
        baseq += ' AND "' + sale_name + '" > 500'
    if debug:
        print("~~~" + region + "~~~")
        print(targ[pin_name].values[0] + " |||| multiplier " + str(multiplier))

    if region == "detroit":
        baseq += query_on("year_built", targ["year_built"].values[0], age_dif, 3)
        baseq += query_on(
            "total_floor_area", targ["total_floor_area"].values[0], floor_dif, 3
        )
        baseq += query_on("Longitude", targ["Longitude"].values[0], lon_dif, 3)
        baseq += query_on("Latitude", targ["Latitude"].values[0], lat_dif, 3)

        # baseq += query_on('total_acre', targ['total_acre'].values[0], acre_dif, 3)
        # baseq += query_on('total_squa', targ['total_squa'].values[0], square_dif, 3)
        # baseq += query_on('heightcat', targ['heightcat'].values[0], height, 1)
        baseq += query_on(
            "extcat",
            targ["extcat"].values[0],
            exterior,
            1,
        )
        # baseq += query_on('bathcat', targ['bathcat'].values[0], bath, 1)
        # baseq += query_on('has_basement', targ['has_basement'].values[0], basement, 1)
        # baseq += query_on('has_garage', targ['has_garage'].values[0], garage, 1)
    elif region == "cook":
        baseq += query_on(
            "Property Class", targ["Property Class"].values[0], "Match", 1
        )
        baseq += query_on("Age", targ["Age"].values[0], age_dif, 3)
        baseq += query_on(
            "Building Square Feet", targ["Building Square Feet"].values[0], build_dif, 3
        )
        baseq += query_on(
            "Land Square Feet", targ["Land Square Feet"].values[0], land_dif, 3
        )
        baseq += query_on("Rooms", targ["Rooms"].values[0], rooms_dif, 3)
        baseq += query_on("Bedrooms", targ["Bedrooms"].values[0], bedroom_dif, 3)
        baseq += query_on("CERTIFIED", targ["CERTIFIED"].values[0], av_dif, 3)

        baseq += query_on(
            "Wall Material", targ["Wall Material"].values[0], wall_material, 1
        )
        baseq += query_on(
            "stories_recode", targ["stories_recode"].values[0], stories, 1
        )
        baseq += query_on(
            "basement_recode", targ["basement_recode"].values[0], basement, 1
        )
        baseq += query_on(
            "Garage indicator", targ["Garage indicator"].values[0], garage_ind, 1
        )
    else:
        raise Exception("Invalid Region for Comps")

    if debug:
        print(baseq)
    # run query and distance
    new = run_comps_query(
        baseq,
        (targ["Longitude"].values[0], targ["Latitude"].values[0]),
        distance_filter,
    )
    if debug:
        print(new.shape)
    if region == "detroit":
        return (prettify_detroit(targ, sales_comps), prettify_detroit(new, sales_comps))
    elif region == "cook":
        return (prettify_cook(targ, sales_comps), prettify_cook(new, sales_comps))


# TODO: Use this one instead
def calculate_comps_alt(targ, region, sales_comps, multiplier):
    if region == "detroit":
        model = DetroitParcel
        floor_dif = 100 * multiplier
        age_dif = 15 * multiplier
        distance = MILE_IN_METERS * multiplier
        pin_name = "pin"
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
        pin_name = "pin"
        debug = True

    # construct query
    pin_val = targ["pin_name"].values[0]
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


def prettify_cook(data, sales_comps):
    # cook_sf_cols = [
    #     "PIN",
    #     "Property Address",
    #     "Property Class",
    #     "Age",
    #     "Building Square Feet",
    #     "Land Square Feet",
    #     "Rooms",
    #     "Bedrooms",
    #     "Wall Material",
    #     "stories_recode",
    #     "basement_recode",
    #     "Garage indicator",
    #     "Distance",
    #     "CERTIFIED",
    # ]

    # if sales_comps:
    #     cook_sf_cols = cook_sf_cols + ["Sale Price", "Sale Year"]

    # cook_sf_rename_dict = {
    #     "Property Class": "Class",
    #     "Building Square Feet": "building_sqft",
    #     "Land Square Feet": "land_sqft",
    #     "Bedrooms": "Beds",
    #     "Wall Material": "Exterior",
    #     "stories_recode": "Stories",
    #     "basement_recode": "Basement",
    #     "Garage indicator": "Garage",
    #     "CERTIFIED": "assessed_value",
    #     "Property Address": "Address",
    # }

    # wall_d = {1: "Wood", 2: "Masonry", 3: "Wood/Masonry", 4: "Stucco"}

    # basement_d = {0: "Partial/None", 1: "Full"}

    # garage_d = {0: "None", 1: "Yes"}

    # if data.shape[0] != 0:
    #     data = data[cook_sf_cols].rename(columns=cook_sf_rename_dict)
    #     data = data.replace(
    #         {
    #             "Exterior": wall_d,
    #             "Basement": basement_d,
    #             "Garage": garage_d,
    #         }
    #     )
    return data


def prettify_detroit(data, sales_comps):
    detroit_sf_cols = [
        "pin",
        "address",
        "total_sq_ft",
        "total_acreage",
        "total_floor_area",
        "year_built",
        "stories",
        "exterior_category",
        "baths",
        "garage",
        "basement",
        "assessed_value",
        "Distance",
        "neighborhood",
    ]
    if sales_comps:
        detroit_sf_cols = detroit_sf_cols + [
            "Assessor Market Value",
            "Sale Price",
            "Sale Date",
        ]

    # detroit_sf_rename_dict = {
    #     # "pin": "PIN",
    #     "total_sq_ft": "total_sqft",
    #     "total_floor_area": "Total Floor Area",
    #     "stories": "Stories (not including basement)",
    #     "exterior_category": "Exterior",
    #     "baths": "Baths",
    #     "address": "Address",
    #     "basement": "Basement",
    #     "garage": "Garage",
    #     "year_built": "Age",
    #     "sale_price": "Sale Price",
    #     "sale_date": "Sale Date",
    # }
    # data.rename(columns=detroit_sf_rename_dict, inplace=True)

    # bath_d = {1: "1", 2: "1.5", 3: "2 to 3", 4: "3+"}

    # basement_d = {0: "None", 1: "Yes"}

    # garage_d = {0: "None", 1: "Yes"}

    # exterior_d = {1: "Siding", 2: "Brick/other", 3: "Brick", 4: "Other"}

    # height_d = {
    #     1: "1 to 1.5",
    #     2: "1.5 to 2.5",
    #     3: "3+",
    # }

    if data.shape[0] != 0:
        if sales_comps:
            data["assessor_market_value"] = 2 * data["assessed_value"]
            # data["sale_price_formatted"] = data["sale_price"].apply(
            #     lambda x: "" if x is None or x == "" else "${:0,}".format(round(x))
            # )
            # data["Sale Date"] = data["Sale Date"].str.slice(0, 10)
        # data = data[detroit_sf_cols].rename(columns=detroit_sf_rename_dict)
        # data = data.replace(
        #     {
        #         "Baths": bath_d,
        #         "Basement": basement_d,
        #         "Garage": garage_d,
        #         "Stories (not including basements)": height_d,
        #         "Exterior": exterior_d,
        #     }
        # )

    # breakpoint()
    return data
