import csv
import os
from datetime import datetime

from sqlalchemy import text

from api.api import app
from api.db import db
from api.models import CookParcel, DetroitParcel

DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database"
)

with app.app_context():
    db.session.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
    db.session.commit()
    db.create_all()
    db.session.commit()


if __name__ == "__main__":
    current_year = datetime.now().year
    with open(os.path.join(DATA_DIR, "cooksf2.csv"), "r") as f:
        cook_parcels = []
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            # Skip vacant land
            if row["Property Class"].strip() in ["100", "200"]:
                continue
            sale_price = (
                float(row["Sale Price"])
                if row["Sale Price"] not in ["", "NA"]
                else None
            )
            building_sq_ft = float(row["Building Square Feet"] or 0)
            land_sq_ft = float(row["Land Square Feet"] or 0)
            total_sq_ft = building_sq_ft + land_sq_ft
            price_per_sq_ft = None
            if sale_price:
                price_per_sq_ft = sale_price / total_sq_ft
            point = None
            if row["Longitude"] and row["Latitude"]:
                point = f"POINT({row['Longitude']} {row['Latitude']})"
            cook_parcels.append(
                CookParcel(
                    id=idx,
                    pin=row["PIN"],
                    street_number=row["st_num"],
                    street_name=row["st_name"],
                    sale_price=sale_price,
                    sale_year=row["Sale Year"] or None,
                    assessed_value=row["CERTIFIED"] if row["CERTIFIED"] else None,
                    property_class=row["Property Class"],
                    age=row["Age"] or None,
                    building_sq_ft=building_sq_ft,
                    land_sq_ft=land_sq_ft,
                    price_per_sq_ft=price_per_sq_ft,
                    rooms=row["Rooms"] or None,
                    bedrooms=row["Bedrooms"] or None,
                    exterior=row["Wall Material"] if row["Wall Material"] else None,
                    stories=row["stories_recode"] or None,
                    basement=row["basement_recode"] == "1",
                    garage=row["Garage indicator"] == "1",
                    geom=point,
                )
            )
        with app.app_context():
            db.session.bulk_save_objects(cook_parcels)
            db.session.commit()

    with open(os.path.join(DATA_DIR, "detroit_sf_2022sales_2023avtent.csv"), "r") as f:
        detroit_parcels = []
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            point = None
            if row["Longitude"] != "NA":
                point = f"POINT({row['Longitude']} {row['Latitude']})"
            sale_price = (
                float(row["Sale Price"])
                if row["Sale Price"] not in ["", "NA"]
                else None
            )
            total_sq_ft = float(row["total_squa"])
            price_per_sq_ft = None
            if sale_price:
                price_per_sq_ft = sale_price / total_sq_ft
            year_built = int(row["year_built"]) if row["year_built"] != "NA" else None
            age = None
            if year_built:
                age = current_year - year_built
            detroit_parcels.append(
                DetroitParcel(
                    id=idx,
                    pin=row["parcel_num"],
                    street_number=row["st_num"],
                    street_name=row["st_name"],
                    neighborhood=row["Neighborhood"],
                    assessed_value=float(row["assessed_v"]),
                    taxable_value=float(row["taxable_va"]),
                    sale_price=sale_price,
                    sale_date=datetime.strptime(
                        row["Sale Date"][:10], "%Y-%m-%d"
                    ).date()
                    if row["Sale Date"] != "NA"
                    else None,
                    sale_year=row["SALE_YEAR"] if row["SALE_YEAR"] != "NA" else None,
                    year_built=year_built,
                    age=age,
                    total_sq_ft=total_sq_ft,
                    total_acreage=row["total_acre"] or None,
                    total_floor_area=row["total_floor_area"]
                    if row["total_floor_area"] != "NA"
                    else None,
                    price_per_sq_ft=price_per_sq_ft,
                    stories=row["heightcat"] if row["heightcat"] != "-1" else None,
                    baths=row["bathcat"] if row["bathcat"] != "-1" else None,
                    exterior=row["extcat"] if row["extcat"] != "-1" else None,
                    basement=row["has_basement"] == "1",
                    garage=row["has_garage"] == "1",
                    taxpayer=row["taxpayer_1"],
                    homestead_exemption=row["homestead_"],
                    geom=point,
                )
            )
        with app.app_context():
            db.session.bulk_save_objects(detroit_parcels)
            db.session.commit()
