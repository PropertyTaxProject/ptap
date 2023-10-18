import csv
import os

from api.api import application
from api.db import db
from api.models import CookParcel, DetroitParcel

DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database"
)

with application.app_context():
    db.create_all()


if __name__ == "__main__":
    with open(os.path.join(DATA_DIR, "cooksf2.csv"), "r") as f:
        cook_parcels = []
        reader = csv.DictReader(f)
        for row in reader:
            cook_parcels.append(
                CookParcel(
                    pin=row["PIN"],
                    street_number=row["st_num"],
                    street_name=row["st_name"],
                    sale_price=float(row["Sale Price"]) if row["Sale Price"] else None,
                    sale_year=row["Sale Year"],
                    property_class=row["Property Class"],
                    age=row["Age"],
                    building_sq_ft=row["Building Square Feet"],
                    land_sq_ft=row["Land Square Feet"],
                    rooms=row["Rooms"],
                    bedrooms=row["Bedrooms"],
                    certified=row["CERTIFIED"],
                    wall_material=row["Wall Material"],
                    stories=row["stories_recode"],
                    basement=row["basement_recode"],
                    garage=row["Garage indicator"] == "1",
                    geom=f"POINT({row['Longitude']} {row['Latitude']})",
                )
            )
        with application.app_context():
            db.session.add_all(cook_parcels)
            db.session.commit()

    with open(os.path.join(DATA_DIR, "detroit_sf_2022sales_2023avtent.csv"), "r") as f:
        detroit_parcels = []
        reader = csv.DictReader(f)
        for row in reader:
            point = None
            if row["Longitude"] != "NA":
                point = f"POINT({row['Longitude']} {row['Latitude']})"
            detroit_parcels.append(
                DetroitParcel(
                    pin=row["parcel_num"],
                    street_number=row["st_num"],
                    street_name=row["st_name"],
                    sale_price=float(row["Sale Price"])
                    if row["Sale Price"] != "NA"
                    else None,
                    sale_year=row["SALE_YEAR"] if row["SALE_YEAR"] != "NA" else None,
                    year_built=row["year_built"] if row["year_built"] != "NA" else None,
                    total_floor_area=row["total_floor_area"]
                    if row["total_floor_area"] != "NA"
                    else None,
                    extcat=row["extcat"] if row["extcat"] != "-1" else None,
                    geom=point,
                )
            )
        with application.app_context():
            db.session.add_all(detroit_parcels)
            db.session.commit()
