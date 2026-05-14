# `.github/` — GitHub Automation & Project Conventions

This directory contains GitHub-specific configuration, automation workflows,
and project-wide conventions for `olinda_copilot_sdk.ts`.

---

## `workflows/`

GitHub Actions CI/CD pipelines.

### `ci.yml`

The primary continuous integration workflow. Runs on Node.js 18, 20, and 22 in
parallel to validate the full project lifecycle:

| Step | Command | Description |
|------|---------|-------------|
| Security audit | `npm audit --audit-level=high` | Fail on high-severity vulnerabilities |
| Type-check | `npm run validate` | `tsc --noEmit` — no emit, just types |
| Build CJS | `npm run build` | Compile to `dist/` (CommonJS) |
| Build ESM | `npm run build:esm` | Compile to `dist/esm/` (ES Modules) |
| Pack dry-run | `npm pack --dry-run` | Verify publishable package shape (Node 22 only) |
| Lint | `npm run lint` | ESLint with `@typescript-eslint` rules |
| Test + coverage | `npm run test:coverage` | Jest with 80% coverage thresholds |
| Integration | `npm run test:integration` | CJS build smoke tests |
| Upload coverage | `actions/upload-artifact@v4` | Coverage report artifact (Node 22 only, 14-day retention) |

### `release.yml`

Release workflow triggered on `v*` tags. Runs on Node.js 22, performs the full
validate → build → lint → test → integration pipeline, then publishes to npm
with provenance (`npm publish --provenance --access public`). Requires
`NPM_TOKEN` secret.

### `test-docker.yml`

Runs on every push and pull request to `main` in parallel with `ci.yml`.
Builds the test image from `Dockerfile.test` using Docker Buildx (with GitHub
Actions layer caching), executes the full Jest suite inside an isolated
`node:20-alpine` container, and uploads the coverage report as an artifact
(14-day retention, uploaded even on failure).

### `update-olinda-utils.yml`

Automated dependency-update workflow for `olinda_utils.js`. Triggers weekly
(Monday 09:00 UTC) or via `workflow_dispatch` with an optional version pin.
Resolves the latest tag, updates `package.json`, installs dependencies,
type-checks, runs tests, adjusts version strings in `src/`, `test/`, and
`docs/`, and opens a pull request with label `dependencies`.

---

## Other files and directories

| File / Directory | Purpose |
|------------------|---------|
| `copilot-instructions.md` | Coding guidelines injected into GitHub Copilot sessions for this repo |
| `dependabot.yml` | Automated dependency update configuration |
| `REFERENTIAL_TRANSPARENCY.md` | Copilot-facing pointer to the authoritative referential transparency guide in `docs/` |
| `CODE_QUALITY_CONTROL.md` | Code-quality principles and review checklist for Copilot sessions |
| `HIGH_COHESION_GUIDE.md` | High-cohesion design guidance for Copilot sessions |
| `LOW_COUPLING_GUIDE.md` | Low-coupling design guidance for Copilot sessions |
| `lightweight_DDD_GUIDE.md` | Lightweight domain-driven design patterns for Copilot sessions |
| `SKILLS.md` | Index of all `.github/skills/` entries with purpose summaries |
| `extensions/` | GitHub Copilot CLI extensions (e.g. `define-team`) |
| `skills/` | Reusable Copilot skill instruction sets for recurring engineering tasks |

---

## Related documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) — contribution guidelines and commit conventions
- [docs/API.md](../docs/API.md) — full public API reference
- [ROADMAP.md](../ROADMAP.md) — feature roadmap and current state
