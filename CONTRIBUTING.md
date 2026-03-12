# Contributing to olinda_copilot_sdk.ts

Thank you for your interest in contributing! This guide covers everything you need to get started.

## Development Setup

**Prerequisites:** Node.js ≥ 18, npm ≥ 9, Git.

```bash
git clone https://github.com/mpbarbosa/olinda_copilot_sdk.ts.git
cd olinda_copilot_sdk.ts
npm install
npm run build        # compile TypeScript → dist/ (CJS)
npm run build:esm    # compile TypeScript → dist/esm/ (ESM)
npm test             # run unit + integration test suite
```

## Making Changes

1. Create a branch: `git checkout -b feat/my-feature`
2. Make your changes in `src/` (TypeScript only — never commit plain `.js` under `src/`)
3. Add tests in the corresponding `test/` subdirectory
4. Run the full test suite: `npm test`
5. Run the integration tests: `npm run test:integration` (requires `npm run build` first)
6. Run the linter: `npm run lint`
7. Run the type-checker: `npm run validate`
8. Commit and open a pull request

## Code Style

> The authoritative coding conventions for this project (indentation, quote style, JSDoc rules,
> error-handling patterns, complexity limits, etc.) are maintained in
> [`.github/copilot-instructions.md`](.github/copilot-instructions.md). The summary below
> captures the most important points; refer to that file for the full specification.

- **Language:** TypeScript — all source files live under `src/`
- **Indentation:** 1 tab
- **Quotes:** single quotes
- **JSDoc:** required on all exported symbols (`@param`, `@returns`, `@since`, `@example`)
- **Pure functions preferred:** same inputs → same output, no observable side effects
- **Cyclomatic complexity:** ≤ 10 (ESLint enforced)
- **HTTP:** use native `fetch` (Node.js ≥ 18) — do not add `axios` or `node-fetch`

Formatting is enforced via ESLint:

```bash
npm run lint        # check
npm run lint:fix    # auto-fix
```

## Testing Requirements

- Test framework: **Jest + ts-jest** (TypeScript compiled natively — no pre-build needed)
- Tests live in `test/` mirroring the `src/` structure:
  - `test/utils/` — unit tests for `src/utils/` domain modules
  - `test/core/` — unit tests for `src/core/` classes
  - `test/integration/` — CJS smoke tests against compiled `dist/`
  - `test/benchmarks/` — performance benchmarks (excluded from coverage)
  - `test/helpers/` — shared fixtures and typed constants
- **Coverage thresholds** (enforced by CI):
  - Statements: ≥ 80%
  - Functions: ≥ 80%
  - Lines: ≥ 80%
  - Branches: ≥ 75%
- All new exported symbols must have corresponding tests
- Run the full suite before opening a PR:

```bash
npm test                  # unit + integration suite + coverage
npm run test:verbose      # with per-test output
npm run test:integration  # CJS build smoke tests (requires npm run build)
npm run bench             # performance benchmarks (not included in coverage)
npm run validate          # type-check only (no emit)
```

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>: <short summary>
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`

Examples:

```text
feat: add streaming completions support
fix: handle null response body in stream()
docs: update API reference for CopilotClient
test: add negative test cases for parseSSEChunk
```

## Pull Request Checklist

- [ ] Tests pass (`npm test`)
- [ ] Integration tests pass (`npm run test:integration` — requires build)
- [ ] Linter passes (`npm run lint`)
- [ ] Type-check passes (`npm run validate`)
- [ ] Coverage thresholds met (no regression)
- [ ] JSDoc added for all new exports
- [ ] `CHANGELOG.md` updated under `[Unreleased]`

## Release & Distribution

This package is installed directly from GitHub (e.g.
`npm install github:mpbarbosa/olinda_copilot_sdk.ts#v0.2.1`).  When a consumer
uses a tarball URL, npm **does not** run lifecycle scripts (`prepare`, `build`),
so the compiled `dist/` output must be committed and present in the repository.

> `dist/` is intentionally **not** gitignored in this project.

**Before cutting a release tag:**

```bash
npm run build        # CJS → dist/src/ + dist/types/
npm run build:esm    # ESM → dist/esm/
npm test             # ensure all tests (including dist_artifacts) pass
git add dist/
git commit -m "chore: build dist for v<VERSION>"
git tag v<VERSION>
git push && git push --tags
```

The `test/integration/dist_artifacts.test.ts` suite verifies that all required
entry points (`dist/src/index.js`, `dist/esm/index.js`, `dist/types/src/index.d.ts`)
are present.  CI will fail if a tag is pushed without a prior build.

---

## Reporting Issues

Open an issue at <https://github.com/mpbarbosa/olinda_copilot_sdk.ts/issues> with:

- Node.js version (`node --version`)
- Steps to reproduce
- Expected vs actual behaviour
