#!/bin/bash
set -e

echo "========================================"
echo "Testing Docker Build Locally"
echo "========================================"

# Navigate to backend directory
cd "$(dirname "$0")/.."

# Build the Docker image
echo "Building Docker image..."
docker build -t hmc-backend:test .

echo ""
echo "========================================"
echo "Build successful! ✅"
echo "========================================"
echo ""
echo "To run the container locally:"
echo "  docker run -p 3000:3000 -e DATABASE_URL=your_db_url hmc-backend:test"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose -f docker-compose.prod.yml up"
echo ""
