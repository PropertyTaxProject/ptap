import json
import os
import time
from datetime import datetime, timedelta

import boto3
import pytz
import sentry_sdk

from .email import detroit_reminder_email
from .utils import iso8601_serializer


def send_reminders(mail, logger):
    logger.info("CRON: send reminders")
    s3 = boto3.client("s3")
    bucket = os.getenv("S3_SUBMISSIONS_BUCKET")
    today = datetime.now(pytz.timezone("America/Detroit"))
    # We should only send emails when someone hasn't been contacted already and doesn't
    # have a separate completed submission. This will ignore someone who submits two
    # days ago and then has an incomplete submission the next day, but since landlords
    # aren't allowed that shouldn't be an issue and is lower risk
    emails_to_ignore = set()
    # Make sure we only send one email per email address
    email_map = {}

    submission_keys = []
    for day_diff in range(1, 3):
        day = today - timedelta(day_diff)
        res = s3.list_objects_v2(
            Bucket=bucket, Prefix="submissions/" + day.strftime("%Y/%m/%d/")
        )
        for obj in res.get("Contents", []):
            submission_keys.append(obj["Key"])

    for key in submission_keys:
        try:
            data = json.load(s3.get_object(Bucket=bucket, Key=key)["Body"])
            step = data.get("step")
            email = data.get("user", {}).get("email", "").lower()
            if (
                not step
                or step == "submit"
                or data.get("region") != "detroit"
                or data.get("reminder_sent")
                or email in emails_to_ignore
            ):
                emails_to_ignore.add(email)
            else:
                email_map[email] = {"key": key, "data": data}
        except Exception as e:
            sentry_sdk.capture_exception(e)

    for email_obj in email_map.values():
        key = email_obj["key"]
        data = email_obj["data"]
        logger.info(f"CRON: send_reminders: {key}")

        try:
            mail.send(detroit_reminder_email(data))
            data["reminder_sent"] = True
            s3.put_object(
                Body=json.dumps(data, default=iso8601_serializer),
                Bucket=bucket,
                Key=key,
            )
            logger.info(f"CRON: send_reminders: sent for {key}")
        except Exception as e:
            sentry_sdk.capture_exception(e)
        time.sleep(3)
