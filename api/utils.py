import io
import json
import os
from datetime import datetime
from tempfile import NamedTemporaryFile, TemporaryDirectory

import boto3
import pytz
import requests
from docx.shared import Inches
from docxtpl import DocxTemplate, InlineImage
from PIL import Image
from pillow_heif import register_heif_opener


# TODO: Just use that as the request
def get_region(request_data):
    return "detroit" if "detroit" in request_data.get("appeal_type", "") else "cook"


def render_agreement(name, parcel):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    doc = DocxTemplate(
        os.path.join(base_dir, "templates", "docs", "representation_agreement.docx")
    )

    timestamp = datetime.now(pytz.timezone("America/Detroit"))
    # TODO: Only currently supports Detroit
    city_state = {"city": "Detroit", "state": "MI"}
    doc.render(
        {
            "agreement_date": timestamp.strftime("%Y-%m-%d"),
            "partner_name": name,
            "parcel_num": parcel.pin,
            "street_address": f"{parcel.street_number} {parcel.street_name}",
            **city_state,
        }
    )

    file_stream = io.BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)
    return file_stream.getvalue()


def process_doc_images(doc, files, temp_dir):
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


def render_doc_to_bytes(doc, context, files):
    """Handle common processing methods for rendering a doc, including images"""
    with TemporaryDirectory() as temp_dir:
        images = process_doc_images(doc, files, temp_dir)
        doc.render({**context, "images": images, "has_images": len(images) > 0})
        # also save a byte object to return
        file_stream = io.BytesIO()
        doc.save(file_stream)  # save to stream
        file_stream.seek(0)  # reset pointer to head
    return file_stream


def log_step(logger, data):
    # TODO: Seems like some LOG_STEPs are getting ignored
    logger.info(f"LOG_STEP: {json.dumps(data)}")
    # Only running for specific steps to reduce latency
    if data.get("step") in ["agreement", "submit"]:
        update_s3_submission(data)


def update_s3_submission(data):
    if not data.get("uuid") or not os.getenv("S3_SUBMISSIONS_BUCKET"):
        return
    timestamp = datetime.now(pytz.timezone("America/Detroit"))
    data["timestamp"] = timestamp.strftime("%Y-%m-%dT%H:%M:%SZ")
    timestamp_path = timestamp.strftime("%Y/%m/%d")

    s3 = boto3.client("s3")
    s3.put_object(
        Body=json.dumps(data),
        Bucket=os.getenv("S3_SUBMISSIONS_BUCKET"),
        Key=f"submissions/{timestamp_path}/{data.get('uuid')}.json",
    )


def clean_cook_parcel(parcel):
    meters_in_mile = 1609.344
    exterior_map = {1: "Wood", 2: "Masonry", 3: "Wood/Masonry", 4: "Stucco"}
    if "distance" in parcel:
        parcel["distance"] = "{:0.2f}mi".format(parcel["distance"] / meters_in_mile)
    return {
        **parcel,
        "assessed_value": "{:,.0f}".format(parcel["assessed_value"]),
        "building_sq_ft": "{:,.0f}".format(parcel["building_sq_ft"]),
        "basement": "Yes" if parcel["basement"] else "No",
        "exterior": exterior_map.get(parcel["exterior"]),
        "garage": "Yes" if parcel["garage"] else "No",
    }
