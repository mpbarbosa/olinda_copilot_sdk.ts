#!/usr/bin/env bash
# ==============================================================================
# Docker Test Runner for olinda_copilot_sdk.ts
# ==============================================================================
# Builds a temporary Docker image with the project source and runs the full
# Jest test suite inside an isolated container.  The container is removed
# automatically after the run.
#
# Usage:
#   bash scripts/run-tests-docker.sh [-- <extra jest args>]
#
# Examples:
#   bash scripts/run-tests-docker.sh
#   bash scripts/run-tests-docker.sh -- --coverage
#   bash scripts/run-tests-docker.sh -- --testPathPattern=completions
#   bash scripts/run-tests-docker.sh -- --verbose
#
# To extract the coverage report to the host, use the docker run command
# directly with a volume mount:
#   docker run --rm \
#     -e CI=true \
#     -v "$(pwd)/coverage:/app/coverage" \
#     olinda_copilot_sdk-test \
#     npm test -- --runInBand --coverage
#
# Requirements:
#   docker  (Desktop or Engine, daemon must be running)
# ==============================================================================

set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────────────
# shellcheck source=scripts/colors.sh
source "$(dirname "${BASH_SOURCE[0]}")/colors.sh"

info()    { echo -e "${BLUE}ℹ  $*${NC}"; }
success() { echo -e "${GREEN}✓  $*${NC}"; }
warn()    { echo -e "${YELLOW}⚠  $*${NC}"; }
error()   { echo -e "${RED}✗  $*${NC}" >&2; }

# ── Resolve project root ──────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# ── Parse extra args passed after "--" ───────────────────────────────────────
EXTRA_JEST_ARGS=()
if [[ $# -gt 0 && "$1" == "--" ]]; then
  shift
  EXTRA_JEST_ARGS=("$@")
fi

# ── Config ────────────────────────────────────────────────────────────────────
IMAGE_NAME="olinda_copilot_sdk-test"
PACKAGE_VERSION="$(node -p "require('./package.json').version")"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  olinda_copilot_sdk.ts  ·  Docker Test Run  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""
info "Project root : ${PROJECT_ROOT}"
info "Version      : ${PACKAGE_VERSION}"
info "Node image   : node:20-alpine (Dockerfile.test)"
[[ ${#EXTRA_JEST_ARGS[@]} -gt 0 ]] && info "Extra args   : ${EXTRA_JEST_ARGS[*]}"
echo ""

# ── Pre-flight: docker daemon ─────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  error "docker not found in PATH — please install Docker and try again."
  exit 1
fi

if ! docker info &>/dev/null; then
  error "Docker daemon is not running — please start it and try again."
  exit 1
fi

# ── 1. Build Docker image from Dockerfile.test ───────────────────────────────
info "Step 1/3 — Building Docker image (${IMAGE_NAME}) …"

docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t "${IMAGE_NAME}" \
  -f Dockerfile.test \
  "${PROJECT_ROOT}"

success "Image built: ${IMAGE_NAME}"
echo ""

# ── 2. Run tests inside a disposable container ────────────────────────────────
info "Step 2/3 — Running tests inside Docker container …"
echo ""

# Always run with --runInBand inside Docker: parallel workers can create a race
# where one worker's VM context is torn down while another worker's async module
# imports are still queued (ReferenceError: import after environment torn down).
# Running serially in one process eliminates that race entirely.
JEST_ARGS="--runInBand"
if [[ ${#EXTRA_JEST_ARGS[@]} -gt 0 ]]; then
  JEST_ARGS+=" ${EXTRA_JEST_ARGS[*]}"
fi
TEST_CMD="npm test -- ${JEST_ARGS}"

set +e   # allow non-zero exit so we can report cleanly
docker run \
  --rm \
  --name "${IMAGE_NAME}-run" \
  -e CI=true \
  "${IMAGE_NAME}" \
  sh -c "${TEST_CMD}"
TEST_EXIT_CODE=$?
set -e

echo ""

# ── 3. Report result ──────────────────────────────────────────────────────────
info "Step 3/3 — Done."
echo ""

if [[ ${TEST_EXIT_CODE} -eq 0 ]]; then
  success "All tests passed inside Docker 🎉"
else
  error "Tests failed (exit code ${TEST_EXIT_CODE})"
fi

echo ""
exit "${TEST_EXIT_CODE}"
