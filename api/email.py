import io
import os
from datetime import datetime
from tempfile import NamedTemporaryFile, TemporaryDirectory
from typing import List, Mapping, Optional

import pytz
import requests
import sentry_sdk
from docx.shared import Inches
from docxtpl import DocxTemplate, InlineImage
from flask import render_template
from flask_mail import Mail, Message
from PIL import Image
from pillow_heif import register_heif_opener

from .constants import CURRENT_YEAR, METERS_IN_MILE, WORD_MIMETYPE
from .dto import FileBody, ParcelResponseBody, RequestBody
from .models import ParcelType
from .queries import (
    find_parcel,
    find_parcel_with_distance,
    find_parcels_from_ids_with_distance,
)

gsheet_submission = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class DocumentRenderer:
    document_template = None

    def __init__(
        self, document: DocxTemplate, context: Mapping, images: List[FileBody] = []
    ):
        self.document = document
        self.context = context
        self.images = images

    def render_as_bytes(self) -> bytes:
        with TemporaryDirectory() as temp_dir:
            images = self.process_images(self.document, self.images, temp_dir)
            self.document.render(
                {**self.context, "images": images, "has_images": len(images) > 0}
            )
            file_stream = io.BytesIO()
            self.document.save(file_stream)
            file_stream.seek(0)
        return file_stream.getvalue()

    def process_images(
        self, document: DocxTemplate, files: List[FileBody], temp_dir: str
    ) -> List[InlineImage]:
        """Process images individually after upload"""
        register_heif_opener()

        MAX_WIDTH = Inches(5.5)
        MAX_HEIGHT = Inches(4)
        images = []
        for file in files:
            res = requests.get(file.url)
            if res.status_code != 200:
                continue
            try:
                img = Image.open(io.BytesIO(res.content)).convert("RGB")
            except Exception as e:
                sentry_sdk.capture_exception(e)
                continue
            temp_file = NamedTemporaryFile(dir=temp_dir, suffix=".jpg", delete=False)
            img.save(temp_file.name, format="JPEG")
            # Only constrain the larger dimension
            img_kwargs = (
                {"height": MAX_HEIGHT}
                if img.height > img.width
                else {"width": MAX_WIDTH}
            )
            images.append(InlineImage(document, temp_file.name, **img_kwargs))
        return images


class BaseDocumentMailer:
    document_template: Optional[str] = None

    def __init__(self, body: RequestBody):
        self.body = body
        if self.document_template:
            self.document = DocxTemplate(self.document_template)
        self.region = body.region
        self.target = find_parcel(body.region, body.pin)
        self.comparables = find_parcels_from_ids_with_distance(
            body.region, self.target, body.selected_comparables
        )
        if len(self.comparables) > 0:
            self.comparables_avg_sale_price = sum(
                [comp.sale_price or 0 for comp, _ in self.comparables]
            ) / len(self.comparables)
        else:
            self.comparables_avg_sale_price = 0
        self.primary = None
        self.primary_distance = None
        if body.selected_primary:
            self.primary, self.primary_distance = find_parcel_with_distance(
                body.region, body.selected_primary, self.target
            )

        owner_name = f"{body.user.first_name} {body.user.last_name}"
        self.context_data = {
            "pin": self.target.pin,
            "owner": owner_name,
            "address": f"{body.user.address}",
            "formal_owner": owner_name,
            "target": ParcelResponseBody.from_parcel(self.target),
            "primary": ParcelResponseBody.from_parcel(
                self.primary, self.primary_distance
            )
            if self.primary
            else None,
            "has_primary": self.primary is not None,
            "has_comparables": len(
                [c for c, _ in self.comparables if c.pin != body.selected_primary]
            )
            > 0,
            "comparables": [
                ParcelResponseBody.from_parcel(p, d) for p, d in self.comparables
            ],
            "year": CURRENT_YEAR,
        }
        if os.getenv("GOOGLE_SHEET_SID"):
            self.context_data["log_url"] = (
                "https://docs.google.com/spreadsheets/d/"
                + os.getenv("GOOGLE_SHEET_SID")
            )
        self.handle_region_data()

    def render_document(self) -> bytes:
        renderer = DocumentRenderer(
            self.document, self.context_data, images=self.body.files
        )
        return renderer.render_as_bytes()

    def primary_details(self, primary: ParcelType, primary_distance: float) -> Mapping:
        # TODO: clean up
        if not primary:
            return {}
        if primary_distance:
            primary_distance = "{:0.2f}mi".format(primary_distance / METERS_IN_MILE)
        return {
            "primary_distance": primary_distance or "",
            "contention_faircash": "${:,.0f}".format(primary.sale_price)
            if primary.sale_price
            else "",
            "contention_sev": "{:,.0f}".format(primary.sale_price / 2)
            if primary.sale_price
            else "",
            "primary_sale_price": "${:,.0f}".format(primary.sale_price)
            if primary.sale_price
            else "",
            "primary_sale_date": primary.sale_date.strftime("%Y-%m-%d")
            if primary.sale_date
            else "",
        }

    def handle_region_data(self):
        raise NotImplementedError()

    def send_mail(self, mail: Mail):
        raise NotImplementedError()


