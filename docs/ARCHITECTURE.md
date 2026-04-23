# Architecture — olinda_copilot_sdk.ts

This document describes the internal structure of the library, the responsibility of each module, and the design decisions behind the main abstractions.

---

## Overview

`olinda_copilot_sdk.ts` is a thin, typed execution layer over the GitHub Copilot SDK. It exposes two complementary client surfaces:

- **`CopilotClient`** — stateless HTTP client for the chat completions REST API (no CLI process required)
- **`CopilotSdkWrapper`** — stateful wrapper around the `@github/copilot-sdk` CLI session lifecycle

Both clients are pure, side-effect-free in construction and deterministic in behavior. All errors are typed subclasses of `CopilotSDKError`.

---

## Directory Layout

```text
src/
  core/                   # Clients, domain types, errors, auth, extensions
  lib/                    # Higher-level helpers composed from core + utils
  utils/                  # Pure stateless utility functions
  claude/                 # Claude API client and Claude Agent SDK wrapper
  index.ts                # Public barrel — re-exports only
test/
  core/                   # Unit tests for src/core/
  utils/                  # Unit tests for src/utils/
  integration/            # CJS build smoke tests
  lib/                    # Tests for src/lib/
  helpers/                # Shared fixtures and typed constants
  __stubs__/              # Minimal CJS stub for @github/copilot-sdk
  index.test.ts           # Public export surface smoke tests
docs/                     # Hand-authored reference documentation
.claude/                  # Local Claude Code permission/config metadata
.github/skills/           # Reusable Copilot skill definitions for repo workflows
.github/extensions/       # Project-specific Copilot CLI extensions
dist/                     # Compiled CJS output (gitignored in source, committed for consumers)
dist/esm/                 # Compiled ESM output
```

---

## `src/core/`

### `completions_client.ts` — `CopilotClient`

Stateless HTTP client for the Copilot chat completions API.

- Uses native `fetch` (Node.js ≥ 18) — no external HTTP dependency
- `complete()` — non-streaming; returns a `CompletionResponse`
- `stream()` — streaming; yields raw `StreamChunk` objects via async generator
- `streamText()` — convenience generator that yields plain text delta strings
- Throws `AuthenticationError` for empty token; `APIError` for non-2xx responses; `SystemError` for network failures

### `session_client.ts` — `CopilotSdkWrapper`

Stateful wrapper for the `@github/copilot-sdk` CLI session process.

- Manages session lifecycle: `startSession`, `resumeSession`, `endSession`
- Provides model introspection: `getModels`, `ping`, `getStatus`, `getState`
- Session listing and deletion: `listSessions`, `deleteSession`
- Emits session lifecycle events via `onSessionLifecycle`
- All async methods return typed results; never throw — errors are returned as rejected promises with typed `CopilotSDKError` subclasses

### `session_types.ts`

Type-only re-export barrel for session management and model introspection types from `@github/copilot-sdk`.

- Only contains `export type { ... }` declarations — no runtime representation
- Exists so consumers import types from the olinda entry point rather than `@github/copilot-sdk` directly

### `session_config.ts`

Typed configuration helpers for `CopilotSdkWrapper`. Provides defaults and validation for `SessionConfig` construction.

### `types.ts`

Core TypeScript interfaces shared across the library:

- `Message`, `SystemMessage`, `UserMessage`, `AssistantMessage`
- `CompletionRequest`, `CompletionResponse`, `StreamChunk`
- `ClientOptions`

### `errors.ts` — Error Hierarchy

```text
CopilotSDKError (base)
  ├── AuthenticationError   — empty/invalid token
  ├── APIError              — non-2xx HTTP response
  └── SystemError           — network failure, unexpected runtime error
```

Every subclass:

- Calls `Object.setPrototypeOf(this, new.target.prototype)` to preserve `instanceof` across transpilation boundaries
- Sets `this.name` to the class name
- Is exported from `src/index.ts` for consumer use

### `auth.ts`

