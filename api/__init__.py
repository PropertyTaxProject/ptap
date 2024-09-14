import os
from logging.config import dictConfig

import boto3
import sentry_sdk
from flask import Flask
from flask_cors import CORS
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from sentry_sdk.integrations.aws_lambda import AwsLambdaIntegration
from sentry_sdk.integrations.flask import FlaskIntegration

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_BUILD_DIR = os.path.join(os.path.dirname(BASE_DIR), "dist")

db = SQLAlchemy()
mail = Mail()

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("ENVIRONMENT", "dev"),
    integrations=[AwsLambdaIntegration(), FlaskIntegration()],
    traces_sample_rate=0.1,
    profiles_sample_rate=0.1,
)


dictConfig(
    {
        "version": 1,
        "formatters": {
            "default": {
                "format": "[%(asctime)s] %(levelname)s: %(message)s",
            }
        },
        "handlers": {
            "wsgi": {
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
                "formatter": "default",
            }
        },
        "root": {"level": "INFO", "handlers": ["wsgi"]},
    }
)


def create_app() -> Flask:
    app = Flask(
        __name__,
        static_folder=os.path.join(STATIC_BUILD_DIR, "assets"),
        template_folder="./templates/",
    )
    app.config.update(
        {
            "SECRET_KEY": os.getenv("SECRET_KEY"),
            "MAIL_SERVER": os.getenv("MAIL_SERVER"),
            "MAIL_PORT": os.getenv("MAIL_PORT"),
            "MAIL_USE_TLS": True,
            "MAIL_USERNAME": os.getenv("MAIL_USERNAME"),
            "MAIL_PASSWORD": os.getenv("MAIL_PASSWORD"),
            "MAIL_DEFAULT_SENDER": os.getenv("MAIL_DEFAULT_SENDER"),
            "SQLALCHEMY_DATABASE_URI": os.getenv("DATABASE_URL"),
            "S3_CLIENT": boto3.client("s3"),
        }
    )

    db.init_app(app)
    CORS(app)
    mail.init_app(app)

    return app
