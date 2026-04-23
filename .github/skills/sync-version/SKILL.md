---
name: sync-version
description: >
  Read the canonical version from package.json and check it against every
  file in the repository that carries a version string. Fix any inconsistency
  found. Use this skill whenever the project version has been bumped in
  package.json and the change needs to propagate to all dependent files, or
  when a version audit is needed before a release.
---

## Overview

`package.json` → `version` is the **single source of truth** for the
project version. Every other file that contains a version string must agree
with it. This skill audits all known locations, reports mismatches, and
applies targeted fixes.

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         sync-version                                │
│                                                                     │
│  1. Read PKG_VERSION from package.json                              │
│  2. Parse → MAJOR · MINOR · PATCH · PRERELEASE                      │
│  3. Check each file in the canonical list                           │
│  4. Report mismatches                                               │
│  5. Fix each mismatch (targeted sed / node script)                  │
│  6. Re-validate (npm run validate + npm test)                       │
│  7. Commit all changes                                              │
└─────────────────────────────────────────────────────────────────────┘
```

The skill is also available as a GitHub Actions workflow:
**`.github/workflows/sync-version.yml`** — triggered on `workflow_dispatch`
or automatically on pushes to `main` that modify `package.json`.

---

## Canonical version locations

The following files are checked in order. Each entry lists the file, the
pattern that must match, and how to fix it if it does not.

### 1. `src/config/version.ts` — VERSION object fields

| Field | Expected value | Fix |
|-------|---------------|-----|
| `major:` | `MAJOR` (number) | Replace the integer literal on that line |
| `minor:` | `MINOR` (number) | Replace the integer literal on that line |
| `patch:` | `PATCH` (number) | Replace the integer literal on that line |
| `prerelease:` | `"PRERELEASE"` (string) | Replace the quoted string on that line |

Also update the `@example` JSDoc comment in the same file:
`VERSION.toString(); // "X.Y.Z-PRERELEASE"`

### 2. `src/index.ts` — JSDoc `@version` tag

Pattern: `* @version X.Y.Z-PRERELEASE`
Fix: replace the version string on that line.

### 3. `src/utils/debounce.ts` — JSDoc `@since` tag

Pattern: `* @since X.Y.Z-PRERELEASE`
Fix: replace the version string on that line.

### 4. `src/utils/throttle.ts` — JSDoc `@since` tag

Pattern: `* @since X.Y.Z-PRERELEASE`
Fix: replace the version string on that line.

### 5. `README.md` — version badge and CDN URLs

All of the following must use `PKG_VERSION`:

- `**Version:** X.Y.Z-PRERELEASE`
- `ibira.js@X.Y.Z-PRERELEASE` in CDN `<script>` tags and `import` URLs
- `@X.Y.Z-PRERELEASE` inline reference in prose

Fix: replace every occurrence of the old version string in this file.

### 6. `docs/API.md` — version badge and example output

- `**Version:** X.Y.Z-PRERELEASE`
- Any `VERSION.toString() // "X.Y.Z-PRERELEASE"` example comment

Fix: replace every occurrence of the old version string in this file.

### 7. `docs/INDEX.md` — CDN production URL

Pattern: `ibira.js@X.Y.Z-PRERELEASE` in the production CDN URL line.
Fix: replace the version in that URL.

### 8. `.workflow-config.yaml` — workflow version field

Pattern: `version: "X.Y.Z-PRERELEASE"`
Fix: replace the quoted version string on that line.

### 9. `ROADMAP.md` — current version header line

Pattern: `> **Current version:** X.Y.Z-PRERELEASE`
Fix: replace only this header line; do **not** touch version strings in the
roadmap table body (those are historical records of past releases).

---

## Files explicitly excluded from auto-fix

