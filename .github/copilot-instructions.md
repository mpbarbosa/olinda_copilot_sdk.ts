# Copilot Instructions

## Project

`olinda_copilot_sdk.ts` is a TypeScript wrapper library for the GitHub Copilot SDK,
with additional Claude surfaces for the Anthropic Messages API and Claude Agent SDK.
It provides typed abstractions for chat completions, SDK session wrappers, SSE stream
parsing, and message construction utilities.

This project follows the same conventions as [`olinda_utils.js`](https://github.com/mpbarbosa/olinda_utils.js) — use it as the canonical reference.
Key conventions adopted from that project:

- 1-tab indent, single quotes, trailing commas in multi-line lists
- JSDoc required on all exported symbols (`@param`, `@returns`, `@since`, `@example`)
- Pure utility functions — deterministic output, no side effects, no logging
- Custom errors: extend the correct base class, call `Object.setPrototypeOf`, set `this.name`
- Jest + ts-jest for tests, 80% coverage thresholds enforced in CI
- `@typescript-eslint` rules with cyclomatic complexity ≤ 10

## Stack

- **Language**: TypeScript (`src/**/*.ts`) — never submit plain `.js` under `src/`
- **Runtime / engines**: Node.js ≥ 18, npm ≥ 9
- **HTTP**: native `fetch` only — no external HTTP library
- **Build**: `tsc` → `dist/` (CJS + types via `tsconfig.json`); ESM via `tsconfig.esm.json` → `dist/esm/`
- **Tests**: Jest + ts-jest (`test/`)
- **Lint**: ESLint with `@typescript-eslint`, markdownlint for docs, Prettier for formatting

## Architecture

```text
src/
  core/                    # Copilot clients, auth, hooks, MCP, tools, skills, shared errors/types
  lib/                     # Higher-level helpers composed from core + utils
  utils/                   # Pure utility functions
  claude/                  # Claude API client, Claude Agent SDK wrapper, Claude error/types
  index.ts                 # Public entry point — barrel re-exports only
test/
  core/                    # Unit tests for src/core/
  utils/                   # Unit tests for src/utils/
  integration/             # Compiled artifact smoke tests
  lib/                     # Tests for higher-level helpers
  claude/                  # Claude client/wrapper tests
  helpers/                 # Shared fixtures and typed constants
  __stubs__/               # Jest stubs for external SDKs
  index.test.ts            # Smoke tests for the public export surface
docs/                      # Hand-authored API and architecture reference
dist/                      # Tracked compiled CJS output and generated types
dist/esm/                  # Tracked compiled ESM output
```

## Commands

```bash
npm run build         # tsc (CJS + types) → dist/
npm run build:esm     # tsc (ESM) → dist/esm/
npm run prepare       # build both outputs
npm test              # Jest: core + utils + lib + integration + claude
npm run test:core     # Core + public API tests
npm run test:utils    # Utils tests only
npm run test:integration
npm run test:claude
npm run test:docker
npm run test:watch
npm run test:coverage
npm run bench         # benchmark suite
npm run validate      # tsc --noEmit
npm run lint          # ESLint on src/**/*.ts
npm run lint:fix
npm run lint:md
npm run lint:md:fix
npm run format        # Prettier on src/**/*.ts
```

## Code Conventions

- **Pure functions**: same inputs → same output, no side effects, no logging, no global state
- **Style**: 1-tab indent, single quotes, trailing commas in multi-line lists
- **JSDoc required** on all exported symbols (`@param`, `@returns`, `@since`, `@example`)
- **Type imports**: use `import type` for type-only imports
- **No floating promises**: always `await` or explicitly `void`
- **Native fetch**: use Node.js 18+ built-in `fetch` — do not add axios or node-fetch
- **Logger**: re-export from `src/core/logger.ts`; do not introduce direct logging dependencies

## Error Handling

- GitHub Copilot runtime errors extend `CopilotSDKError`
- Claude runtime errors extend `ClaudeSDKError`
- Every error subclass must call `Object.setPrototypeOf(this, new.target.prototype)`
- Every error subclass must set `this.name` to the class name
- Error-path tests should assert `instanceof`, message shape, and prototype chain

## Build and Distribution Notes

- `dist/` is intentionally tracked in Git
- Consumers install via `npm install github:mpbarbosa/olinda_copilot_sdk.ts`
- The `prepare` script builds both CJS and ESM outputs, but tracked build artifacts still matter for GitHub installs and release flows

## Commit Messages

```text
feat: add streaming completions support
fix: handle null response body in stream()
docs: update API reference for ClaudeSdkWrapper
test: add edge cases for parseSSEChunk
```

Prefixes: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