class DetroitDocumentMailer(BaseDocumentMailer):
    """
    mailer = DetroitDocumentMailer(body, DocxTemplate(os.path.join(..)))
    mailer.send_mail(mail)
    """

    document_template = os.path.join(
        BASE_DIR, "templates", "docs", "detroit_template_2025.docx"
    )

    DAMAGE_TO_CONDITION = {
        "excellent": [95, 98, 100],
        "very_good": [85, 90, 94],
        "good": [75, 80, 84],
        "average": [60, 67, 74],
        "fair": [45, 52, 59],
        "poor": [30, 37, 44],
        "very_poor": [20, 25, 29],
        "unsound": [0, 10, 19],
    }

    def handle_region_data(self):
        self.context_data = {
            **self.context_data,
            "current_faircash": f"${((self.target.assessed_value or 0) * 2):,.0f}",
            "contention_faircash2": f"${self.comparables_avg_sale_price:,.0f}",
            "economic_obsolescence": self.body.economic_obsolescence,
            **self.get_depreciation(
                self.target.age or 0,
                self.target.effective_age or 0,
                self.body.damage,
                self.body.damage_level,
            ),
            **self.primary_details(self.primary, self.primary_distance),
        }

    def send_mail(self, mail: Mail):
        message = self.submission_email()
        internal_message = self.internal_submission_email()
        if os.getenv("ATTACH_LETTERS"):
            letter = (
                f"Protest Letter Updated {datetime.today().strftime('%m_%d_%y')}.docx",
                WORD_MIMETYPE,
                self.render_document(),
            )
            message.attach(*letter)
            if not self.body.resumed:
                internal_message.attach(*letter)

        if self.body.agreement_name:
            message.attach(
                f"Property Tax Appeal Project Representation Agreement {self.body.agreement_name}.docx",  # noqa
                WORD_MIMETYPE,
                self.render_agreement(),
            )

        mail.send(message)
        mail.send(internal_message)

    def send_agreement_email(self, mail: Mail):
        # TODO: A little mixed up but works
        subject = f"Property Tax Appeal Agreement: {self.body.agreement_name}"
        recipients = [os.getenv("PTAP_MAIL")]
        message = Message(subject, recipients=recipients)
        message.html = render_template(
            "emails/agreement_log.html",
            uuid=self.body.uuid,
            agreement=self.body.agreement,
            name=self.context_data["owner"],
            street_address=self.target.street_address,
        )
        message.attach(
            f"Property Tax Appeal Project Representation Agreement {self.body.agreement_name}.docx",  # noqa
            WORD_MIMETYPE,
            self.render_agreement(),
        )
        mail.send(message)

    def submission_email(self) -> Message:
        name = f"{self.body.user.first_name} {self.body.user.last_name}"
        subject = f"Property Tax Appeal Project Submission: {name} ({self.target.street_address})"  # noqa
        recipients = (
            [os.getenv("PTAP_MAIL")] if self.body.resumed else [self.body.user.email]
        )

        if self.body.eligibility and self.body.eligibility.hope:
            body = render_template("emails/submission_detroit_hope.html", name=name)
        else:
            body = render_template(
                "emails/submission_detroit.html",
                name=name,
                address=self.target.street_address,
                has_images=len(self.body.files) > 0,
            )

        msg = Message(subject, recipients=recipients, reply_to=os.getenv("PTAP_MAIL"))
        msg.html = body
        return msg

    def internal_submission_email(self, **kwargs) -> Message:
        name = f"{self.body.user.first_name} {self.body.user.last_name}"
        subject = f"Property Tax Appeal Project Submission: {name} ({self.target.street_address})"  # noqa
        recipients = [os.getenv("PTAP_MAIL")]
        msg = Message(subject, recipients=recipients)
        msg.html = render_template(
            "emails/submission_log.html",
            name=name,
            address=self.target.street_address,
            sheet_sid=os.getenv("GOOGLE_SHEET_SID"),
            **kwargs,
        )

        return msg

    def get_depreciation(
        self,
        actual_age: int,
        effective_age: int,
        damage: str,
        damage_level: Optional[str],
    ) -> Mapping:
        condition = self.DAMAGE_TO_CONDITION.get(damage_level, [0, 0, 0])
        percent_good = 100 - effective_age
        schedule_incorrect = effective_age < actual_age and not (
            actual_age >= 55 and effective_age >= 55
        )
        damage_incorrect = condition[2] < percent_good
        damage_correct = condition[0] > percent_good

        assessor_damage_level = (
            self.get_damage_level(percent_good).title().replace("_", " ")
        )
        capped_age = min(actual_age, 55)
        return {
            "age": actual_age,
            "capped_age": capped_age,
            "capped_percent_good": 100 - capped_age,
            "effective_age": effective_age,
            "new_effective_age": 100 - condition[1],
            "percent_good": percent_good,
            "assessor_damage_level": assessor_damage_level,
            "schedule_incorrect": schedule_incorrect,
            "damage": damage,
            "damage_level": (damage_level or "").title().replace("_", " "),
            "damage_midpoint": condition[1],
            "damage_incorrect": damage_incorrect,
            "damage_correct": damage_correct,
            "show_depreciation": damage_incorrect,
        }

    def get_damage_level(self, percent_good: int) -> str:
        for level, value_range in self.DAMAGE_TO_CONDITION.items():
            if percent_good >= value_range[0] and percent_good <= value_range[2]:
                return level
        return ""

    def render_agreement(self) -> bytes:
        doc = DocxTemplate(
            os.path.join(
                BASE_DIR,
                "templates",
                "docs",
                "detroit_representation_agreement_2025.docx",
            )
        )
        timestamp = datetime.now(pytz.timezone("America/Detroit"))
        agreement_date = timestamp.strftime("%Y-%m-%d")
        renderer = DocumentRenderer(
            doc,
            {
                "agreement_date": self.body.agreement_date or agreement_date,
                "partner_name": self.body.agreement_name,
                "parcel_num": self.target.pin,
                "street_address": self.target.street_address,
                "city": "Detroit",
                "state": "MI",
            },
        )
        return renderer.render_as_bytes()


