import csv
import os
import sys
from datetime import datetime

import geopandas as gpd
import pandas as pd
import pyreadr
from sqlalchemy import text

from api.api import app
from api.db import db
from api.models import CookParcel, DetroitParcel

DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database"
)

current_year = datetime.now().year

with app.app_context():
    db.session.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
    db.session.commit()
    db.create_all()
    db.session.commit()


def load_cook():
    with open(os.path.join(DATA_DIR, "cook.csv"), "r") as f:
        cook_parcels = []
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            # Skip vacant land
            if row["class"].strip() in ["100", "200"]:
                continue
            sale_price = (
                float(row["sale_price"])
                if row["sale_price"] not in ["", "NA"]
                else None
            )
            building_sq_ft = float(row["building_sqft"] or 0)
            land_sq_ft = float(row["land_sqft"] or 0)
            total_sq_ft = building_sq_ft + land_sq_ft
            price_per_sq_ft = None
            if sale_price:
                price_per_sq_ft = sale_price / total_sq_ft
            point = None
            if row["longitude"] and row["latitude"]:
                point = f"POINT({row['longitude']} {row['latitude']})"
            year_built = None
            age = None
            if row["year_built"]:
                year_built = int(row["year_built"])
                age = 2024 - year_built
            cook_parcels.append(
                CookParcel(
                    id=idx,
                    pin=row["pin"],
                    street_number=row["st_num"],
                    street_name=row["st_name"],
                    sale_price=sale_price,
                    sale_year=row["year"].replace(".0", "") or None,
                    assessed_value=row["certified_tot"]
                    if row["certified_tot"]
                    else None,
                    property_class=row["class"],
                    age=age,
                    year_built=year_built,
                    building_sq_ft=building_sq_ft,
                    land_sq_ft=land_sq_ft,
                    price_per_sq_ft=price_per_sq_ft,
                    rooms=row["num_rooms"] or None,
                    bedrooms=row["num_bedrooms"] or None,
                    exterior=row["exterior"].replace(".0", "")
                    if row["exterior"]
                    else None,
                    stories=row["stories_recode"] or None,
                    basement=row["basement_recode"] == "True",
                    garage=row["garage_indicator"] not in ["False", ""],
                    geom=point,
                )
            )
        with app.app_context():
            db.session.bulk_save_objects(cook_parcels)
            db.session.commit()


def load_detroit():
    with open(os.path.join(DATA_DIR, "detroit.csv"), "r") as f:
        detroit_parcels = []
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            point = None
            if row["Longitude"] not in ["", "NA"]:
                point = f"POINT({row['Longitude']} {row['Latitude']})"
            sale_price = float(row["Sale Price"]) if row["Sale Price"] != "" else None
            total_sq_ft = float(row["total_squa"]) if row["total_squa"] != "" else None
            price_per_sq_ft = None
            if sale_price and total_sq_ft and total_sq_ft > 0:
                price_per_sq_ft = sale_price / total_sq_ft
            year_built = (
                int(row["resb_yearbuilt"]) if row["resb_yearbuilt"] != "" else None
            )
            age = None
            if year_built:
                age = current_year - year_built
            sale_date = None
            sale_year = None
            if row["Sale Date"]:
                sale_date = datetime.strptime(row["Sale Date"][:10], "%Y-%m-%d").date()
                sale_year = sale_date.year
            detroit_parcels.append(
                DetroitParcel(
                    id=idx,
                    pin=row["parcel_num"],
                    street_number=row["st_num"],
                    street_name=row["st_name"],
                    neighborhood=row["ECF"],
                    assessed_value=float(row["ASSESSEDVALUETENTATIVE"]),
                    taxable_value=float(row["TAXABLEVALUETENTATIVE"]),
                    sale_price=sale_price,
                    sale_date=sale_date,
                    sale_year=sale_year,
                    year_built=year_built,
                    age=age,
                    effective_age=int(row["resb_effage"])
                    if row["resb_effage"]
                    else None,
                    total_sq_ft=total_sq_ft,
                    total_acreage=float(row["TOTALACREAGE"]) or None,
                    total_floor_area=row["total_floor_area"]
                    if row["total_floor_area"] not in ["", "NA"]
                    else None,
                    price_per_sq_ft=price_per_sq_ft,
                    stories=row["heightcat"].replace(".0", "")
                    if row["heightcat"] not in ["", "-1"]
                    else None,
                    baths=row["bathcat"].replace(".0", "")
                    if row["bathcat"] not in ["", "-1"]
                    else None,
                    exterior=row["extcat"].replace(".0", "")
                    if (row["extcat"] not in ["-1", ""])
                    else None,
                    basement="1" in row.get("has_basement", ""),
                    garage="1" in row.get("has_garage", ""),
                    taxpayer=row["TAXPAYER1"],
                    homestead_exemption=row["TAXPAYER1"],
                    geom=point,
                )
            )
        with app.app_context():
            db.session.bulk_save_objects(detroit_parcels)
            db.session.commit()


