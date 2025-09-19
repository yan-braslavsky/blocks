#!/usr/bin/env bash
set -euo pipefail
# Usage examples:
#   PR_BODY_FILE=pr_body.txt .specify/scripts/bash/check-pr-principles.sh
#   PR_BODY="$(gh pr view 123 --json body -q .body)" .specify/scripts/bash/check-pr-principles.sh

# check-pr-principles.sh
# Validates that a PR description contains at least one constitution principle reference.
# Intended to run in CI with the PR body passed via env or file.

PR_BODY_FILE=${PR_BODY_FILE:-}
PR_BODY=${PR_BODY:-}
CONSTITUTION_PATH=".specify/memory/constitution.md"

if [[ ! -f "$CONSTITUTION_PATH" ]]; then
  echo "ERROR: Constitution file not found at $CONSTITUTION_PATH" >&2
  exit 2
fi

if [[ -n "$PR_BODY_FILE" && -f "$PR_BODY_FILE" ]]; then
  PR_BODY=$(cat "$PR_BODY_FILE")
fi

if [[ -z "$PR_BODY" ]]; then
  echo "ERROR: PR body not provided. Set PR_BODY or PR_BODY_FILE." >&2
  exit 2
fi

# Extract principle identifiers (Roman numerals + title) from constitution
mapfile -t PRINCIPLES < <(grep -E '^### [IVX]+\. ' "$CONSTITUTION_PATH" | sed 's/^### //')

if [[ ${#PRINCIPLES[@]} -eq 0 ]]; then
  echo "ERROR: No principles parsed from constitution." >&2
  exit 2
fi

FOUND=0
for p in "${PRINCIPLES[@]}"; do
  # Accept match if either full line title or just the numeral appears (e.g., "Outcome Over Features")
  TITLE=$(echo "$p" | cut -d' ' -f2-)
  NUMERAL=$(echo "$p" | cut -d'.' -f1)
  if grep -qiE "${TITLE}|${NUMERAL}" <(echo "$PR_BODY"); then
    FOUND=1
    break
  fi
done

if [[ $FOUND -eq 0 ]]; then
  echo "❌ No constitution principle reference detected in PR body." >&2
  echo "Add a 'Principle Referenced' section citing at least one principle title or numeral." >&2
  exit 1
fi

echo "✅ Principle reference detected." 
