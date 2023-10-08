import awsgi

from api.api import application


def lambda_handler(event, context):
    return awsgi.response(application, event, context)


if __name__ == "__main__":
    application.run()
