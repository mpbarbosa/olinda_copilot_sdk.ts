---
name: update-bessa
description: >
  Update the bessa_patterns.ts dependency in ibira.js to the latest (or a
  specified) release. Use this skill when asked to bump, upgrade, or refresh
  bessa_patterns.ts, or when the update-bessa GitHub Actions workflow needs to
  be triggered, debugged, or explained.
---

## Overview

`bessa_patterns.ts` is consumed by ibira.js via a GitHub shorthand reference
stored in `package.json` (`"bessa_patterns.ts": "github:mpbarbosa/bessa_patterns.ts#<TAG>"`).
A dedicated GitHub Actions workflow handles the update process end-to-end.

## Workflow location

```text
.github/workflows/update-bessa.yml
```

## What the workflow does

1. **Resolve version** — queries the GitHub API for the latest
   bessa_patterns.ts release tag (or uses the `version` input if provided via
   `workflow_dispatch`).
2. **Early-exit guard** — compares the resolved tag against the `#TAG` fragment
   already in `package.json`; skips the rest if already up to date.
3. **Update `package.json`** — replaces the old `#TAG` fragment with the new
   one in the `bessa_patterns.ts` dependency entry.
4. **Install dependencies** — runs `npm ci` to reinstall from the updated
   `package.json`, regenerating the lock entry for `bessa_patterns.ts`.
5. **Validate TypeScript** — runs `npm run validate` (`tsc --noEmit`) to catch
   type errors introduced by the new version.
6. **Run tests** — runs the full Jest suite to confirm nothing regressed.
7. **Adjust related code** — `sed`-replaces old version strings in `src/`.
8. **Update documentation** — replaces old version tags in all `*.md` files
   (single-pass, guarded by pre-check grep).
9. **Adjust related tests** — replaces old version strings in `test/` and
   `__tests__/`, then re-runs only the affected test files.
10. **Open pull request** — uses `peter-evans/create-pull-request@v7` to open
    (or update) a PR on branch `chore/update-bessa-patterns-<version>`.

## How to trigger manually

```bash
gh workflow run update-bessa.yml --field version=v0.13.0-alpha
```

Leave `version` blank to use the latest published release.

## Idempotency guarantees

- A `concurrency` group (`update-bessa-patterns`) prevents simultaneous runs
  from racing on the same PR branch.
- The early-exit guard in step 2 ensures no changes are committed if the
  dependency is already at the target version.
- `peter-evans/create-pull-request` updates an existing PR rather than opening
  a duplicate.

## Dependency format

`bessa_patterns.ts` is referenced in `package.json` using the GitHub shorthand:

```json
"bessa_patterns.ts": "github:mpbarbosa/bessa_patterns.ts#v0.12.15-alpha"
```

The workflow updates only the `#TAG` fragment — the prefix
`github:mpbarbosa/bessa_patterns.ts` is never modified.

## Related files

- `.github/workflows/update-bessa.yml` — the full workflow definition
- `.github/SKILLS.md` — skills and workflows index for this project
- `docs/API.md` — ibira.js API reference