| File | Reason |
|------|--------|
| `CHANGELOG.md` | All version entries are historical; never overwrite past entries |
| `package-lock.json` | Managed by npm; updated by `npm install` / `npm ci` |
| `node_modules/` | Never modified directly |
| `.ai_workflow/` | AI-generated log files; not project source |
| `test/` and `__tests__/` | Version strings in tests are assertions against the live VERSION object — they must always reflect the actual value read at runtime; any mismatch here means `src/config/version.ts` was wrong, not the test |

---

## Step-by-step execution

### Step 1 — Read canonical version

```bash
PKG_VERSION="$(node -p "require('./package.json').version")"
```

Parse into components:

```bash
VERSION_CORE="${PKG_VERSION%%-*}"    # "0.4.4"
PRERELEASE="${PKG_VERSION#*-}"       # "alpha"  (empty string if no dash)
MAJOR="${VERSION_CORE%%.*}"
REST="${VERSION_CORE#*.}"
MINOR="${REST%%.*}"
PATCH="${REST#*.}"
```

Print: `ℹ️  Canonical version: PKG_VERSION (MAJOR.MINOR.PATCH, prerelease: PRERELEASE)`

### Step 2 — Detect old version (for targeted replacement)

When running as a workflow after a `package.json` change, the previous
version is available via `git diff HEAD~1 -- package.json`. When running
manually, scan each target file for any version string that does **not**
match `PKG_VERSION` and treat it as the old version.

```bash
# Automated detection from git history
OLD_VERSION="$(git diff HEAD~1 -- package.json 2>/dev/null \
  | grep '^-.*"version"' \
  | grep -oP '\d+\.\d+\.\d+-\w+')" || OLD_VERSION=""
```

If `OLD_VERSION` is empty (no prior commit or no change), fall back to
scanning each file individually (see Step 3).

### Step 3 — Check each file

For each file in the canonical list, determine whether it contains
`PKG_VERSION` where expected. Collect mismatches into a report table:

```
File                         | Expected           | Found              | Status
src/config/version.ts        | patch: 4           | patch: 1           | ✗ MISMATCH
README.md                    | @0.4.20-alpha       | @0.4.3-alpha       | ✗ MISMATCH
docs/API.md                  | 0.4.20-alpha        | 0.4.20-alpha        | ✓ OK
```

For `src/config/version.ts`, check each field individually:

```bash
node - <<'EOF'
const fs   = require('fs');
const src  = fs.readFileSync('src/config/version.ts', 'utf8');
const pkg  = require('./package.json');
const [core, pre] = pkg.version.split('-');
const [maj, min, pat] = core.split('.').map(Number);

const mismatch = [];
if (!src.match(new RegExp(`\\bmajor:\\s*${maj}\\b`)))      mismatch.push(`major: expected ${maj}`);
if (!src.match(new RegExp(`\\bminor:\\s*${min}\\b`)))      mismatch.push(`minor: expected ${min}`);
if (!src.match(new RegExp(`\\bpatch:\\s*${pat}\\b`)))      mismatch.push(`patch: expected ${pat}`);
if (!src.includes(`prerelease: "${pre}"`))                 mismatch.push(`prerelease: expected "${pre}"`);

if (mismatch.length) {
  console.log('MISMATCH: src/config/version.ts');
  mismatch.forEach(m => console.log('  ' + m));
} else {
  console.log('OK: src/config/version.ts');
}
EOF
```

### Step 4 — Fix mismatches

Apply fixes only to files that have mismatches. Never touch files that
are already correct.

**Fix `src/config/version.ts`** — use a Node script for precision:

