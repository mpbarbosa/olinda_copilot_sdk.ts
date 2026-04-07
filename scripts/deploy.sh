#!/usr/bin/env bash
# scripts/deploy.sh — Build, publish olinda_copilot_sdk.ts to npm, and enable CDN delivery
# Invoked by: ai-workflow deploy
# Guards: working tree must be clean, tests must pass
# Optional: set NPM_TOKEN to also publish to npm; without it, only CDN delivery runs.

set -euo pipefail

# ── Cleanup ───────────────────────────────────────────────────────────────────
cleanup() {
  rm -f "${PROJECT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}/.npmrc"
}
trap cleanup EXIT

# ── Colour helpers ────────────────────────────────────────────────────────────
# shellcheck source=scripts/colors.sh
source "$(dirname "${BASH_SOURCE[0]}")/colors.sh"
info()  { echo -e "${BLUE}[deploy]${NC} $*"; }
ok()    { echo -e "${GREEN}[deploy] ✓${NC} $*"; }
warn()  { echo -e "${YELLOW}[deploy] ⚠${NC} $*"; }
fail()  { echo -e "${RED}[deploy] ✗${NC} $*" >&2; exit 1; }

# ── Guards ────────────────────────────────────────────────────────────────────
# NPM_TOKEN is optional: when absent (or SKIP_NPM_PUBLISH=true), steps 1-4 run
# normally and CDN delivery completes; only step 5 (npm publish) is skipped.
SKIP_NPM_PUBLISH="${SKIP_NPM_PUBLISH:-false}"
if [[ -z "${NPM_TOKEN:-}" ]]; then
  warn "NPM_TOKEN is not set — npm publish will be skipped."
  warn "Only CDN delivery (git tag + push) will be performed."
  warn "To also publish to npm, set NPM_TOKEN before running this script:"
  warn "  export NPM_TOKEN=npm_... && bash scripts/deploy.sh"
  SKIP_NPM_PUBLISH=true
fi

command -v npm >/dev/null 2>&1 || fail "npm not found on PATH."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# ── Read version info ─────────────────────────────────────────────────────────
PACKAGE_NAME="$(node -p "require('./package.json').name")"
VERSION="$(node -p "require('./package.json').version")"
PRERELEASE="$(node -p "('$VERSION'.match(/-([\w]+)/)||[])[1]||''")"
NPM_TAG="${PRERELEASE:-latest}"
TAG="v${VERSION}"
GH_REPO="mpbarbosa/olinda_copilot_sdk.ts"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   olinda_copilot_sdk.ts  ·  Deploy         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
info "Project root : $PROJECT_ROOT"
info "Package      : $PACKAGE_NAME"
info "Version      : $VERSION"
info "dist-tag     : $NPM_TAG"
info "Git tag      : $TAG"
echo ""

# ── Guard: clean working tree ─────────────────────────────────────────────────
if ! git diff --quiet || ! git diff --cached --quiet; then
  fail "Working tree is dirty. Commit or stash your changes first."
fi

# ── Guard: check whether tag already exists and whether it has been delivered ──
TAG_EXISTS_LOCALLY=false
if git rev-parse "${TAG}" >/dev/null 2>&1; then
  TAG_EXISTS_LOCALLY=true
  if git ls-remote --tags origin "refs/tags/${TAG}" 2>/dev/null | grep -q .; then
    warn "Tag ${TAG} already exists and is already on the remote."
    warn "Skipping build/test/tag steps — resuming from CDN delivery step."
    echo ""
  else
    warn "Tag ${TAG} exists locally but has not been pushed to the remote yet."
    warn "Skipping build/test steps and resuming from CDN delivery (push) step."
    echo ""
  fi
fi

if [[ "${TAG_EXISTS_LOCALLY}" == "false" ]]; then
  # ── Step 1/6 — Install + Validate ──────────────────────────────────────────
  info "Step 1/6 — Installing dependencies and type-checking …"
  npm ci --prefer-offline --no-audit
  npm run validate || fail "Type-check failed. Aborting deploy."
  ok "Dependencies installed and types valid"
  echo ""

  # ── Step 2/6 — Test ────────────────────────────────────────────────────────
  info "Step 2/6 — Running tests …"
  npm test || fail "Tests failed. Aborting deploy."
  ok "Tests passed"
  echo ""

  # ── Step 3/6 — Build (CJS + ESM) ───────────────────────────────────────────
  info "Step 3/6 — Building CJS and ESM bundles …"
  npm run build     || fail "CJS build failed. Aborting deploy."
  npm run build:esm || fail "ESM build failed. Aborting deploy."
  ok "Build complete (dist/ · dist/esm/)"
  echo ""