class MilwaukeeDocumentMailer(BaseDocumentMailer):
    document_template = os.path.join(
        BASE_DIR, "templates", "docs", "milwaukee_template_2024.docx"
    )

    def handle_region_data(self):
        self.context_data = {
            **self.context_data,
            "current_faircash": f"${((self.target.assessed_value or 0) * 2):.0f}",
            "contention_faircash2": f"${self.comparables_avg_sale_price:,.0f}",
            "comparables_count": len(self.comparables),
            **self.primary_details(self.primary, self.primary_distance),
        }

    def send_mail(self, mail: Mail):
        message = self.submission_email()
        message.attach(
            f"Protest Letter Updated {datetime.today().strftime('%m_%d_%y')}.docx",
            WORD_MIMETYPE,
            self.render_document(),
        )
        mail.send(message)

    def submission_email(self) -> Message:
        name = f"{self.body.user.first_name} {self.body.user.last_name}"
        subject = f"Property Tax Appeal Project Submission: {name} ({self.target.street_address})"  # noqa
        recipients = (
            [os.getenv("MILWAUKEE_MAIL")]
            if self.body.resumed
            else [self.body.user.email]
        )

        body = render_template(
            "emails/submission_milwaukee.html",
            name=name,
            address=self.target.street_address,
            has_images=len(self.body.files) > 0,
        )

        msg = Message(
            subject, recipients=recipients, reply_to=os.getenv("MILWAUKEE_MAIL")
        )
        msg.html = body
        return msg


