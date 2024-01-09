import json
import os
import time
from datetime import datetime, timedelta

import boto3
import pytz
import sentry_sdk

from .email import detroit_reminder_email


def handle_individual_reminder(mail, logger, s3, bucket, key):
    logger.info(f"CRON: send_reminders: {key}")
    # Load key, check whether it should trigger a reminder, send, then update
    obj = s3.get_object(Bucket=bucket, Key=key)
    data = json.load(obj["Body"])
    step = data.get("step")

    # Maybe have more rigid check in the future, now just checking incomplete/not sent
    if not step or step == "submit" or data.get("reminder_sent"):
        return

    mail.send(detroit_reminder_email(data))

    data["reminder_sent"] = True
    s3.put_object(Body=json.dumps(data), Bucket=bucket, Key=key)
    logger.info(f"CRON: send_reminders: sent for {key}")


def send_reminders(mail, logger):
    logger.info("CRON: send reminders")
    s3 = boto3.client("s3")
    bucket = os.getenv("S3_SUBMISSIONS_BUCKET")
    today = datetime.now(pytz.timezone("America/Detroit"))

    for day_diff in range(1, 3):
        day = today - timedelta(day_diff)
        res = s3.list_objects_v2(
            Bucket=bucket, Prefix="submissions/" + day.strftime("%Y/%m/%d/")
        )
        for obj in res.get("Contents", []):
            try:
                handle_individual_reminder(mail, logger, s3, bucket, obj["Key"])
            except Exception as e:
                sentry_sdk.capture_exception(e)
            time.sleep(3)
            continue