Token introspection and validation utilities. Provides helpers to check Copilot token scope and expiry without making a full completion request.

### `hooks.ts`

Permission bridge for `@github/copilot-sdk`'s hook mechanism. Provides typed wrappers around `approveAll`, `defineTool`, and custom approval callbacks.

### `mcp.ts`

Typed helpers for the Model Context Protocol (MCP) tool surface exposed by the SDK.

### `skills.ts`

Typed helpers for Copilot skill registration and invocation.

### `tools.ts`

Utilities for defining and registering tool schemas used in agentic sessions.

### `logger.ts`

Re-exports `Logger`, `logger`, `LogLevel`, and `stripAnsi` from `olinda_utils.js`. The library itself does not log; this re-export allows consumers to configure logging at the application layer.

---

## `src/utils/`

### `messages.ts`

Pure factory functions for constructing `Message` objects:

- `createUserMessage(content)` — `{ role: 'user', content }`
- `createSystemMessage(content)` — `{ role: 'system', content }`
- `createAssistantMessage(content)` — `{ role: 'assistant', content }`

No side effects. Always return a new object. Never throw.

### `stream.ts`

Pure SSE parsing utilities:

- `parseSSEChunk(raw)` — parses a raw SSE `data:` line into a `StreamChunk` or `null` for `[DONE]`
- `parseSSEStream(body)` — async generator that wraps a `ReadableStream<Uint8Array>` and yields `StreamChunk` objects

---

## `src/lib/`

Higher-level helpers that combine the lower-level `src/core/` and `src/utils/`
building blocks into focused workflows.

### `log_validator.ts`

Token-efficient log review helper that:

- reads AI workflow logs from disk
- extracts concrete actionable issues
- samples relevant repository files
- builds a compact prompt for `CopilotSdkWrapper`

### `sdk_smoke_test.ts`

Minimal connectivity probe for the GitHub Copilot SDK wrapper.

- sends a small prompt through `CopilotSdkWrapper`
- validates the response shape
- returns a structured pass/fail result

---

## `src/claude/`

Claude-specific client and wrapper surface, exported alongside the GitHub
Copilot integrations from the public barrel.

### `completions_client.ts`

Stateless client for Anthropic's Messages API.

### `sdk_wrapper.ts`

Stateful wrapper around the Claude Agent SDK lifecycle.

### `types.ts`, `sdk_types.ts`, `errors.ts`

Shared request/response types, SDK-facing type exports, and the Claude-specific
error hierarchy.

---

## `src/index.ts` — Public Entry Point

Barrel re-export only. Everything exported here is part of the public API.

Consumers import from `'olinda_copilot_sdk.ts'`; they never reach into internal paths.

---

## Repository Automation Metadata

### `.github/skills/`

Repository-specific Copilot skill definitions used to automate recurring
engineering workflows. The catalog lives in `.github/SKILLS.md`.

### `.github/extensions/`

Project-specific Copilot CLI extensions that add repository-aware tooling beyond
the built-in command set.

### `.claude/`

Local Claude Code configuration for this checkout. The directory is documented
in `.claude/README.md` so contributors can distinguish it from runtime code.

---

## Build Outputs

| Target | Command | Output |
|---|---|---|
| CJS (Node default) | `npm run build` | `dist/` |
| ESM | `npm run build:esm` | `dist/esm/` |
| Type declarations | produced by both | `dist/types/` |

The `prepare` lifecycle script (`npm run build && npm run build:esm`) ensures a fresh build is available when the package is installed via `npm install github:mpbarbosa/olinda_copilot_sdk.ts`.

---

## Design Constraints

- **No side effects in constructors** — clients accept config, do not connect eagerly
- **Native fetch only** — no axios, node-fetch, or other HTTP libraries
- **Pure utilities** — `src/utils/` functions are deterministic and have no external dependencies
- **Typed errors only** — `throw` always produces a `CopilotSDKError` subclass
- **No global state** — multiple `CopilotClient` or `CopilotSdkWrapper` instances are independent