```bash
node - <<'EOF'
const fs   = require('fs');
const pkg  = require('./package.json');
const [core, pre] = pkg.version.split('-');
const [maj, min, pat] = core.split('.').map(Number);

let src = fs.readFileSync('src/config/version.ts', 'utf8');
src = src.replace(/(\bmajor:\s*)\d+/,       `$1${maj}`);
src = src.replace(/(\bminor:\s*)\d+/,       `$1${min}`);
src = src.replace(/(\bpatch:\s*)\d+/,       `$1${pat}`);
src = src.replace(/(prerelease:\s*")[^"]*"/, `$1${pre}"`);
// Update @example JSDoc comment
src = src.replace(
  /(VERSION\.toString\(\);\s*\/\/\s*")[^"]*"/,
  `$1${pkg.version}"`
);
fs.writeFileSync('src/config/version.ts', src);
console.log('✅  Fixed: src/config/version.ts');
EOF
```

**Fix all other files** — use `sed` to replace the old version string:

```bash
# Replace OLD_VERSION with PKG_VERSION in each mismatch file
for FILE in src/index.ts src/utils/debounce.ts src/utils/throttle.ts \
            README.md docs/API.md docs/INDEX.md \
            .workflow-config.yaml ROADMAP.md; do
  if grep -qF "${OLD_VERSION}" "${FILE}" 2>/dev/null; then
    sed -i "s|${OLD_VERSION}|${PKG_VERSION}|g" "${FILE}"
    echo "✅  Fixed: ${FILE}"
  fi
done
```

For `ROADMAP.md`, scope the replacement to the header line only:

```bash
sed -i "/^\*\*Current version:\*\*/s|${OLD_VERSION}|${PKG_VERSION}|" ROADMAP.md
# or the bold-in-blockquote variant:
sed -i "/> \*\*Current version:\*\*/s|${OLD_VERSION}|${PKG_VERSION}|" ROADMAP.md
```

### Step 5 — Validate and test

```bash
npm run validate   # tsc --noEmit — catches type errors in version.ts
npm test           # catches test/config/version.test.ts regressions
```

If either fails, report the failure and stop. Do **not** commit a broken
state.

### Step 6 — Commit

Stage only the files that were changed:

```bash
git add src/config/version.ts src/index.ts \
        src/utils/debounce.ts src/utils/throttle.ts \
        README.md docs/API.md docs/INDEX.md \
        .workflow-config.yaml ROADMAP.md

git commit -m "chore(version): sync all version strings to ${PKG_VERSION}

Propagates the version bump from package.json to:
- src/config/version.ts (VERSION object fields + @example)
- src/index.ts (@version JSDoc)
- src/utils/debounce.ts, throttle.ts (@since JSDoc)
- README.md (version badge, CDN URLs)
- docs/API.md (version badge, example output)
- docs/INDEX.md (CDN production URL)
- .workflow-config.yaml (version field)
- ROADMAP.md (current version header)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Output format

Print a structured summary after execution:

```
sync-version — ibira.js
════════════════════════════════════════════
Canonical version: 0.4.20-alpha
─────────────────────────────────────────────
File                         Status
src/config/version.ts        ✓ OK  (or ✗ FIXED)
src/index.ts                 ✓ OK
src/utils/debounce.ts        ✓ OK
src/utils/throttle.ts        ✓ OK
README.md                    ✗ FIXED
docs/API.md                  ✓ OK
docs/INDEX.md                ✓ OK
.workflow-config.yaml        ✓ OK
ROADMAP.md                   ✓ OK
─────────────────────────────────────────────
Result: 1 fixed  |  8 already correct
✅  Validation passed (tsc + npm test)
✅  Committed: chore(version): sync all version strings to 0.4.20-alpha
════════════════════════════════════════════
```

If no mismatches are found, print:

```
✅  sync-version: all version strings already agree with package.json (0.4.20-alpha)
    No files were modified.
```

---

## Workflow trigger (automated)

The companion workflow `.github/workflows/sync-version.yml` runs this same
algorithm automatically whenever `package.json` is pushed to `main` with a
changed `version` field, and is also available via `workflow_dispatch`.

```bash
# Manual trigger
gh workflow run sync-version.yml

# Manual trigger with explicit version override (e.g. after a bump)
gh workflow run sync-version.yml --field version=0.5.0-alpha
```

---

## Related files

- `package.json` — canonical version source
- `src/config/version.ts` — runtime VERSION object
- `.github/workflows/sync-version.yml` — companion GitHub Actions workflow
- `.github/SKILLS.md` — skills index for this project