else
  info "Step 1/6 — Skipped (tag already built locally)"
  info "Step 2/6 — Skipped (tag already built locally)"
  info "Step 3/6 — Skipped (tag already built locally)"
  echo ""
fi

# ── Step 4/6 — CDN delivery (commit artifacts, tag & push to GitHub) ─────────
info "Step 4/6 — Enabling CDN delivery via GitHub …"

# Force-add compiled dist/ artifacts (dist/ is in .gitignore but must be
# committed to the GitHub tag for jsDelivr CDN delivery to work)
git add -f dist/
if git diff --cached --quiet; then
  warn "Build artifacts unchanged — skipping commit"
else
  git commit -m "chore: build artifacts for ${TAG}

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
  ok "Committed build artifacts"
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [[ -z "${CURRENT_BRANCH}" ]]; then
  fail "Could not determine current git branch (detached HEAD?)"
fi

git pull --rebase origin "${CURRENT_BRANCH}"

if [[ "${TAG_EXISTS_LOCALLY}" == "false" ]]; then
  git tag -a "${TAG}" -m "Release ${TAG}"
  ok "Created tag ${TAG}"
else
  info "Reusing existing local tag ${TAG}"
fi

git push origin "${CURRENT_BRANCH}" --tags
ok "Pushed to origin/${CURRENT_BRANCH} with tag ${TAG}"
echo ""

# ── Step 5/6 — Publish to npm ────────────────────────────────────────────────
if [[ "${SKIP_NPM_PUBLISH}" == "true" ]]; then
  info "Step 5/6 — npm publish skipped (NPM_TOKEN not set)"
  warn "To publish to npm, set NPM_TOKEN and re-run:"
  warn "  export NPM_TOKEN=npm_... && bash scripts/deploy.sh"
else
  info "Step 5/6 — Publishing to npm …"
  echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > "$PROJECT_ROOT/.npmrc"

  set +e
  PUBLISH_OUTPUT="$(npm publish --access public --tag "$NPM_TAG" 2>&1)"
  PUBLISH_EXIT=$?
  set -e
  echo "$PUBLISH_OUTPUT"

  if [[ $PUBLISH_EXIT -ne 0 ]]; then
    if echo "$PUBLISH_OUTPUT" | grep -q "Two-factor authentication\|bypass 2fa"; then
      echo -e "${RED}[deploy] ✗${NC} npm publish failed: 2FA bypass required." >&2
      echo -e "${BLUE}[deploy]${NC} Your token doesn't have 2FA bypass enabled." >&2
      echo -e "${BLUE}[deploy]${NC} Fix: create an Automation token at https://www.npmjs.com/settings/~/tokens" >&2
      echo -e "${BLUE}[deploy]${NC}   → Granular Access Token → enable 'Bypass 2FA' → Read and write" >&2
    elif echo "$PUBLISH_OUTPUT" | grep -q "403\|Forbidden\|credentials"; then
      echo -e "${RED}[deploy] ✗${NC} npm publish failed: invalid or expired token." >&2
      echo -e "${BLUE}[deploy]${NC} Verify NPM_TOKEN is a valid Automation token with publish rights." >&2
      echo -e "${BLUE}[deploy]${NC}   https://www.npmjs.com/settings/~/tokens" >&2
    elif echo "$PUBLISH_OUTPUT" | grep -q "cannot publish over\|already exists\|E409"; then
      echo -e "${RED}[deploy] ✗${NC} npm publish failed: version ${VERSION} is already published." >&2
      echo -e "${BLUE}[deploy]${NC} Bump the version in package.json before deploying." >&2
      exit 3
    elif echo "$PUBLISH_OUTPUT" | grep -q "404\|not found"; then
      echo -e "${RED}[deploy] ✗${NC} npm publish failed: registry or package not found." >&2
      echo -e "${BLUE}[deploy]${NC} Check the package name in package.json and the registry URL." >&2
    else
      echo -e "${RED}[deploy] ✗${NC} npm publish failed (exit $PUBLISH_EXIT)." >&2
    fi
    exit 1
  fi

  ok "Published ${PACKAGE_NAME}@${VERSION} to npm (tag: ${NPM_TAG})"
  echo ""
