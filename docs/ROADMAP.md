# Roadmap — olinda_copilot_sdk.ts

TypeScript wrapper library for the GitHub Copilot SDK.
Grounded in the [official `@github/copilot-sdk` documentation](https://github.com/github/copilot-sdk/tree/main/docs).

---

## Current State (v0.1.3)

| Module | File | Status |
|---|---|---|
| REST completions client | `src/core/completions_client.ts` | ✅ Done |
| Session lifecycle wrapper | `src/core/session_client.ts` | ✅ Done |
| Custom error hierarchy | `src/core/errors.ts` | ✅ Done |
| REST API types | `src/core/types.ts` | ✅ Done |
| Logger (via olinda_utils.js) | `src/core/logger.ts` | ✅ Done |
| Message factory utilities | `src/utils/messages.ts` | ✅ Done |
| SSE stream parsing utilities | `src/utils/stream.ts` | ✅ Done |
| Auth strategy types & utilities | `src/core/auth.ts` | ✅ Done |
| Session config types | `src/core/session_config.ts` | ✅ Done |
| MCP server types & factories | `src/core/mcp.ts` | ✅ Done |
| Skills types & utilities | `src/core/skills.ts` | ✅ Done |

---

## Phase 1 — Authentication & Session Foundations ✅ Complete

> Ref: [auth/index.md](https://github.com/github/copilot-sdk/blob/main/docs/auth/index.md) · [auth/byok.md](https://github.com/github/copilot-sdk/blob/main/docs/auth/byok.md) · [setup/index.md](https://github.com/github/copilot-sdk/blob/main/docs/setup/index.md)

Typed abstractions for all authentication strategies and full session configuration surface.

### 1.1 — Auth strategy types (`src/core/auth.ts`)

- `AuthOptions` interface with all supported methods:
  - `githubToken` — explicit OAuth/PAT token (`gho_`, `ghu_`, `github_pat_` prefixes)
  - `useLoggedInUser` — boolean flag to opt in/out of stored CLI credentials
  - `envToken` — `COPILOT_GITHUB_TOKEN` / `GH_TOKEN` / `GITHUB_TOKEN` fallback chain
- `BYOKProvider` interface for Bring Your Own Key:
  - Azure AI Foundry (`type: 'azure'`, `endpoint`, `apiKey`, `deploymentId`)
  - OpenAI (`type: 'openai'`, `apiKey`, `model`)
  - Anthropic (`type: 'anthropic'`, `apiKey`, `model`)
  - OpenAI-compatible endpoints (`type: 'openai-compatible'`, `url`, `apiKey`)
- `resolveAuthPriority(options)` utility — mirrors the SDK's priority order:
  1. Explicit `githubToken`
  2. HMAC key env vars
  3. Direct API token
  4. Environment variable chain
  5. Stored OAuth credentials
  6. GitHub CLI credentials

### 1.2 — Session config types (`src/core/session_config.ts`)

Typed `SessionConfig` surface matching the SDK's full options:

- `sessionId` — for resumable/persistent sessions
- `model` — model identifier (e.g. `'gpt-4o'`, `'claude-sonnet-4'`)
- `systemMessage` — system prompt override
- `workingDirectory` — forwarded to CLI
- `reasoningEffort` — `'low'` | `'medium'` | `'high'`
- `streaming` — enable real-time event emission
- `provider` — `BYOKProvider` for BYOK sessions

### 1.3 — Tests and docs

- Unit tests for `resolveAuthPriority` covering all six priority steps
- Extend `docs/API.md` with Auth section

---

## Phase 2 — Session Hooks ✅ Complete

> Ref: [hooks/index.md](https://github.com/github/copilot-sdk/blob/main/docs/hooks/index.md) · [hooks/pre-tool-use.md](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md) · [hooks/post-tool-use.md](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md)

Typed hook builder that wraps the raw `@github/copilot-sdk` hook callbacks.

### 2.1 — Hook types (`src/core/hooks.ts`)

| Hook | Trigger | Input type | Output type |
|---|---|---|---|
| `onPreToolUse` | Before a tool executes | `PreToolUseInput` | `PreToolUseOutput` (allow/deny/modify) |
| `onPostToolUse` | After a tool executes | `PostToolUseInput` | `PostToolUseOutput` (transform result) |
| `onUserPromptSubmitted` | User sends a message | `UserPromptInput` | `UserPromptOutput` (modify/filter) |
| `onSessionStart` | Session begins | `SessionStartInput` | `SessionStartOutput` (inject context) |
| `onSessionEnd` | Session ends | `SessionEndInput` | `void` |
| `onErrorOccurred` | Any error | `ErrorInput` | `ErrorOutput` |

- `createHooks(config)` factory — builds a `SessionHooks` object with type-safe callbacks
- `approveAllTools()` convenience — pre-built hook that approves every tool call
- `denyTools(toolNames)` convenience — blocks specific tools by name

### 2.2 — Tests and docs

- Unit tests for each hook type and the factory function
- Add Hook examples to `docs/API.md`

---

## Phase 3 — MCP Servers & Skills ✅ Complete

> Ref: [features/mcp.md](https://github.com/github/copilot-sdk/blob/main/docs/features/mcp.md) · [features/skills.md](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md)

### 3.1 — MCP server types (`src/core/mcp.ts`)

Two server types supported by the SDK:

- `LocalMCPServer` — `type: 'local'|'stdio'`, `command`, `args`, `env?`, `cwd?`, `tools`, `timeout?`
- `RemoteMCPServer` — `type: 'http'|'sse'`, `url`, `headers?`, `tools`, `timeout?`
- `MCPServerMap` — `Record<string, LocalMCPServer | RemoteMCPServer>`
- `createLocalMCPServer(config)` / `createRemoteMCPServer(config)` factory helpers

### 3.2 — Skills support (`src/core/skills.ts`)

- `SkillConfig` interface — `name?`, `description?`, markdown body
- `loadSkillDirectories(paths)` — resolves and validates skill directories
- `SkillSessionConfig` — `skillDirectories: string[]`, `disabledSkills?: string[]`

### 3.3 — Tests and docs

- Unit tests for MCP config validation
- Unit tests for `loadSkillDirectories` path resolution
- Add MCP and Skills examples to `docs/API.md`

---

## Phase 4 — Custom Agents

> Ref: [features/custom-agents.md](https://github.com/github/copilot-sdk/blob/main/docs/features/custom-agents.md)

Custom agents are lightweight scoped sub-agents attached to a session. The Copilot runtime orchestrates them automatically based on the user's request.

### 4.1 — Agent types (`src/core/agents.ts`)

- `CustomAgent` interface:
  - `name` — agent identifier
  - `description` — when to activate this agent
  - `prompt` — system prompt / instructions
  - `tools?` — available tools restriction
  - `mcpServers?` — agent-scoped MCP servers
- `createAgent(config)` factory
- `AgentSessionConfig` — `customAgents: CustomAgent[]`, `agent?: string` (pre-select by name)

### 4.2 — Tests and docs

- Unit tests for `createAgent` factory
- Add Custom Agents section to `docs/API.md`

---

## Phase 5 — Streaming Events

> Ref: [features/streaming-events.md](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md)

When `streaming: true`, the SDK emits 40+ typed events in real time. This phase exposes typed event subscriptions over the session client.

### 5.1 — Streaming event types (`src/core/events.ts`)

- Complete `SessionEvent` discriminated union covering all event categories:
  - Progress/delta events (text tokens, tool input tokens)
  - Tool lifecycle events (`tool.start`, `tool.end`, `tool.error`)
  - Session lifecycle events (`session.start`, `session.idle`, `session.end`)
  - Planning events (`plan.created`, `plan.updated`)
  - Error events
- `StreamEventHandler<T>` typed callback type
- `onEvent(session, eventType, handler)` subscription helper

### 5.2 — `SessionClient` streaming extension

Extend `session_client.ts` with:

- `stream(prompt, options?)` — async generator of typed `SessionEvent` items
- `streamText(prompt, options?)` — convenience generator yielding only text-delta strings

### 5.3 — Tests and docs

- Unit tests for event parsing and handler registration
- Streaming examples in `docs/API.md`

---

## Phase 6 — Session Persistence

> Ref: [features/session-persistence.md](https://github.com/github/copilot-sdk/blob/main/docs/features/session-persistence.md)

Resumable sessions are central to agentic workflows. This phase surfaces the full persistence API with typed abstractions.

### 6.1 — Persistence helpers (`src/utils/session.ts`)

- `createSessionId(userId, taskType)` — generates structured, audit-friendly session IDs
- `SessionInfo` type — `sessionId`, `createdAt`, `model`, `repository?`
- Extend `SessionClient` with:
  - `resumeSession(sessionId, options?)` — resumes an existing session
  - `listSessions(filter?)` — lists all sessions matching an optional filter
  - `deleteSession(sessionId)` — permanently removes session data
- `InfiniteSessionConfig` type — `enabled`, `backgroundCompactionThreshold`, `bufferExhaustionThreshold`

### 6.2 — Tests and docs

- Unit tests for `createSessionId` formatting
- Add Session Persistence section to `docs/API.md`

---

## Phase 7 — Scaling & Production Utilities

> Ref: [setup/scaling.md](https://github.com/github/copilot-sdk/blob/main/docs/setup/scaling.md) · [setup/backend-services.md](https://github.com/github/copilot-sdk/blob/main/docs/setup/backend-services.md)

### 7.1 — Connection pool (`src/utils/pool.ts`)

- `SessionPool` class — manages a bounded map of active `CopilotSession` instances
  - `get(sessionId)` — retrieve or create session
  - `evict(sessionId)` — disconnect and remove from pool
  - `evictOldest()` — evict LRU session when pool is full
  - `maxConcurrent` configurable limit
- `CLIPool` class — one `CopilotClient` per user-ID key, with lifecycle management
  - `getClientForUser(userId, token?)` — create-or-return a dedicated client
  - `releaseUser(userId)` — stop and remove the client

### 7.2 — Session lock helper (`src/utils/lock.ts`)

- `SessionLock` interface — `acquire(sessionId)` / `release(sessionId)`
- `InMemorySessionLock` — for single-process deployments
- Type stubs for Redis-backed lock (implementation left to consumer)

### 7.3 — Tests and docs

- Unit tests for `SessionPool` eviction logic
- Unit tests for `InMemorySessionLock` concurrency
- Add Scaling section to `docs/API.md`

---

## Phase 8 — Observability

> Ref: [observability/opentelemetry.md](https://github.com/github/copilot-sdk/blob/main/docs/observability/opentelemetry.md)

### 8.1 — OpenTelemetry bridge (`src/utils/telemetry.ts`)

Following the OpenTelemetry GenAI Semantic Conventions:

- `TelemetryConfig` interface — `tracer`, `attributes?`
- `instrumentSession(session, config)` — wraps a session and emits spans for each event:
  - `gen_ai.system` = `'copilot'`
  - `gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`
  - Tool spans with `gen_ai.tool.name`, `gen_ai.tool.call.id`
- Kept as optional peer dependency — zero cost if not used

### 8.2 — Tests and docs

- Unit tests for span attribute mapping
- Add Observability section to `docs/API.md`

---

## Phase 9 — Image Input & Multimodal

> Ref: [features/image-input.md](https://github.com/github/copilot-sdk/blob/main/docs/features/image-input.md)

### 9.1 — Image attachment types (`src/core/types.ts` extension)

- `ImageAttachment` interface — `type: 'image'`, `data: string` (base64), `mimeType`
- `MessageWithAttachments` — extends `Message` with `attachments?: ImageAttachment[]`
- `createImageAttachment(filePath | base64, mimeType)` factory in `src/utils/messages.ts`

---

## Backlog / Under Consideration

| Item | Notes |
|---|---|
| GitHub OAuth device flow helper | Automate the `gho_` token acquisition flow |
| Azure Managed Identity support | `AZURE_CLIENT_ID` / workload identity for BYOK |
| Steering & Queueing API | Typed wrappers for immediate vs. queued message delivery |
| Session state inspection | Read `plan.md` and `files/` artifacts from active sessions |
| CLI bundling helpers | Utilities for shipping the Copilot CLI with a Node.js app |
| Microsoft Agent Framework integration | Typed bridge for MAF multi-agent workflows |
| ibira.js fetch integration | Replace raw `fetch` calls in `completions_client.ts` with [`IbiraAPIFetcher` / `IbiraAPIFetchManager`](https://github.com/mpbarbosa/ibira.js) from the [ibira.js](https://github.com/mpbarbosa/ibira.js) project. Install with `npm install ibira.js` and import via `import { IbiraAPIFetcher, IbiraAPIFetchManager } from 'ibira.js'`. Gains LRU caching, retry with exponential back-off, request deduplication, and observer-pattern notifications — all zero-dependency and Node.js ≥18 compatible. |
| `@github/copilot-sdk` semver review at 1.0 | Currently pinned as `^0.1.32` (resolves to `>=0.1.32 <0.2.0`). When the SDK reaches `1.0.0`, reassess the range: consider exact pinning or `~` to guard against unexpected breaking changes in a newly-stable API. Track the [copilot-sdk releases](https://github.com/github/copilot-sdk/releases) page. |
| `CopilotClient` retry / resilience policy | `complete()` and `stream()` currently propagate transient network errors (DNS failures, connection resets) directly to the caller with no retry. Add an optional `RetryPolicy` option to `ClientOptions` — `{ maxAttempts: number, backoffMs: number }` — retrying only on network-level errors (not on `AuthenticationError` or `APIError`). Superseded if the `ibira.js` fetch integration is adopted (ibira already provides exponential back-off). |
| `parseSSELines` / `utils/stream` consolidation | `parseSSELines` in `completions_client.ts` (`@internal`) duplicates JSON-parse logic already in `parseSSEChunk` (`utils/stream.ts`). When the streaming surface grows (Phase 5), replace the internal batch function with a loop over the public `parseSSEChunk` utility to eliminate the duplication. |
| SSE malformed-line observability | `parseSSELines` silently skips malformed JSON lines (`catch { /* skip */ }`). Pure-function constraints prevent logging at parse time. Surface these as structured events via the OpenTelemetry bridge planned in Phase 8, or expose a `onMalformedLine` callback on `ClientOptions` so callers can instrument without coupling the core to a logger. |
| Hooks submodule split | `src/core/hooks.ts` currently co-locates all six hook input/output interfaces and both convenience helpers. If the hook surface grows beyond Phase 2, split into `src/core/hooks/types.ts` (interfaces only) and `src/core/hooks/factories.ts` (convenience helpers) to keep each file focused. |
| BYOK provider factory pattern | `auth.ts` uses a discriminated union for `BYOKProvider`. If new provider types are added (e.g. Bedrock, Vertex AI), introduce a `createBYOKProvider(type, config)` factory in `src/core/auth.ts` to centralise construction and validation instead of requiring callers to build the union object manually. |
| Runtime API response validation | `response.json() as Promise<CompletionResponse>` in `completions_client.ts` trusts the API shape at compile time only. Add optional Zod schemas (`CompletionResponseSchema`, `StreamChunkSchema`) as a tree-shakeable companion module (`src/utils/schemas.ts`) so callers can opt in to runtime validation without adding Zod as a required peer dependency. |
| Type-level test coverage (`tsd` / `expect-type`) | Add `tsd` or `expect-type` as a dev dependency to write `.test-d.ts` files that assert the public API's type signatures (e.g. `expectType<Message>(createUserMessage('x'))`). Run as part of `npm run validate`. Prevents type regressions that unit tests cannot catch. |
| `explicit-function-return-type` ESLint rule | `@typescript-eslint/explicit-function-return-type` is not currently active. TypeScript inference covers non-exported functions reliably today; enable the rule when the public surface grows and inference becomes harder to audit at a glance. |

---

## Guiding Principles

- **Pure TypeScript** — all new modules follow `src/**/*.ts` convention, no plain `.js` under `src/`
- **No side effects** — utility functions are pure and deterministic
- **Zero required peer deps** — advanced features (OpenTelemetry, Redis) are opt-in
- **Test coverage ≥ 80%** — all phases must meet the Jest coverage threshold before shipping
- **JSDoc on every export** — `@param`, `@returns`, `@since`, `@example` required
