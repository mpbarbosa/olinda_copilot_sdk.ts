# `.github/` — GitHub Automation & Project Conventions

This directory contains GitHub-specific configuration, automation workflows,
and project-wide conventions for `olinda_copilot_sdk.ts`.

---

## `workflows/`

GitHub Actions CI/CD pipelines that run on every push or pull request to `main`.

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

---

## Other files

| File | Purpose |
|------|---------|
| `copilot-instructions.md` | Coding guidelines injected into GitHub Copilot sessions for this repo |
| `dependabot.yml` | Automated dependency update configuration |
| `REFERENTIAL_TRANSPARENCY.md` | Architectural conventions for pure functions and immutability |

---

## Related documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) — contribution guidelines and commit conventions
- [docs/API.md](../docs/API.md) — full public API reference
- [docs/ROADMAP.md](../docs/ROADMAP.md) — feature roadmap and current state
