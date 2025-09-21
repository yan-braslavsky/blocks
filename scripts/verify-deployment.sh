#!/bin/bash

# Deployment verification script
set -e

echo "🔍 Verifying deployment configuration..."

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

# Check deployment files
check_deployment_files() {
    log_info "Checking deployment files..."
    
    FILES=(
        "docker-compose.yml"
        "frontend/Dockerfile"
        "backend/Dockerfile"
        "k8s/backend.yaml"
        "k8s/frontend.yaml"
        "k8s/ingress.yaml"
        "scripts/deploy/docker-deploy.sh"
        "scripts/deploy/k8s-deploy.sh"
        "docs/deployment.md"
        ".env.production"
        ".env.staging"
    )
    
    for file in "${FILES[@]}"; do
        if [ -f "$file" ]; then
            log_info "✓ $file exists"
        else
            log_error "✗ $file missing"
        fi
    done
}

# Check Docker configurations
check_docker_config() {
    log_info "Checking Docker configurations..."
    
    # Check if docker-compose.yml is valid
    if command -v docker-compose &> /dev/null; then
        if docker-compose config &> /dev/null; then
            log_info "✓ docker-compose.yml is valid"
        else
            log_warn "✗ docker-compose.yml validation failed"
        fi
    else
        log_warn "docker-compose not available for validation"
    fi
    
    # Check Dockerfile syntax
    for dockerfile in "frontend/Dockerfile" "backend/Dockerfile"; do
        if [ -f "$dockerfile" ]; then
            # Basic syntax check
            if grep -q "FROM" "$dockerfile" && grep -q "COPY" "$dockerfile"; then
                log_info "✓ $dockerfile has basic structure"
            else
                log_warn "✗ $dockerfile may have syntax issues"
            fi
        fi
    done
}

# Check Kubernetes configurations
check_k8s_config() {
    log_info "Checking Kubernetes configurations..."
    
    if command -v kubectl &> /dev/null; then
        for manifest in k8s/*.yaml; do
            if kubectl apply --dry-run=client -f "$manifest" &> /dev/null; then
                log_info "✓ $(basename $manifest) is valid"
            else
                log_warn "✗ $(basename $manifest) validation failed"
            fi
        done
    else
        log_warn "kubectl not available for validation"
    fi
}

# Check environment files
check_env_files() {
    log_info "Checking environment files..."
    
    for env_file in ".env.production" ".env.staging"; do
        if [ -f "$env_file" ]; then
            if grep -q "NODE_ENV" "$env_file" && grep -q "PORT" "$env_file"; then
                log_info "✓ $env_file has required variables"
            else
                log_warn "✗ $env_file missing required variables"
            fi
        fi
    done
}

# Check script permissions
check_scripts() {
    log_info "Checking script permissions..."
    
    SCRIPTS=(
        "scripts/deploy/docker-deploy.sh"
        "scripts/deploy/k8s-deploy.sh"
    )
    
    for script in "${SCRIPTS[@]}"; do
        if [ -x "$script" ]; then
            log_info "✓ $script is executable"
        else
            log_warn "✗ $script is not executable"
        fi
    done
}

# Check build configurations
check_build_config() {
    log_info "Checking build configurations..."
    
    # Check Next.js config for standalone output
    if grep -q "output: 'standalone'" "frontend/next.config.js"; then
        log_info "✓ Next.js configured for standalone output"
    else
        log_warn "✗ Next.js not configured for standalone output"
    fi
    
    # Check package.json files exist
    PACKAGES=(
        "package.json"
        "frontend/package.json"
        "backend/package.json"
        "shared/package.json"
    )
    
    for package in "${PACKAGES[@]}"; do
        if [ -f "$package" ]; then
            log_info "✓ $package exists"
        else
            log_error "✗ $package missing"
        fi
    done
}

# Main verification
main() {
    echo "=============================================="
    echo "🔍 Blocks MVP Deployment Verification"
    echo "=============================================="
    
    check_deployment_files
    check_docker_config
    check_k8s_config
    check_env_files
    check_scripts
    check_build_config
    
    echo ""
    log_info "Deployment verification completed! ✅"
    echo "=============================================="
    echo ""
    echo "Next steps:"
    echo "1. Start Docker daemon to test local deployment"
    echo "2. Run: ./scripts/deploy/docker-deploy.sh"
    echo "3. Configure Kubernetes cluster for production"
    echo "4. Run: ./scripts/deploy/k8s-deploy.sh -r <registry> -v <version>"
}

# Run verification
main