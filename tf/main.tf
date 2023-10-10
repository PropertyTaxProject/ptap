terraform {
  required_version = ">= 1.0"

  # TODO:
  backend "s3" {
    bucket = "pjsier-ptap-testing-terraform-state"
    key    = "ptap/terraform.tfstate"
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
  name = "ptap"
  tags = {
    project = "ptap"
  }
}

module "iam_github_oidc_provider" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-provider"
  version = "5.30.0"
}

resource "aws_iam_policy" "s3_state_access" {
  name = "${local.name}-s3-state-access"

  # TODO:
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = ["s3:*"]
        Effect = "Allow"
        Resource = [
          "arn:aws:s3:::pjsier-ptap-testing-terraform-state",
          "arn:aws:s3:::pjsier-ptap-testing-terraform-state/*"
        ]
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_policy" "ecr_access" {
  name = "${local.name}-ecr-access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:CompleteLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:InitiateLayerUpload",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage",
          "ecr:SetRepositoryPolicy"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })

  tags = local.tags
}

resource "aws_iam_policy" "lambda_access" {
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "lambda:*"
        ]
        Effect = "Allow"
        Resource = [
          module.lambda.lambda_function_arn,
          "${module.lambda.lambda_function_arn}:*"
        ]
      },
    ]
  })

  tags = local.tags
}

resource "aws_iam_policy" "s3_assets_access" {
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:*"
        ]
        Effect = "Allow"
        Resource = [
          module.s3.s3_bucket_arn,
          "${module.s3.s3_bucket_arn}/*"
        ]
      },
    ]
  })

  tags = local.tags
}

resource "aws_iam_policy" "get_access" {
  name = "${local.name}-get-access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "iam:Get*",
          "iam:List*",
          "logs:List*",
          "logs:Describe*",
          "ecr:Get*",
          "ecr:List*",
          "ecr:Describe*",
          "s3:Get*",
          "s3:List*",
          "events:Get*",
          "events:List*",
          "events:Describe*",
          "apigateway:GET"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })

  tags = local.tags
}

module "iam_github_oidc_role" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-role"
  version = "5.30.0"

  name     = "${local.name}-terraform-github-role"
  subjects = ["pjsier/ptap:*"] # TODO:

  policies = {
    EcrAccess     = aws_iam_policy.ecr_access.arn,
    LambdaAccess  = aws_iam_policy.lambda_access.arn
    S3StateAccess = aws_iam_policy.s3_state_access.arn
    S3AssetsAcess = aws_iam_policy.s3_assets_access.arn
    GetAccess     = aws_iam_policy.get_access.arn
  }

  tags = local.tags
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

  bucket        = "${local.name}-testing-assets"
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

module "ecr" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "1.6.0"

  repository_name = local.name
  repository_type = "private"

  repository_read_write_access_arns = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1,
        description  = "Keep last 3 images",
        selection = {
          tagStatus   = "any",
          countType   = "imageCountMoreThan",
          countNumber = 3
        },
        action = {
          type = "expire"
        }
      }
    ]
  })

  tags = local.tags
}

data "aws_ssm_parameter" "secret_key" {
  name = "/${local.name}/secret_key"
}

data "aws_ssm_paramter" "sendgrid_username" {
  name = "/${local.name}/sendgrid_username"
}

data "aws_ssm_parameter" "sendgrid_api_key" {
  name = "/${local.name}/sendgrid_api_key"
}

module "lambda" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "6.0.1"

  function_name  = local.name
  package_type   = "Image"
  create_package = false
  publish        = true

  image_uri = "${module.ecr.repository_url}:${var.lambda_image_tag}"

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
    SECRET_KEY          = data.aws_ssm_parameter.secret_key.value,
    SENDGRID_USERNAME   = data.aws_ssm_parameter.sendgrid_username.value
    SENDGRID_API_KEY    = data.aws_ssm_parameter.sendgrid_api_key.value,
    MAIL_DEFAULT_SENDER = "test@example.com",
    PTAP_MAIL           = "test@example.com",
    UOFM_MAIL           = "test@example.com",
    CHICAGO_MAIL        = "test@example.com",
    PTAP_SHEET_SID      = ""
  }

  tags = local.tags
}

# TODO: Maybe make 10-15 minutes?
resource "aws_cloudwatch_event_rule" "keep_warm" {
  name                = "${local.name}-keep-lambda-warm"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "keep_warm" {
  rule      = aws_cloudwatch_event_rule.keep_warm.name
  target_id = local.name
  arn       = module.lambda.lambda_function_arn
}

module "apigw" {
  source  = "terraform-aws-modules/apigateway-v2/aws"
  version = "2.2.2"

  name          = local.name
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
