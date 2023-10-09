import json

import awsgi

from api.api import application


def lambda_handler(event, context):
    # Handle CloudWatch keep warm events
    if "httpMethod" not in event:
        return {"statusCode": 200, "body": json.dumps({"message": "warm"})}

    return awsgi.response(application, event, context)


if __name__ == "__main__":
    application.run()
