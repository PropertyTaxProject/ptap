import os

from api.api import app
from api.dto import RequestBody
from api.email import CookDocumentMailer, DetroitDocumentMailer, MilwaukeeDocumentMailer

CURRENT_DIR = os.path.abspath(os.path.dirname(__file__))


def get_mailer(body: RequestBody):
    if body.region == "cook":
        return CookDocumentMailer(body)
    elif body.region == "detroit":
        return DetroitDocumentMailer(body)
    elif body.region == "milwaukee":
        return MilwaukeeDocumentMailer(body)


if __name__ == "__main__":
    with open(os.path.join(CURRENT_DIR, "input.json"), "r") as f:
        body = RequestBody.parse_raw(f.read())

    with app.app_context():
        mailer = get_mailer(body)
        doc = mailer.render_document()
        with open(os.path.join(CURRENT_DIR, "output.docx"), "wb") as f:
            f.write(doc)
        if hasattr(mailer, "render_agreement"):
            agreement = mailer.render_agreement()
            with open(os.path.join(CURRENT_DIR, "agreement.docx"), "wb") as f:
                f.write(agreement)
