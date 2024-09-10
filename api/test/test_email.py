import pytest

from .. import create_app
from ..dto import EligibilityBody, RequestBody, UserFormBody, UserPropertyBody
from ..email import DetroitDocumentMailer


@pytest.fixture
def app():
    app = create_app()
    app.config.update({"TESTING": True, "MAIL_SUPPRESS_SEND": True})

    with app.app_context():
        yield app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def detroit_renderer():
    body = RequestBody(
        pin="13010833.",
        uuid="",
        region="detroit",
        eligibility=EligibilityBody(hope=True, owner=True, residence=True),
        eligible=True,
        agreement=False,
        agreement_date=None,
        agreement_name=None,
        terms_name=None,
        selected_primary="",
        selected_comparables=[],
        user=UserFormBody(
            email="",
            first_name="",
            last_name="",
            address="",
            city="",
            state="",
            phone="",
            altcontact="",
            mailingsame="",
            heardabout="",
        ),
        property=UserPropertyBody(validcharacteristics=None, valueestimate=None),
        damage=None,
        damage_level=None,
        economic_obsolescence=False,
    )
    return DetroitDocumentMailer(body)


def test_detroit_depreciation_schedule(app, detroit_renderer):
    with app.app_context():
        assert detroit_renderer.get_depreciation(70, 45, "", "good")[
            "schedule_incorrect"
        ]
        assert not detroit_renderer.get_depreciation(100, 56, "", "good")[
            "schedule_incorrect"
        ]


def test_detroit_depreciation_damage(app, detroit_renderer):
    with app.app_context():
        assert detroit_renderer.get_depreciation(50, 45, "", "poor")["damage_incorrect"]
        assert not detroit_renderer.get_depreciation(50, 80, "", "good")[
            "damage_incorrect"
        ]
