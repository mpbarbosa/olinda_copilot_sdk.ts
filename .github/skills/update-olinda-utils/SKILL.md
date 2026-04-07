---
name: update-olinda-utils
description: >
  Update the olinda_utils.js dependency in olinda_copilot_sdk.ts to the latest
  (or a specified) release. Use this skill when asked to bump, upgrade, or
  refresh olinda_utils.js, or when the update-olinda-utils GitHub Actions
  workflow needs to be triggered, debugged, or explained.
---

## Overview

`olinda_utils.js` is consumed by this project via its GitHub tarball CDN URL
stored in `package.json`. A dedicated GitHub Actions workflow handles the
update process end-to-end.

## Workflow location

```text
.github/workflows/update-olinda-utils.yml
```

## What the workflow does

1. **Resolve version** — queries the GitHub API for the latest
   olinda_utils.js release tag (or uses the `version` input if provided via
   `workflow_dispatch`).
2. **Early-exit guard** — compares the resolved tarball URL against the one
   already in `package.json`; skips the rest if already up to date.
3. **Update `package.json`** — replaces the old tarball URL with the new one.
4. **Install dependencies** — runs a targeted
   `npm install "olinda_utils.js@<tarball_url>"` to keep the lockfile
   deterministic.
5. **Validate TypeScript** — runs `npm run validate` (`tsc --noEmit`) to catch
   type errors introduced by the new version.
6. **Run tests** — runs the full Jest suite to confirm nothing regressed.
7. **Adjust related code** — `sed`-replaces old version strings in `src/`.
8. **Update documentation** — replaces old tarball URLs and version strings in
   all `*.md` files.
9. **Adjust related tests** — replaces old version strings in `test/`, then
   re-runs only the affected test files.
10. **Open pull request** — uses `peter-evans/create-pull-request@v8` to open
    (or update) a PR on branch `chore/update-olinda-utils-<version>`.

## How to trigger manually

```shell
gh workflow run update-olinda-utils.yml --field version=v0.4.0
```

Leave `version` blank to use the latest published release.

## Idempotency guarantees

- A `concurrency` group (`update-olinda-utils`) prevents simultaneous runs
  from racing on the same PR branch.
- The early-exit guard in step 2 ensures no changes are committed if the
  dependency is already at the target version.
- `peter-evans/create-pull-request` updates an existing PR rather than opening
  a duplicate.

## Tarball URL pattern

```text
https://github.com/mpbarbosa/olinda_utils.js/archive/refs/tags/<TAG>.tar.gz
```

## Related files

- `.github/workflows/update-olinda-utils.yml` — the full workflow definition
- `package.json` — contains the `olinda_utils.js` tarball CDN URL
