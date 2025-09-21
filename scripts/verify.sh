#!/bin/bash

# Quickstart verification script
# Runs lint, typecheck, tests, build sequentially and exits non-zero on failure

set -e  # Exit on any command failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to run a step and capture its status
run_step() {
    local step_name="$1"
    local command="$2"
    
    print_step "Running $step_name..."
    
    if eval "$command"; then
        print_success "$step_name completed successfully"
        return 0
    else
        print_error "$step_name failed"
        return 1
    fi
}

# Main verification sequence
main() {
    echo -e "${BLUE}🔍 Blocks MVP Verification Script${NC}"
    echo "Running comprehensive checks: lint → typecheck → test → build"
    echo

    local start_time=$(date +%s)
    local failed_steps=()

    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        print_error "Must be run from project root directory"
        exit 1
    fi

    # Step 1: Lint
    if ! run_step "Lint" "npm run lint"; then
        failed_steps+=("lint")
    fi

    # Step 2: Type checking
    if ! run_step "Type checking" "npm run typecheck"; then
        failed_steps+=("typecheck")
    fi

    # Step 3: Tests
    if ! run_step "Tests" "npm run test"; then
        failed_steps+=("test")
    fi

    # Step 4: Build
    if ! run_step "Build" "npm run build"; then
        failed_steps+=("build")
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo
    echo "================================================"
    
    if [[ ${#failed_steps[@]} -eq 0 ]]; then
        print_success "All verification steps passed! ✨"
        echo -e "Duration: ${GREEN}${duration}s${NC}"
        echo
        echo "Your project is ready for:"
        echo "  • Development: npm run dev"
        echo "  • Testing: npm run test:e2e"
        echo "  • Deployment: Ready for CI/CD pipeline"
        exit 0
    else
        print_error "Verification failed on ${#failed_steps[@]} step(s): ${failed_steps[*]}"
        echo -e "Duration: ${RED}${duration}s${NC}"
        echo
        echo "To fix issues:"
        for step in "${failed_steps[@]}"; do
            case $step in
                "lint")
                    echo "  • Run: npm run lint -- --fix"
                    ;;
                "typecheck")
                    echo "  • Check TypeScript errors and fix types"
                    ;;
                "test")
                    echo "  • Run: npm run test -- --reporter=verbose"
                    ;;
                "build")
                    echo "  • Check build errors and dependencies"
                    ;;
            esac
        done
        exit 1
    fi
}

# Handle script interruption
trap 'print_warning "Verification interrupted"; exit 130' INT

# Run main function
main "$@"