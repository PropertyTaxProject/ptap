terraform {
  required_version = ">= 1.0"

  backend "s3" {
    bucket = "ptap-terraform-state"
    key    = "development/terraform.tfstate"
    region = "us-east-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.46.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

locals {
  name            = "ptap"
  env             = "dev"
  state_bucket    = "ptap-terraform-state"
  domain          = "propertytaxproject.com"
  github_subjects = ["PropertyTaxProject/ptap:*"]
  sheet_name      = "Dev PTAP Submissions"
  mke_sheet_name  = "Dev MKE PTAP Submissions"

  tags = {
    project     = local.name
    environment = local.env
  }
}

data "aws_ssm_parameter" "secret_key" {
  name = "/${local.name}/${local.env}/secret_key"
}

data "aws_ssm_parameter" "mail_username" {
  name = "/${local.name}/${local.env}/mail_username"
}

data "aws_ssm_parameter" "mail_password" {
  name = "/${local.name}/${local.env}/mail_password"
}

data "aws_ssm_parameter" "sentry_dsn" {
  name = "/${local.name}/${local.env}/sentry_dsn"
}

data "aws_ssm_parameter" "google_service_account" {
  name = "/${local.name}/${local.env}/google_service_account"
}

data "aws_ssm_parameter" "db_username" {
  name = "/${local.name}/${local.env}/db_username"
}

data "aws_ssm_parameter" "db_password" {
  name = "/${local.name}/${local.env}/db_password"
}

data "aws_ssm_parameter" "google_sheet_sid" {
  name = "/${local.name}/${local.env}/google_sheet_sid"
}

data "aws_ssm_parameter" "mke_google_sheet_sid" {
  name = "/${local.name}/${local.env}/mke_google_sheet_sid"
}

data "aws_ssm_parameter" "ptap_mail" {
  name = "/${local.name}/${local.env}/ptap_mail"
}

data "aws_ssm_parameter" "milwaukee_mail" {
  name = "/${local.name}/${local.env}/milwaukee_mail"
}

data "aws_ssm_parameter" "uofm_mail" {
  name = "/${local.name}/${local.env}/uofm_mail"
}

data "aws_ssm_parameter" "chicago_mail" {
  name = "/${local.name}/${local.env}/chicago_mail"
}

data "aws_iam_policy_document" "s3_public" {
  statement {
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${module.s3.s3_bucket_arn}/*"]
  }
}

module "s3" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.15.1"

  bucket        = "${local.name}-${local.env}-assets"
  acl           = "public-read"
  attach_policy = true
  policy        = data.aws_iam_policy_document.s3_public.json

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false

  control_object_ownership = true
  object_ownership         = "BucketOwnerPreferred"

  website = {
    index_document = "index.html"
  }

  cors_rule = [
    {
      allowed_methods = ["HEAD", "GET"]
      allowed_headers = ["*"]
      allowed_origins = ["*"]
      max_age_seconds = 3600
    }
  ]
}

data "aws_iam_policy_document" "s3_uploads_public" {
  statement {
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${module.s3_uploads.s3_bucket_arn}/*"]
  }
}

module "s3_uploads" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.15.1"

  bucket        = "${local.name}-${local.env}-uploads"
  acl           = "public-read"
  attach_policy = true
  policy        = data.aws_iam_policy_document.s3_uploads_public.json

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false

  control_object_ownership = true
  object_ownership         = "BucketOwnerPreferred"

  cors_rule = [
    {
      allowed_methods = ["HEAD", "GET", "PUT", "POST"]
      allowed_headers = ["*"]
      allowed_origins = ["*"]
      max_age_seconds = 3600
    }
  ]
}

module "s3_submissions" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.15.1"

  bucket = "${local.name}-${local.env}-submissions"

  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls  = true

  control_object_ownership = true
  object_ownership         = "BucketOwnerPreferred"
}

data "aws_ecr_repository" "app" {
  name = local.name
}

data "aws_db_instance" "app" {
  db_instance_identifier = local.name
}

module "lambda" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "6.0.1"

  function_name  = "${local.name}-${local.env}"
  package_type   = "Image"
  create_package = false
  publish        = true
  timeout        = 30
  memory_size    = 1024

  image_uri = "${data.aws_ecr_repository.app.repository_url}:${var.lambda_image_tag}"

  attach_policy_json = true
  policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        "Action"   = ["s3:GetObject", "s3:ListBucket", "s3:PutObject", "s3:PutObjectAcl"],
        "Effect"   = "Allow",
        "Resource" = [module.s3_uploads.s3_bucket_arn, "${module.s3_uploads.s3_bucket_arn}/*", module.s3_submissions.s3_bucket_arn, "${module.s3_submissions.s3_bucket_arn}/*"]
      }
    ]
  })

  allowed_triggers = {
    AllowExecutionFromAPIGateway = {
      service = "apigateway"
      arn     = "${module.apigw.apigatewayv2_api_execution_arn}/*/*/*"
    },
    AllowExecutionFromCloudWatch = {
      principal  = "events.amazonaws.com"
      source_arn = aws_cloudwatch_event_rule.keep_warm.arn
    },
    AllowExecutionFromCloudWatchCron = {
      principal  = "events.amazonaws.com"
      source_arn = aws_cloudwatch_event_rule.lambda_cron.arn
    }
  }

  environment_variables = {
    ENVIRONMENT            = local.env
    SECRET_KEY             = data.aws_ssm_parameter.secret_key.value,
    MAIL_SERVER            = "email-smtp.us-east-1.amazonaws.com"
    MAIL_PORT              = 587
    MAIL_USERNAME          = data.aws_ssm_parameter.mail_username.value
    MAIL_PASSWORD          = data.aws_ssm_parameter.mail_password.value
    SENTRY_DSN             = data.aws_ssm_parameter.sentry_dsn.value
    GOOGLE_SERVICE_ACCOUNT = data.aws_ssm_parameter.google_service_account.value
    GOOGLE_SHEET_SID       = data.aws_ssm_parameter.google_sheet_sid.value
    MKE_GOOGLE_SHEET_SID   = data.aws_ssm_parameter.mke_google_sheet_sid.value
    S3_UPLOADS_BUCKET      = module.s3_uploads.s3_bucket_id
    S3_SUBMISSIONS_BUCKET  = module.s3_submissions.s3_bucket_id
    DATABASE_URL           = "postgresql+psycopg2://${data.aws_ssm_parameter.db_username.value}:${data.aws_ssm_parameter.db_password.value}@${data.aws_db_instance.app.endpoint}/${data.aws_db_instance.app.db_name}"
    MAIL_DEFAULT_SENDER    = "mail@${local.domain}"
    PTAP_MAIL              = data.aws_ssm_parameter.ptap_mail.value
    MILWAUKEE_MAIL         = data.aws_ssm_parameter.milwaukee_mail.value
    ATTACH_LETTERS         = "true"

    GOOGLE_SHEET_SUBMISSION_NAME     = local.sheet_name
    MKE_GOOGLE_SHEET_SUBMISSION_NAME = local.mke_sheet_name
  }

  tags = local.tags
}

resource "aws_cloudwatch_event_rule" "keep_warm" {
  name                = "${local.name}-${local.env}-keep-lambda-warm"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "keep_warm" {
  rule      = aws_cloudwatch_event_rule.keep_warm.name
  target_id = "${local.name}-${local.env}"
  arn       = module.lambda.lambda_function_arn
}

resource "aws_cloudwatch_event_rule" "lambda_cron" {
  name = "${local.name}-${local.env}-lambda-cron"
  # 9/10am ET daily
  schedule_expression = "cron(0 14 * * ? *)"
}

resource "aws_cloudwatch_event_target" "lambda_cron" {
  rule      = aws_cloudwatch_event_rule.lambda_cron.name
  target_id = "${local.name}-${local.env}"
  arn       = module.lambda.lambda_function_arn
  input = jsonencode({
    cron = "/cron/reminders"
  })
}

data "aws_route53_zone" "domain" {
  name = local.domain
}

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.domain.zone_id
  name    = "dev.${local.domain}"
  type    = "A"

  alias {
    name    = module.apigw.apigatewayv2_domain_name_target_domain_name
    zone_id = module.apigw.apigatewayv2_domain_name_hosted_zone_id

    evaluate_target_health = false
  }
}

data "aws_acm_certificate" "cert" {
  domain = local.domain
}

module "apigw" {
  source  = "terraform-aws-modules/apigateway-v2/aws"
  version = "2.2.2"

  name          = "${local.name}-${local.env}"
  protocol_type = "HTTP"

  cors_configuration = {
    allow_headers = ["content-type", "x-amz-date", "authorization", "x-api-key", "x-amz-security-token", "x-amz-user-agent"]
    allow_methods = ["*"]
    allow_origins = ["*"]
  }

  domain_name                 = "dev.${local.domain}"
  domain_name_certificate_arn = data.aws_acm_certificate.cert.arn

  # payload_format_version 1.0 is needed for awsgi
  integrations = {
    "ANY /{proxy+}" = {
      lambda_arn             = module.lambda.lambda_function_arn
      payload_format_version = "1.0"
      timeout_milliseconds   = 30000
    }

    "$default" = {
      lambda_arn             = module.lambda.lambda_function_arn
      payload_format_version = "1.0"
      timeout_milliseconds   = 30000
    }
  }

  tags = local.tags
}

module "logs_lambda" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "6.0.1"

  function_name = "${local.name}-logs-${local.env}"
  handler       = "log_scraper.lambda_handler"
  runtime       = "python3.11"
  memory_size   = 128
  timeout       = 10
  publish       = true

  source_path = "${path.module}/../files/log_scraper"

  allowed_triggers = {
    cloudwatch = {
      principal  = "logs.amazonaws.com"
      source_arn = "${module.lambda.lambda_cloudwatch_log_group_arn}:*"
    }
  }

  environment_variables = {
    GOOGLE_SERVICE_ACCOUNT = data.aws_ssm_parameter.google_service_account.value
    GOOGLE_SHEET_NAME      = local.sheet_name
    MKE_GOOGLE_SHEET_NAME  = local.mke_sheet_name
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_subscription_filter" "logs_lambda" {
  name            = "${local.name}-logs-${local.env}"
  log_group_name  = module.lambda.lambda_cloudwatch_log_group_name
  filter_pattern  = "%LOG_STEP%"
  destination_arn = module.logs_lambda.lambda_function_arn
}