def load_milwaukee():
    data = pyreadr.read_r(os.path.join(DATA_DIR, "mke.RData"))
    parcel_geom_df = gpd.read_file(os.path.join(DATA_DIR, "mke-parcel-points.geojson"))
    value_df = data["PropertyValuesProd"][data["PropertyValuesProd"]["YearID"] == 2024][
        ["ParcelID", "YearID", "TotalAssessedValue"]
    ]
    parcel_df = data["PropertyCharacteristics2024"].merge(
        value_df, on=["ParcelID"], how="left"
    )
    sale_df = data["SalesProduction"].loc[
        data["SalesProduction"]["SalesValidity"] != "I"
    ]
    sale_df = sale_df.sort_values(
        by=["ParcelID", "SaleDate"], ascending=[True, False]
    ).drop_duplicates(subset="ParcelID", keep="first")[
        ["ParcelID", "SaleDate", "SalePrice", "SalesValidity"]
    ]

    parcel_df = parcel_geom_df.merge(
        parcel_df.merge(sale_df, on=["ParcelID"], how="left"),
        on=["ParcelID"],
        how="left",
    ).rename(
        columns={
            "ParcelID": "pin",
            "StreetNumb": "street_number",
            "TotalAssessedValue": "assessed_value",
            "SaleDate": "sale_date",
            "SalePrice": "sale_price",
            "SalesValidity": "sale_validity",
            "YearBuilt": "year_built",
            "Kitchen": "kitchen",
            "FullBath": "baths",
            "HalfBath": "half_baths",
            "BedRooms": "bedrooms",
            "Neighborhood": "neighborhood",
            "BuildingSequence": "building_sequence",
            "PhysicalCondition": "condition",
            "RatingKitchen": "rating_kitchen",
            "RatingBath": "rating_bath",
            "RatingHalfBath": "rating_half_bath",
            "Quality": "quality",
            "TotalFinishedArea": "total_sq_ft",
            "BuildingCategory": "building_category",
            "BuildingType": "building_type",
            "ImprovedStatus": "improved_status",
            "geometry": "geom",
        }
    )
    parcel_df = parcel_df[parcel_df.geom.is_valid]
    parcel_df["id"] = parcel_df.reset_index().index
    parcel_df["street_name"] = parcel_df.apply(
        lambda row: " ".join(
            [
                str(val)
                for val in row[["StreetDire", "StreetName", "StreetType"]]
                if pd.notnull(val)
            ]
        ),
        axis=1,
    )
    parcel_df["sale_year"] = parcel_df["sale_date"].dt.year
    parcel_df["age"] = parcel_df["year_built"].apply(
        lambda y: current_year - y if y else y
    )
    parcel_df["price_per_sq_ft"] = (
        parcel_df["assessed_value"] / parcel_df["total_sq_ft"]
    )
    parcel_df = parcel_df.drop(
        columns=["StreetDire", "StreetName", "StreetType", "PropertyID", "YearID"]
    ).set_geometry("geom")

    with app.app_context():
        parcel_df.to_postgis("milwaukee", db.engine, if_exists="replace", index=False)


if __name__ == "__main__":
    if len(sys.argv) == 1:
        load_cook()
        load_detroit()
        load_milwaukee()
    elif sys.argv[1] == "cook":
        load_cook()
    elif sys.argv[1] == "detroit":
        load_detroit()
    elif sys.argv[1] == "mke":
        load_milwaukee()
