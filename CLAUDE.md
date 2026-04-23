# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build
npm run build          # CJS + types → dist/
npm run build:esm      # ESM → dist/esm/
npm run prepare        # Both builds (also runs on npm install github:...)

# Test
npm test               # All tests with coverage
npm run test:core      # Core + public API tests only
npm run test:utils     # Utils tests only
npm run test:integration  # CJS/ESM artifact smoke tests
npm run test:claude    # Claude client/wrapper tests
npm run test:docker    # Run tests inside Docker container
npm test -- test/core/completions_client.test.ts         # Single file
npm test -- --testNamePattern="should throw"             # By name pattern

# Lint & validate
npm run validate       # Type-check only, no emit
npm run lint           # ESLint on src/**/*.ts
npm run lint:fix       # ESLint auto-fix
npm run lint:md        # Markdownlint on **/*.md
npm run lint:md:fix    # Markdownlint auto-fix
npm run format         # Prettier on src/**/*.ts
```

Coverage thresholds (enforced in CI): 80% lines/functions/statements, 75% branches.

## Architecture

### Two SDK Families, One Package

The package exposes both GitHub Copilot and Claude integration surfaces:

- **`CopilotClient`** (`src/core/completions_client.ts`) — Stateless HTTP client. Uses native `fetch` directly against the Copilot chat completions REST API. No global state, no session lifecycle. Methods: `complete()`, `stream()`, `streamText()`.

- **`CopilotSdkWrapper`** (`src/core/session_client.ts`) — Stateful wrapper around `@github/copilot-sdk`, which runs a CLI process. Manages session lifecycle, serializes concurrent `send()` calls, and exposes hooks, tools, MCP, and skill-loading helpers.

- **`ClaudeClient`** (`src/claude/completions_client.ts`) — Stateless client for Anthropic's Messages API.

- **`ClaudeSdkWrapper`** (`src/claude/sdk_wrapper.ts`) — Stateful wrapper around the Claude Agent SDK lifecycle.

### Barrel Export Pattern

`src/index.ts` is a pure re-export barrel — nothing is defined there. Every symbol is version-tagged in JSDoc (`@since v0.x.x`). When adding exports, add them to `src/index.ts` in version order.

### Pure Utils vs Stateful Core

`src/utils/` contains only pure functions with no side effects, no logging, and deterministic output. `src/core/` and `src/claude/` provide stateful clients, transport wrappers, and typed integration helpers. `src/lib/` contains higher-level modules that compose `core` + `utils` into focused workflows such as log validation and smoke tests.

### Error Hierarchies

- Copilot-facing runtime errors extend `CopilotSDKError` (`src/core/errors.ts`)
- Claude-facing runtime errors extend `ClaudeSDKError` (`src/claude/errors.ts`)

Every subclass must call `Object.setPrototypeOf(this, new.target.prototype)` and set `this.name` for correct `instanceof` behavior after TypeScript transpilation.

### `dist/` Is Committed

`dist/` is intentionally tracked in Git. Consumers install via `npm install github:mpbarbosa/olinda_copilot_sdk.ts`, and release/deployment flows depend on committed compiled output being present alongside the source tree.

### Testing

- Tests use Jest + ts-jest (no pre-build needed — TypeScript compiles on-the-fly in tests).
- `@github/copilot-sdk` is stubbed at `test/__stubs__/copilot-sdk.cjs`; Jest maps imports to this stub where needed.
- Integration tests in `test/integration/` verify the compiled `dist/` artifacts exist and load correctly — they require a prior `npm run build && npm run build:esm`.
- Claude-specific tests live under `test/claude/`.
- Shared fixtures are in `test/helpers/fixtures.ts`.

## Conventions

- **Formatting:** 1-tab indent, single quotes, trailing commas in multi-line lists, 100-char printWidth (enforced by Prettier).
- **JSDoc required** on all exported symbols: `@param`, `@returns`, `@since`, `@example`.
- **Type imports:** Use `import type` for type-only imports (`consistent-type-imports` is an ESLint error).
- **HTTP:** Native `fetch` only — no axios, node-fetch, or other HTTP libraries.
- **No floating promises:** `no-floating-promises` is an ESLint error; always `await` or explicitly `void`.
- **Cyclomatic complexity ≤ 10** per function (ESLint warns above this).
- **Commit messages:** Conventional Commits — `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.
- **Logger:** Re-export from `olinda_utils.js` via `src/core/logger.ts` — do not import logging libraries directly.
