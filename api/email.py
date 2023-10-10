import os

from flask import render_template
from flask_mail import Message


def detroit_submission_email(mail, data):
    # email to ptap account with info
    name = data["name"]
    addr = data["target_pin"]["Address"]
    submit_email = [data["email"]]
    ptap = [os.getenv("PTAP_MAIL")]
    uofm = [os.getenv("UOFM_MAIL")]

    subj = "Property Tax Appeal Project Submission: " + name + " (" + addr + ")"
    body = render_template(
        "emails/submission_log.html",
        {"name": name, "address": addr, "log_url": data["log_url"]},
    )
    msg = Message(subj, recipients=uofm, cc=ptap)
    msg.html = body
    with open(data["output_name"], "rb") as f:
        msg.attach(
            data["output_name"][13:],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            f.read(),
        )
    mail.send(msg)

    body = render_template(
        "emails/submission_detroit.html", {"name": name, "address": addr}
    )
    msg2 = Message(subj, recipients=submit_email, reply_to=uofm[0])
    msg2.html = body
    mail.send(msg2)
    print("emailed")


def cook_submission_email(mail, data):
    # email to ptap account with info
    name = data["name"]
    addr = data["target_pin"]["Address"]
    submit_email = [data["email"]]
    ptap = [os.getenv("PTAP_MAIL")]
    ptap_chi = [os.getenv("CHICAGO_MAIL")]

    subj = "Property Tax Appeal Project Submission: " + name + " (" + addr + ")"
    body = render_template(
        "emails/submission_log.html",
        {"name": name, "address": addr, "log_url": data["log_url"]},
    )

    msg = Message(subj, recipients=ptap_chi, cc=ptap)
    msg.html = body
    with open(data["output_name"], "rb") as f:
        msg.attach(
            data["output_name"][13:],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            f.read(),
        )
    mail.send(msg)

    # receipt to user
    body = render_template(
        "emails/submission_cook.html", {"name": name, "address": addr}
    )
    msg2 = Message(subj, recipients=submit_email, reply_to=ptap_chi[0])
    msg2.html = body
    mail.send(msg2)
    print("emailed")