class CookDocumentMailer(BaseDocumentMailer):
    document_template = os.path.join(
        BASE_DIR, "templates", "docs", "cook_template_2024.docx"
    )

    def handle_region_data(self):
        self.context_data = {
            **self.context_data,
            "homeowner_name": self.context_data["owner"],
            "assessor_av": f"{self.target.assessed_value:,.0f}",
            "assessor_mv": f"${(self.target.assessed_value * 10):,.0f}",
            "contention_av": f"{self.comparables_avg_sale_price:,.0f}",
            "contention_mv": f"${self.comparables_avg_sale_price:,.0f}",
        }

    def send_mail(self, mail: Mail):
        message = self.submission_email()
        internal_message = self.internal_submission_email()
        message.attach(
            f"Protest Letter Updated {datetime.today().strftime('%m_%d_%y')}.docx",
            WORD_MIMETYPE,
            self.render_document(),
        )
        mail.send(message)
        mail.send(internal_message)

    def submission_email(self) -> Message:
        name = f"{self.body.user.first_name} {self.body.user.last_name}"
        subject = f"Property Tax Appeal Project Submission: {name} ({self.target.street_address})"  # noqa

        body = render_template(
            "emails/submission_cook.html",
            name=name,
            address=self.target.street_address,
            has_images=len(self.body.files) > 0,
        )

        msg = Message(
            subject,
            recipients=[os.getenv("PTAP_MAIL")],
            cc=[os.getenv("CHICAGO_MAIL", "")],
            reply_to=os.getenv("PTAP_MAIL"),
        )
        msg.html = body
        return msg

    def internal_submission_email(self) -> Message:
        name = f"{self.body.user.first_name} {self.body.user.last_name}"
        subject = f"Property Tax Appeal Project Submission: {name} ({self.target.street_address})"  # noqa
        msg = Message(
            subject,
            recipients=[os.getenv("PTAP_MAIL")],
            cc=[os.getenv("CHICAGO_MAIL", "")],
        )
        msg.html = render_template(
            "emails/submission_log.html",
            name=name,
            address=self.target.street_address,
            # log_url # TODO:
        )

        return msg


def detroit_reminder_email(data):
    """Separate from mailers"""
    user = data.get("user", {})
    name = user.get("name", f'{user.get("first_name")} {user.get("last_name")}')
    parcel = find_parcel("detroit", data.get("pin"))
    if parcel is None:
        return

    subject = f"Property Tax Appeal Project Reminder: {parcel.street_address}"

    msg = Message(subject, recipients=[user.get("email"), os.getenv("PTAP_MAIL")])
    msg.html = render_template(
        "emails/reminder_detroit.html", name=name, address=parcel.street_address
    )
    return msg
