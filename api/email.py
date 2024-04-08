import os

from flask import render_template
from flask_mail import Message

from .constants import WORD_MIMETYPE
from .dataqueries import _get_pin
from .utils import record_final_submission, render_agreement


def agreement_email(data):
    parcel = _get_pin("detroit", data.get("pin"))
    street_address = f"{parcel.street_number} {parcel.street_name}"

    if data.get("agreement"):
        name = data.get("agreement_name")
        subject = f"Property Tax Appeal Agreement: {name} ({street_address})"
    else:
        user = data.get("user", {})
        name = user.get("name", f'{user["first_name"]} {user["last_name"]}')
        subject = f"Property Tax Appeal Start: {name} ({street_address})"

    body = render_template(
        "emails/agreement_log.html",
        uuid=data.get("uuid"),
        agreement=data.get("agreement"),
        name=name,
        street_address=street_address,
    )
    msg = Message(subject, recipients=[os.getenv("PTAP_MAIL")])
    msg.html = body

    agreement_name = data.get("agreement_name")
    if agreement_name:
        agreement_bytes = render_agreement(
            agreement_name, parcel, data.get("agreement_date")
        )
        msg.attach(
            f"Property Tax Appeal Project Representation Agreement {name}.docx",
            WORD_MIMETYPE,
            agreement_bytes,
        )

    return msg


def detroit_submission_email(mail, data, letter_bytes):
    # email to ptap account with info
    name = data.get("name", f'{data["first_name"]} {data["last_name"]}')
    addr = data["target_pin"]["address"]
    subject = f"Property Tax Appeal Project Submission: {name} ({addr})"

    if data.get("resumed"):
        recipients = [os.getenv("PTAP_MAIL")]
    else:
        recipients = [data["email"]]

    if data.get("eligibility", {}).get("hope", "").lower() == "yes":
        body = render_template("emails/submission_detroit_hope.html", name=name)
    else:
        body = render_template(
            "emails/submission_detroit.html",
            name=name,
            address=addr,
            has_images=len(data["files"]) > 0,
        )

    msg = Message(subject, recipients=recipients, reply_to=os.getenv("PTAP_MAIL"))
    msg.html = body
    if letter_bytes:
        msg.attach(data["output_name"][13:], WORD_MIMETYPE, letter_bytes)

    agreement_name = data.get("agreement_name")
    if agreement_name:
        parcel = _get_pin("detroit", data.get("pin"))
        agreement_bytes = render_agreement(
            agreement_name, parcel, data.get("agreement_date")
        )
        msg.attach(
            f"Property Tax Appeal Project Representation Agreement {name}.docx",
            WORD_MIMETYPE,
            agreement_bytes,
        )

    mail.send(msg)


def detroit_internal_submission_email(mail, data, letter_bytes):
    name = data.get("name", f'{data["first_name"]} {data["last_name"]}')
    addr = data["target_pin"]["address"]

    subj = f"Property Tax Appeal Project Submission: {name} ({addr})"
    msg = Message(subj, recipients=[os.getenv("PTAP_MAIL")])
    msg.html = render_template(
        "emails/submission_log.html",
        name=name,
        address=addr,
        log_url=record_final_submission(data),
    )
    if letter_bytes:
        msg.attach(data["output_name"][13:], WORD_MIMETYPE, letter_bytes)

    mail.send(msg)


def detroit_reminder_email(data):
    user = data.get("user", {})
    name = user.get("name", f'{user.get("first_name")} {user.get("last_name")}')
    parcel = _get_pin("detroit", data.get("pin"))
    address = f"{parcel.street_number} {parcel.street_name}"

    subject = f"Property Tax Appeal Project Reminder: {address}"

    msg = Message(subject, recipients=[user.get("email"), os.getenv("PTAP_MAIL")])
    msg.html = render_template(
        "emails/reminder_detroit.html", name=name, address=address
    )
    return msg


def cook_submission_email(mail, data):
    # email to ptap account with info
    name = data.get("name", f'{data["first_name"]} {data["last_name"]}')
    addr = data["target_pin"]["address"]
    submit_email = [data["email"]]
    ptap_mail = os.getenv("PTAP_MAIL", "")
    cc_emails = []
    if os.getenv("CHICAGO_MAIL", ""):
        cc_emails = [os.getenv("CHICAGO_MAIL")]

    subj = f"Property Tax Appeal Project Submission: {name} ({addr})"
    body = render_template(
        "emails/submission_log.html",
        name=name,
        address=addr,
        log_url=data.get("log_url"),
    )

    msg = Message(subj, recipients=[ptap_mail], cc=cc_emails)
    msg.html = body
    msg.attach(
        data["output_name"][13:],
        WORD_MIMETYPE,
        data["file_stream"],
    )
    mail.send(msg)

    # receipt to user
    body = render_template("emails/submission_cook.html", name=name, address=addr)
    msg2 = Message(subj, recipients=submit_email, reply_to=ptap_mail)
    msg2.html = body
    mail.send(msg2)
    print("emailed")


def milwaukee_submission_email(mail, data, letter_bytes):
    # email to ptap account with info
    name = data.get("name", f'{data["first_name"]} {data["last_name"]}')
    addr = data["target_pin"]["address"]
    subject = f"Property Tax Appeal Project Submission: {name} ({addr})"

    if data.get("resumed"):
        recipients = [os.getenv("MILWAUKEE_MAIL")]
    else:
        recipients = [data["email"]]

    body = render_template(
        "emails/submission_milwaukee.html",
        name=name,
        address=addr,
        has_images=len(data["files"]) > 0,
    )

    msg = Message(subject, recipients=recipients, reply_to=os.getenv("MILWAUKEE_MAIL"))
    msg.html = body
    if data.get("resumed") and letter_bytes:
        msg.attach(data["output_name"][13:], WORD_MIMETYPE, letter_bytes)

    mail.send(msg)
