#!/bin/bash

# Simple test runner for Paranormal Dynamics, Inc.

# Set color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Running all tests..."
echo "-------------------"

FAILED=0

for f in tests/*.js; do
    echo -n "Running $(basename "$f")... "
    if node "$f" > /dev/null 2>&1; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC}"
        # Run again without silencing output to show the error
        node "$f"
        FAILED=1
    fi
done

echo "-------------------"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
