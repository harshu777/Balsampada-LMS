#!/bin/bash

# Build and Push Docker Images to Docker Hub
# Usage: ./build-and-push.sh [version]
# Example: ./build-and-push.sh v1.0.0
# Author: Harshal Baviskar
# Project: Tuition LMS

set -e

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-harshalbaviskar}"  # Updated with your Docker Hub username
VERSION="${1:-latest}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    print_warning "Not logged in to Docker Hub. Logging in..."
    docker login
fi

print_message "Building and pushing images with version: $VERSION"
print_message "Docker Hub username: $DOCKER_USERNAME"

# Build and push backend
print_message "Building backend image..."
cd backend
docker build -t $DOCKER_USERNAME/tuition-lms-backend:$VERSION \
             -t $DOCKER_USERNAME/tuition-lms-backend:latest \
             -t $DOCKER_USERNAME/tuition-lms-backend:$TIMESTAMP .

print_message "Pushing backend image..."
docker push $DOCKER_USERNAME/tuition-lms-backend:$VERSION
docker push $DOCKER_USERNAME/tuition-lms-backend:latest
docker push $DOCKER_USERNAME/tuition-lms-backend:$TIMESTAMP

# Build and push frontend
print_message "Building frontend image..."
cd ../frontend
docker build -t $DOCKER_USERNAME/tuition-lms-frontend:$VERSION \
             -t $DOCKER_USERNAME/tuition-lms-frontend:latest \
             -t $DOCKER_USERNAME/tuition-lms-frontend:$TIMESTAMP .

print_message "Pushing frontend image..."
docker push $DOCKER_USERNAME/tuition-lms-frontend:$VERSION
docker push $DOCKER_USERNAME/tuition-lms-frontend:latest
docker push $DOCKER_USERNAME/tuition-lms-frontend:$TIMESTAMP

print_message "Successfully built and pushed all images!"
echo ""
echo "Images pushed:"
echo "  - $DOCKER_USERNAME/tuition-lms-backend:$VERSION"
echo "  - $DOCKER_USERNAME/tuition-lms-backend:latest"
echo "  - $DOCKER_USERNAME/tuition-lms-backend:$TIMESTAMP"
echo "  - $DOCKER_USERNAME/tuition-lms-frontend:$VERSION"
echo "  - $DOCKER_USERNAME/tuition-lms-frontend:latest"
echo "  - $DOCKER_USERNAME/tuition-lms-frontend:$TIMESTAMP"
echo ""
echo "To deploy to Kubernetes, update the image tags in your manifests:"
echo "  kubectl set image deployment/backend backend=$DOCKER_USERNAME/tuition-lms-backend:$VERSION -n tuition-lms"
echo "  kubectl set image deployment/frontend frontend=$DOCKER_USERNAME/tuition-lms-frontend:$VERSION -n tuition-lms"