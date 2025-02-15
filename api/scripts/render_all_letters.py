import os

from api.api import app
from api.dto import RequestBody
from api.email import CookDocumentMailer, DetroitDocumentMailer, MilwaukeeDocumentMailer
from api.models import Submission
from sqlalchemy import Boolean, or_
from datetime import datetime

CURRENT_DIR = os.path.abspath(os.path.dirname(__file__))


def get_mailer(body: RequestBody):
    if body.region == "cook":
        return CookDocumentMailer(body)
    elif body.region == "detroit":
        return DetroitDocumentMailer(body)
    elif body.region == "milwaukee":
        return MilwaukeeDocumentMailer(body)


if __name__ == "__main__":
    since = datetime(2024, 12, 1)

    with app.app_context():
        submissions = (
            Submission.query.filter(
                or_(
                    Submission.data["step"].astext == "submit",
                    Submission.data["resumed"].astext.cast(Boolean).is_(True),
                ),
                Submission.data["region"].astext == "detroit",
                Submission.created_at >= since,
            )
            .order_by(Submission.created_at)
            .all()
        )
        for submission in submissions:
            body = RequestBody.parse_raw(submission.data)
            mailer = get_mailer(body)
            doc = mailer.render_document()
            with open(
                os.path.join(
                    CURRENT_DIR,
                    "letters",
                    f"{submission.created_at.strftime('%Y-%m-%d')} {body.agreement_name} {body.pin} Letter.docx",  # noqa
                ),
                "wb",
            ) as f:
                f.write(doc)
