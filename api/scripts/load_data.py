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
