#!/bin/bash

# Kubernetes deployment script for production environments
set -e

echo "☸️  Starting Kubernetes deployment..."

# Configuration
NAMESPACE="blocks"
REGISTRY=""
VERSION=""

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

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -r, --registry REGISTRY   Container registry URL"
    echo "  -v, --version VERSION     Application version/tag"
    echo "  -n, --namespace NAMESPACE Kubernetes namespace (default: blocks)"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -r myregistry.com -v v1.0.0"
    echo "  $0 --registry ghcr.io/myorg --version latest"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    if [ -z "$REGISTRY" ]; then
        log_error "Registry URL is required (-r/--registry)"
        exit 1
    fi
    
    if [ -z "$VERSION" ]; then
        log_error "Version is required (-v/--version)"
        exit 1
    fi
    
    log_info "Prerequisites check passed ✓"
}

# Create namespace if not exists
create_namespace() {
    log_info "Creating namespace if not exists..."
    
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    log_info "Namespace '$NAMESPACE' ready ✓"
}

# Update manifests with registry and version
update_manifests() {
    log_info "Updating Kubernetes manifests..."
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    cp -r k8s/* $TEMP_DIR/
    
    # Update image references
    sed -i.bak "s|blocks-backend:latest|$REGISTRY/blocks-backend:$VERSION|g" $TEMP_DIR/*.yaml
    sed -i.bak "s|blocks-frontend:latest|$REGISTRY/blocks-frontend:$VERSION|g" $TEMP_DIR/*.yaml
    
    log_info "Manifests updated ✓"
    echo "TEMP_DIR=$TEMP_DIR"
}

# Deploy to Kubernetes
deploy_k8s() {
    log_info "Deploying to Kubernetes..."
    
    # Apply manifests
    kubectl apply -f $TEMP_DIR/backend.yaml -n $NAMESPACE
    kubectl apply -f $TEMP_DIR/frontend.yaml -n $NAMESPACE
    
    # Wait for rollout
    kubectl rollout status deployment/blocks-backend -n $NAMESPACE --timeout=300s
    kubectl rollout status deployment/blocks-frontend -n $NAMESPACE --timeout=300s
    
    log_info "Deployment completed ✓"
}

# Deploy ingress
deploy_ingress() {
    log_info "Deploying ingress..."
    
    kubectl apply -f $TEMP_DIR/ingress.yaml -n $NAMESPACE
    
    log_info "Ingress deployed ✓"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    # Check pods status
    kubectl get pods -n $NAMESPACE -l app=blocks-backend
    kubectl get pods -n $NAMESPACE -l app=blocks-frontend
    
    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -l app=blocks-backend -n $NAMESPACE --timeout=120s
    kubectl wait --for=condition=ready pod -l app=blocks-frontend -n $NAMESPACE --timeout=120s
    
    log_info "Health checks passed ✓"
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"
    
    echo ""
    echo "Pods:"
    kubectl get pods -n $NAMESPACE
    
    echo ""
    echo "Services:"
    kubectl get services -n $NAMESPACE
    
    echo ""
    echo "Ingress:"
    kubectl get ingress -n $NAMESPACE
}

# Cleanup function
cleanup() {
    if [ ! -z "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
        rm -rf $TEMP_DIR
    fi
}

# Trap cleanup on exit
trap cleanup EXIT

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Main deployment flow
main() {
    echo "=============================================="
    echo "☸️  Blocks MVP Kubernetes Deployment"
    echo "=============================================="
    
    check_prerequisites
    create_namespace
    update_manifests
    deploy_k8s
    deploy_ingress
    health_check
    show_status
    
    echo ""
    log_info "Kubernetes deployment completed successfully! 🎉"
    echo "=============================================="
}

# Run main function
main