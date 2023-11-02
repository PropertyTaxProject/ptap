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
      version = "~> 5.0"
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
  github_subjects = ["pjsier/ptap:*"] # TODO:

  tags = {
    project     = local.name
    environment = local.env
  }
}

data "aws_ssm_parameter" "secret_key" {
  name = "/${local.name}/${local.env}/secret_key"
}

data "aws_ssm_parameter" "sendgrid_username" {
  name = "/${local.name}/${local.env}/sendgrid_username"
}

data "aws_ssm_parameter" "sendgrid_api_key" {
  name = "/${local.name}/${local.env}/sendgrid_api_key"
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
        "Resource" = [module.s3_uploads.s3_bucket_arn, "${module.s3_uploads.s3_bucket_arn}/*"]
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
    }
  }

  environment_variables = {
    SECRET_KEY              = data.aws_ssm_parameter.secret_key.value,
    SENDGRID_USERNAME       = data.aws_ssm_parameter.sendgrid_username.value
    SENDGRID_API_KEY        = data.aws_ssm_parameter.sendgrid_api_key.value,
    SENTRY_DSN              = data.aws_ssm_parameter.sentry_dsn.value,
    GOOGLE_SERVICE_ACCCOUNT = data.aws_ssm_parameter.google_service_account.value
    S3_UPLOADS_BUCKET       = module.s3_uploads.s3_bucket_id
    DATABASE_URL            = "postgresql+psycopg2://${data.aws_ssm_parameter.db_username.value}:${data.aws_ssm_parameter.db_password.value}@${data.aws_db_instance.app.endpoint}/${data.aws_db_instance.app.db_name}"
    MAIL_DEFAULT_SENDER     = "test@example.com",
    PTAP_MAIL               = "test@example.com",
    UOFM_MAIL               = "test@example.com",
    CHICAGO_MAIL            = "test@example.com",
    PTAP_SHEET_SID          = "",
    ENVIRONMENT             = local.env
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

  create_api_domain_name = false

  # Custom domain TODO:
  # domain_name                 = "terraform-aws-modules.modules.tf"
  # domain_name_certificate_arn = "arn:aws:acm:eu-west-1:052235179155:certificate/2b3a7ed9-05e1-4f9e-952b-27744ba06da6"

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
