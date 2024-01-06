import json

import awsgi

from api.api import app


def cron_event(path):
    return {
        "version": "1.0",
        "resource": "/{proxy+}",
        "path": path,
        "httpMethod": "GET",
        "headers": {
            "Content-Length": "0",
            "User-Agent": "",
        },
        "multiValueHeaders": {
            "Content-Length": ["0"],
            "User-Agent": [""],
        },
        "queryStringParameters": None,
        "multiValueQueryStringParameters": None,
        "requestContext": {
            "httpMethod": "GET",
            "identity": {},
            "path": path,
        },
        "pathParameters": {"proxy": path},
    }


def lambda_handler(event, context):
    # Handle scheduled internal cron events
    if "cron" in event:
        return awsgi.response(app, cron_event(event["cron"]), context)

    # Handle CloudWatch keep warm events
    if "httpMethod" not in event:
        return {"statusCode": 200, "body": json.dumps({"message": "warm"})}

    # Simple way to block namespaced cron routes
    if event.get("path", "").startswith("/cron"):
        return {"statusCode": 404, "body": "404: Not found"}

    return awsgi.response(
        app, event, context, base64_content_types={"application/octet-stream"}
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0")
