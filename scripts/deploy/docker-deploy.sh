#!/bin/bash

# Docker deployment script for local/staging environments
set -e

echo "🚀 Starting Blocks MVP deployment..."

# Configuration
COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="blocks"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    log_info "Prerequisites check passed ✓"
}

# Build images
build_images() {
    log_info "Building Docker images..."
    
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME build --no-cache
    
    if [ $? -eq 0 ]; then
        log_info "Images built successfully ✓"
    else
        log_error "Failed to build images"
        exit 1
    fi
}

# Deploy services
deploy_services() {
    log_info "Deploying services..."
    
    # Stop existing services
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
    
    # Start new services
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d
    
    if [ $? -eq 0 ]; then
        log_info "Services deployed successfully ✓"
    else
        log_error "Failed to deploy services"
        exit 1
    fi
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    # Wait for services to start
    sleep 10
    
    # Check backend health
    BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health || echo "000")
    if [ "$BACKEND_HEALTH" = "200" ]; then
        log_info "Backend health check passed ✓"
    else
        log_warn "Backend health check failed (HTTP $BACKEND_HEALTH)"
    fi
    
    # Check frontend health
    FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
    if [ "$FRONTEND_HEALTH" = "200" ]; then
        log_info "Frontend health check passed ✓"
    else
        log_warn "Frontend health check failed (HTTP $FRONTEND_HEALTH)"
    fi
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    
    echo ""
    log_info "Services available at:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8080"
    echo "  API Docs: http://localhost:8080/api"
}

# Main deployment flow
main() {
    echo "=============================================="
    echo "🏗️  Blocks MVP Docker Deployment"
    echo "=============================================="
    
    check_prerequisites
    build_images
    deploy_services
    health_check
    show_status
    
    echo ""
    log_info "Deployment completed successfully! 🎉"
    echo "=============================================="
}

# Handle command line arguments
case "${1:-}" in
    "build")
        check_prerequisites
        build_images
        ;;
    "deploy")
        check_prerequisites
        deploy_services
        health_check
        show_status
        ;;
    "status")
        show_status
        ;;
    "stop")
        log_info "Stopping services..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
        ;;
    "logs")
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f
        ;;
    *)
        main
        ;;
esac