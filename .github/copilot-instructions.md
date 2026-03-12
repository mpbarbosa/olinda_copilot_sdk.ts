# Copilot Instructions

## Project

`olinda_copilot_sdk.ts` is a TypeScript wrapper library for the GitHub Copilot SDK,
providing typed abstractions for the Copilot chat completions API, SSE stream parsing,
and message construction utilities.

This project follows the same conventions as [`olinda_utils.js`](https://github.com/mpbarbosa/olinda_utils.js) — use it as the canonical reference.
Key conventions adopted from that project:

- 1-tab indent, single quotes, trailing commas in multi-line lists
- JSDoc required on all exported symbols (`@param`, `@returns`, `@since`, `@example`)
- Pure utility functions — never throw, no side effects, deterministic output
- Custom errors: extend a base class, call `Object.setPrototypeOf`, set `this.name`
- Jest + ts-jest for tests, 80% coverage thresholds enforced in CI
- `@typescript-eslint` rules with cyclomatic complexity ≤ 10

## Stack

- **Language**: TypeScript (`src/**/*.ts`) — never submit plain `.js` under `src/`
- **Runtime / engines**: Node.js ≥ 18, npm ≥ 9 (enforce with `engine-strict=true` in `.npmrc`)
- **HTTP**: native `fetch` (Node.js ≥ 18) — no external HTTP library
- **Build**: `tsc` → `dist/` (CJS via `tsconfig.json`); ESM via `tsconfig.esm.json` → `dist/esm/`
- **Tests**: Jest + ts-jest (`test/`)
- **Lint**: ESLint with `@typescript-eslint`, markdownlint for docs

## Architecture

```
src/
  core/                    # Core classes, types, and custom errors
    completions_client.ts  # CopilotClient — REST HTTP completions API (stateless)
    session_client.ts      # CopilotSdkWrapper — @github/copilot-sdk CLI sessions (stateful)
    types.ts               # TypeScript interfaces (Message, CompletionResponse, etc.)
    errors.ts              # Custom error hierarchy (CopilotSDKError, AuthenticationError, APIError, SystemError)
    logger.ts              # Re-exports Logger, logger, LogLevel, stripAnsi from olinda_utils.js
  utils/                   # Pure utility functions
    messages.ts            # Message factory functions (createUserMessage, etc.)
    stream.ts              # SSE stream parsing utilities
  index.ts                 # Public entry point — barrel re-exports only
test/
  core/                    # Unit tests for src/core/
  utils/                   # Unit tests for src/utils/
  integration/             # Integration tests (CJS build smoke tests)
  benchmarks/              # Performance benchmarks (excluded from coverage run)
  helpers/                 # Shared test fixtures and typed constants
  index.test.ts            # Smoke tests for the public export surface
docs/                      # Hand-authored API reference and roadmap
dist/                      # Compiled output (gitignored)
```

## Commands

```bash
npm run build         # tsc (CJS) → dist/
npm run build:esm     # tsc (ESM) → dist/esm/
npm test              # Jest: unit + integration + utils
npm run test:core     # Jest: src/core/ tests only
npm run test:utils    # Jest: src/utils/ tests only
npm run test:integration
npm run test:watch    # watch mode
npm run test:coverage # with coverage report (80% threshold enforced)
npm run bench         # performance benchmarks
npm run validate      # tsc --noEmit (type-check only)
npm run lint          # ESLint on src/**/*.ts
npm run lint:fix
npm run lint:md       # markdownlint on **/*.md
```

## Code Conventions

- **Pure functions**: same inputs → same output, no side effects, no logging, no global state
- **Style**: 1-tab indent, single quotes, trailing commas in multi-line lists
- **JSDoc required** on all exported symbols (`@param`, `@returns`, `@since`, `@example`)
- **Complexity gate**: cyclomatic complexity warn above 10
- **Native fetch**: use Node.js 18+ built-in `fetch` — do not add axios or node-fetch

## Error Handling

- Throw a custom `*Error` subclass (extending `CopilotSDKError`) for invalid arguments
- Call `Object.setPrototypeOf(this, new.target.prototype)` in all error constructors
- Set `this.name` to the class name
- Every error path needs a test asserting: correct class (`instanceof`), message pattern, and prototype chain

## Commit Messages

```
feat: add streaming completions support
fix: handle null response body in stream()
docs: update API reference for CopilotClient
test: add edge cases for parseSSEChunk
```

Prefixes: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
