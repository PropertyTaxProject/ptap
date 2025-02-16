import json
import os
from datetime import datetime

from sqlalchemy import Boolean, or_

from api.api import app
from api.dto import RequestBody
from api.email import CookDocumentMailer, DetroitDocumentMailer, MilwaukeeDocumentMailer
from api.models import Submission

CURRENT_DIR = os.path.abspath(os.path.dirname(__file__))


def get_mailer(body: RequestBody, submission: Submission):
    if body.region == "cook":
        return CookDocumentMailer(body, submission)
    elif body.region == "detroit":
        return DetroitDocumentMailer(body, submission)
    elif body.region == "milwaukee":
        return MilwaukeeDocumentMailer(body, submission)


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
            body = RequestBody.parse_raw(json.dumps(submission.data))
            output_filename = f"{submission.created_at.strftime('%Y-%m-%d')} {body.agreement_name} {body.pin} Letter.docx".replace(  # noqa
                "/", ""
            )
            output_path = os.path.join(CURRENT_DIR, "letters", output_filename)
            if os.path.exists(output_path):
                continue

            mailer = get_mailer(body, submission)
            doc = mailer.render_document()
            with open(
                output_path,
                "wb",
            ) as f:
                print(output_filename)
                f.write(doc)
