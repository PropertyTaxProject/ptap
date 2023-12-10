import io
from tempfile import NamedTemporaryFile, TemporaryDirectory

import requests
from docx.shared import Inches
from docxtpl import InlineImage
from PIL import Image
from pillow_heif import register_heif_opener


# TODO: Just use that as the request
def get_region(request_data):
    return "detroit" if "detroit" in request_data.get("appeal_type") else "cook"


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
