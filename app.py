import json

import awsgi

from api.api import app


def lambda_handler(event, context):
    # Handle CloudWatch keep warm events
    if "httpMethod" not in event:
        return {"statusCode": 200, "body": json.dumps({"message": "warm"})}

    return awsgi.response(
        app, event, context, base64_content_types={"application/octet-stream"}
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0")
