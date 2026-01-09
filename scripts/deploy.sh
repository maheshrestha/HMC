#!/bin/bash
set -e

# Configuration
ENV=${1:-dev}
REGION=${2:-ap-southeast-2}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME="hmc-backend-${ENV}"
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO_NAME}"
IMAGE_TAG=${3:-latest}

echo "========================================"
echo "Deploying Backend to ECS"
echo "Environment: ${ENV}"
echo "Region: ${REGION}"
echo "Image Tag: ${IMAGE_TAG}"
echo "========================================"

# Navigate to backend directory
cd "$(dirname "$0")/.."

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_URI}

# Build Docker image
echo "Building Docker image..."
docker build -t ${REPO_NAME}:${IMAGE_TAG} .

# Tag image for ECR
echo "Tagging image..."
docker tag ${REPO_NAME}:${IMAGE_TAG} ${ECR_URI}:${IMAGE_TAG}
docker tag ${REPO_NAME}:${IMAGE_TAG} ${ECR_URI}:latest

# Push to ECR
echo "Pushing image to ECR..."
docker push ${ECR_URI}:${IMAGE_TAG}
docker push ${ECR_URI}:latest

# Get ECS cluster and service names
CLUSTER_NAME="hmc-backend-${ENV}"
SERVICE_NAME="hmc-backend-${ENV}"

# Force new deployment
echo "Triggering ECS service update..."
aws ecs update-service \
  --cluster ${CLUSTER_NAME} \
  --service ${SERVICE_NAME} \
  --force-new-deployment \
  --region ${REGION}

echo "========================================"
echo "Deployment initiated successfully!"
echo "Monitor deployment status:"
echo "aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} --region ${REGION}"
echo "========================================"
