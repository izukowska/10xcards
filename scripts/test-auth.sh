#!/bin/bash

# Quick script to run authentication E2E tests
# Usage: ./scripts/test-auth.sh [login|register|all]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 10x-cards Authentication E2E Tests${NC}\n"

# Check if .env.test exists
if [ ! -f .env.test ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.test file not found${NC}"
    echo "Creating from .env.test.example..."
    if [ -f .env.test.example ]; then
        cp .env.test.example .env.test
        echo -e "${GREEN}✓ Created .env.test - please update with your credentials${NC}\n"
    else
        echo -e "${YELLOW}Please create .env.test with test credentials${NC}\n"
    fi
fi

# Determine which tests to run
TEST_SUITE=${1:-all}

case $TEST_SUITE in
    login)
        echo -e "${GREEN}Running login tests...${NC}\n"
        npx playwright test auth/login.spec.ts
        ;;
    register)
        echo -e "${GREEN}Running registration tests...${NC}\n"
        npx playwright test auth/register.spec.ts
        ;;
    all)
        echo -e "${GREEN}Running all authentication tests...${NC}\n"
        npx playwright test auth/
        ;;
    *)
        echo -e "${YELLOW}Unknown test suite: $TEST_SUITE${NC}"
        echo "Usage: $0 [login|register|all]"
        exit 1
        ;;
esac

echo -e "\n${GREEN}✓ Tests completed!${NC}"
echo -e "${BLUE}View report: npx playwright show-report${NC}"
