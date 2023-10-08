terraform {
  required_version = ">= 1.0"

  # TODO: local state to start
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
data "aws_availability_zones" "available" {}

locals {
  name     = "ptap"
  vpc_cidr = "10.0.0.0/16"
  azs      = slice(data.aws_availability_zones.available.names, 0, 3)
}

module "iam_github_oidc_provider" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-provider"
  version = "5.30.0"
}

resource "aws_iam_policy" "s3_state_access" {
  name = "${local.name}-s3-state-access"

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
          "ecr:PutImage"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
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
          "${module.lambda.lambda_function_arn}/*"
        ]
      },
    ]
  })
}

module "iam_github_oidc_role" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-role"
  version = "5.30.0"

  name     = "${local.name}-terraform-github-role"
  subjects = ["pjsier/ptap:*"]

  policies = {
    EcrAccess    = aws_iam_policy.ecr_access.arn,
    LambdaAccess = aws_iam_policy.lambda_access.arn
    S3StateAccess = aws_iam_policy.s3_state_access.arn
  }

  tags = {
    Environment = "test"
  }
}

# TODO: S3 bucket for loading data, assets

module "ecr" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "1.6.0"

  repository_name = local.name
  repository_type = "private"

  repository_read_write_access_arns = [data.aws_caller_identity.current.arn]
  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1,
        description  = "Keep last 5 images",
        selection = {
          tagStatus   = "any",
          countType   = "imageCountMoreThan",
          countNumber = 5
        },
        action = {
          type = "expire"
        }
      }
    ]
  })

  # TODO:
  # tags
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
    }
  }

  # tags = {
  #   Name = "my-lambda1"
  # }
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

  # Custom domain
  # domain_name                 = "terraform-aws-modules.modules.tf"
  # domain_name_certificate_arn = "arn:aws:acm:eu-west-1:052235179155:certificate/2b3a7ed9-05e1-4f9e-952b-27744ba06da6"

  # payload_format_version 1.0 is needed for awsgi
  integrations = {
    "ANY /{proxy+}" = {
      lambda_arn             = module.lambda.lambda_function_arn
      payload_format_version = "1.0"
      timeout_milliseconds   = 12000
    }

    "$default" = {
      lambda_arn             = module.lambda.lambda_function_arn
      payload_format_version = "1.0"
      timeout_milliseconds   = 12000
    }
  }
}

# resource "aws_ssm_parameter" "db_name" {
#   name = "/${local.name}/database/name"
#   type = "SecureString"

#   value = ""
# }

# resource "aws_ssm_parameter" "db_username" {
#   name = "/${local.name}/database/username"
#   type = "SecureString"

#   value = ""
# }

# resource "aws_ssm_parameter" "db_password" {
#   name = "/${local.name}/database/password"
#   type = "SecureString"

#   value = ""
# }

# module "vpc" {
#   source  = "terraform-aws-modules/vpc/aws"
#   version = "~> 5.0"

#   name = local.name
#   cidr = local.vpc_cidr

#   azs              = local.azs
#   public_subnets   = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k)]
#   private_subnets  = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 3)]
#   database_subnets = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 6)]

#   create_database_subnet_group = true

#   # tags = local.tags
# }

# module "security_group" {
#   source  = "terraform-aws-modules/security-group/aws"
#   version = "~> 5.0"

#   name        = local.name
#   description = "Complete PostgreSQL example security group"
#   vpc_id      = module.vpc.vpc_id

#   # ingress
#   ingress_with_cidr_blocks = [
#     {
#       from_port   = 5432
#       to_port     = 5432
#       protocol    = "tcp"
#       description = "PostgreSQL access from within VPC"
#       cidr_blocks = module.vpc.vpc_cidr_block
#     },
#   ]

#   # tags = local.tags
# }

# module "rds" {
#   source  = "terraform-aws-modules/rds/aws"
#   version = "6.1.1"

#   identifier = local.name

#   engine               = "postgres"
#   engine_version       = "14"
#   family               = "postgres14"
#   major_engine_version = "14"
#   instance_class       = "db.t4g.micro"

#   allocated_storage     = 5
#   max_allocated_storage = 20

#   db_name  = aws_ssm_parameter.db_name.value
#   username = aws_ssm_parameter.db_username.value
#   port     = 5432

#   multi_az               = true
#   db_subnet_group_name   = module.vpc.database_subnet_group
#   vpc_security_group_ids = [module.security_group.security_group_id]
#   publicly_accessible    = true

#   maintenance_window              = "Mon:00:00-Mon:03:00"
#   backup_window                   = "03:00-06:00"
#   enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
#   create_cloudwatch_log_group     = true

#   backup_retention_period = 1
#   skip_final_snapshot     = true
#   deletion_protection     = false

#   performance_insights_enabled          = true
#   performance_insights_retention_period = 7
#   create_monitoring_role                = true
#   monitoring_interval                   = 60

#   parameters = [
#     {
#       name  = "autovacuum"
#       value = 1
#     },
#     {
#       name  = "client_encoding"
#       value = "utf8"
#     }
#   ]

#   monitoring_role_name            = "${local.name}-rds-monitoring-role-name"
#   monitoring_role_use_name_prefix = true

#   # TODO:
#   # iam_database_authentication_enabled = true

# }