fi

# ── jsDelivr CDN URLs ─────────────────────────────────────────────────────────
info "jsDelivr CDN URLs for ${PACKAGE_NAME}@${VERSION}:"
echo ""
echo -e "  ${GREEN}GitHub (pinned to ${TAG})${NC}"
echo "    https://cdn.jsdelivr.net/gh/${GH_REPO}@${TAG}/dist/src/index.js"
echo "    https://cdn.jsdelivr.net/gh/${GH_REPO}@${TAG}/dist/esm/index.js"
echo "    https://cdn.jsdelivr.net/gh/${GH_REPO}@${TAG}/dist/types/src/index.d.ts"
echo ""
if [[ "${SKIP_NPM_PUBLISH}" != "true" ]]; then
  echo -e "  ${GREEN}npm (dist-tag: ${NPM_TAG})${NC}"
  echo "    https://cdn.jsdelivr.net/npm/${PACKAGE_NAME}@${NPM_TAG}/dist/src/index.js"
  echo "    https://cdn.jsdelivr.net/npm/${PACKAGE_NAME}@${NPM_TAG}/dist/esm/index.js"
  echo ""
  echo -e "  ${GREEN}npm (pinned to ${VERSION})${NC}"
  echo "    https://cdn.jsdelivr.net/npm/${PACKAGE_NAME}@${VERSION}/dist/src/index.js"
  echo "    https://cdn.jsdelivr.net/npm/${PACKAGE_NAME}@${VERSION}/dist/esm/index.js"
  echo "    https://cdn.jsdelivr.net/npm/${PACKAGE_NAME}@${VERSION}/dist/types/src/index.d.ts"
  echo ""
fi

ok "Deployment of ${TAG} complete! 🚀"
echo ""

# ── Step 6/6 — CDN availability check ────────────────────────────────────────
info "Step 6/6 — Checking CDN availability for ${TAG} …"

MAIN_FILE="dist/src/index.js"
GITHUB_USER="${GH_REPO%%/*}"
GITHUB_REPO_NAME="${GH_REPO##*/}"
CDN_URL="https://cdn.jsdelivr.net/gh/${GH_REPO}@${VERSION}/${MAIN_FILE}"

_cdn_purge() {
  local url="$1"
  local purge_url="${url/cdn.jsdelivr.net/purge.jsdelivr.net}"
  curl -s -o /dev/null --max-time 10 "${purge_url}" || true
}

_github_raw_check() {
  local gh_user="$1" gh_repo="$2" git_tag="$3" rel_path="$4"
  local raw_url="https://raw.githubusercontent.com/${gh_user}/${gh_repo}/${git_tag}/${rel_path}"
  curl -s -f -o /dev/null --max-time 10 "${raw_url}"
}

_cdn_check() {
  local label="$1" url="$2" max_retries=5 interval=30
  _cdn_purge "${url}"
  for ((attempt=1; attempt<=max_retries; attempt++)); do
    if curl -s -f -o /dev/null --max-time 10 "${url}"; then
      ok "${label} is live on jsDelivr ✓"
      echo "    ${url}"
      return 0
    fi
    if [[ ${attempt} -lt ${max_retries} ]]; then
      warn "${label}: not ready yet (attempt ${attempt}/${max_retries}) — retrying in ${interval}s …"
      sleep "${interval}"
    fi
  done
  warn "${label}: not yet available on CDN after ${max_retries} attempts."
  echo "    Check manually: ${url}"
  return 0
}

if command -v curl &>/dev/null; then
  if _github_raw_check "${GITHUB_USER}" "${GITHUB_REPO_NAME}" "${TAG}" "${MAIN_FILE}"; then
    ok "${MAIN_FILE} is committed and visible on GitHub ✓"
  else
    warn "${MAIN_FILE} not found on GitHub — CDN delivery will fail"
  fi
  _cdn_check "${GITHUB_REPO_NAME} ${TAG}" "${CDN_URL}" || true
else
  warn "curl not found — skipping CDN check"
  echo "    Verify manually: ${CDN_URL}"
fi
echo ""
