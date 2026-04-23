# ROADMAP — olinda_copilot_sdk.ts

> **Current version**: 0.5.3  
> **Reference SDK**: `@github/copilot-sdk` v0.1.32  
> **Goal**: Become the idiomatic TypeScript execution layer for `@github/copilot-sdk` — enabling applications to embed programmable, agentic AI workflows anywhere software runs, not just inside an IDE.

The era of "AI as text" — prompt in, text out, human decides what to do next — is over.
Modern AI-powered systems **execute**: they plan steps, invoke tools, modify state, recover from errors, and adapt under constraints you define.
olinda's role is to make that execution capability a composable, typed, application-layer primitive, covering both the HTTP REST surface (direct API access without a CLI process) and the full CLI-process session surface that powers agentic workflows.

---

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Current State](#current-state)
- [Gap Analysis](#gap-analysis)
- [Milestone v0.2.1 — Session Client Export + Core Parity](#milestone-v021--session-client-export--core-parity)
- [Milestone v0.3.2 — Full SessionConfig Parity](#milestone-v032--full-sessionconfig-parity)
- [Milestone v0.4.1 — Permission & Hooks Bridge](#milestone-v041--permission--hooks-bridge)
- [Milestone v0.5.3 — Session Management & Model Introspection](#milestone-v052--session-management--model-introspection)
- [Milestone v0.8.0 — Advanced Features](#milestone-v060--advanced-features)
- [Milestone v0.8.0 — Agentic Execution Patterns](#milestone-v070--agentic-execution-patterns)
- [Non-Goals](#non-goals)

---

## Design Philosophy

Three patterns from production agentic systems guide olinda's roadmap priorities:

### Pattern 1 — Delegate intent, not fixed steps

Scripts break when context changes or errors require recovery.
Agentic execution lets applications **expose intent and constraints** instead of encoding every step.
The agent plans, executes, and adapts — all within boundaries you define.

olinda's contribution: typed `SessionConfig` fields (`tools`, `customAgents`, `hooks`, `onPermissionRequest`) that let callers constrain the agent's scope without rebuilding orchestration from scratch.

### Pattern 2 — Ground execution in structured runtime context

Stuffing domain knowledge into prompts makes workflows brittle.
Reliable agentic systems expose structured context — tools, MCP servers, skills — that the execution engine retrieves at runtime.

olinda's contribution: first-class `defineTool`, `createLocalMCPServer`/`createRemoteMCPServer`, and `loadSkillDirectories` factories so domain-specific context is structured and composable, not embedded in prompt strings.

### Pattern 3 — Embed execution outside the IDE

Agentic capabilities belong wherever software runs: desktop apps, background services, SaaS platforms, event-driven systems.
When your application can trigger logic, it can trigger agentic execution.

olinda's contribution: the `CopilotSdkWrapper` abstraction and HTTP `CopilotClient` bring Copilot's planning and execution loop into any Node.js context — no IDE, no terminal required.

---

## Current State

`olinda_copilot_sdk.ts` currently provides:

| Component | Status | Notes |
|-----------|--------|-------|
| `CopilotClient` (HTTP REST) | ✅ Exported | Unique to olinda — direct REST calls without CLI process |
| Auth: BYOK providers, HMAC, token resolution | ✅ Exported | `AzureProvider`, `OpenAIProvider`, `AnthropicProvider`, etc. |
| Hook factories: `createHooks`, `approveAllTools`, `denyTools` | ✅ Exported | But different type system from SDK's `PermissionHandler` |
| Hook types: `PreToolUseHandler`, `PostToolUseHandler`, etc. | ✅ Exported | Partially aligned with SDK's `SessionHooks` |
| `SessionConfig` (partial) | ✅ Exported | Missing 10+ fields present in `@github/copilot-sdk` |
| MCP server configuration utilities | ✅ Exported | `createLocalMCPServer`, `createRemoteMCPServer` |
| Skills utilities | ✅ Exported | `SkillConfig`, `loadSkillDirectories` |
| Message utilities | ✅ Exported | `createUserMessage`, `createSystemMessage`, etc. |
| Stream (SSE) parsing utilities | ✅ Exported | `parseSSELine`, `parseSSEChunk`, `extractDeltaContent` |
| Error hierarchy | ✅ Exported | `CopilotSDKError`, `AuthenticationError`, `APIError`, `SystemError` |
| `CopilotSdkWrapper` (CLI process session wrapper) | ✅ Exported | `CopilotSdkWrapper`, `CopilotSdkWrapperOptions`, `InitializeResult`, `SendResult` |
| `approveAll` (SDK-compatible `PermissionHandler`) | ✅ Exported | Re-exported directly from `@github/copilot-sdk` |
| `defineTool` helper | ✅ Exported | Type-safe tool definition factory (v0.3.2) |
| `ResumeSessionConfig` | ✅ Exported | Session resumption type (v0.3.2) |
| `UserInputHandler` / `onUserInputRequest` | ✅ Exported | Agent can ask user questions |
| `SystemMessageConfig` (append/replace union) | ✅ Exported | `SystemMessageAppendConfig`, `SystemMessageReplaceConfig` (v0.3.2) |

---

## Gap Analysis

The following features exist in `@github/copilot-sdk` v0.1.32 but are absent or incomplete in `olinda_copilot_sdk.ts`:

### P0 — Blockers (required for any session usage)

| Gap | SDK API | olinda Status | Impact |
|-----|---------|---------------|--------|
| **`CopilotSdkWrapper` not exported** | N/A (olinda-specific) | `session_client.ts` internal only | Consumers can't use the CLI-process session wrapper without copy-pasting it |
| **`approveAll` missing** | `approveAll: PermissionHandler` from `types.ts` | `approveAllTools()` exists but returns `PreToolUseHandler` (incompatible type) | `onPermissionRequest` in `SessionConfig` requires `PermissionHandler` — cannot use `approveAllTools` there |
| **`SessionConfig.onPermissionRequest` missing** | Required field (`PermissionHandler`) | Not in olinda's `SessionConfig` interface | Sessions created via olinda's `SessionConfig` type silently lack permission handling |

### P1 — High Priority (feature parity)

| Gap | SDK API | olinda Status |
|-----|---------|---------------|
| **`defineTool` helper** | `defineTool<T>(name, config)` — Zod schema + type-safe handler | Not present |
| **`SessionConfig.tools`** | `Tool<any>[]` — tools to expose to the CLI | Not in olinda's `SessionConfig` |
| **`SessionConfig.availableTools` / `excludedTools`** | Tool allow/deny lists | Not in olinda's `SessionConfig` |
| **`SessionConfig.systemMessage`** | `SystemMessageConfig` (append or replace union) | olinda uses `string` — loses the `append`/`replace` semantics |
| **`SessionConfig.onUserInputRequest`** | `UserInputHandler` — agent can ask user questions | Not present |
| **`SessionConfig.hooks`** | `SessionHooks` (preToolUse, postToolUse, sessionStart/End, etc.) | Not in olinda's `SessionConfig` |
| **`SessionConfig.clientName`** | `string` — identifies the client in User-Agent | Not in olinda's `SessionConfig` |
| **`SessionConfig.configDir`** | `string` — override config directory | Not in olinda's `SessionConfig` |
| **`ResumeSessionConfig`** | `Pick<SessionConfig, ...> & { sessionId: string }` | Not present — no session resumption |
| **`reasoningEffort: 'xhigh'`** | 4th level: `'low' \| 'medium' \| 'high' \| 'xhigh'` | olinda only has 3 levels |

### P2 — Medium Priority (session management)

| Gap | SDK API | olinda Status |
|-----|---------|---------------|
| **`SessionConfig.customAgents`** | `CustomAgentConfig[]` — custom agent definitions | Not present |
| **`SessionConfig.infiniteSessions`** | `InfiniteSessionConfig` — auto-reload on context limit | Not present |
| **`SessionContext`** | Session context snapshot type | Not exported |
| **`SessionListFilter`** | Filter for `listSessions()` | Not exported |
| **`SessionMetadata`** | Session metadata shape | Not exported |
| **`ForegroundSessionInfo`** | Foreground session info type | Not exported |
| **`SessionLifecycleEventType`** | Union of lifecycle event strings | Not exported |
| **`SessionLifecycleHandler`** / **`TypedSessionLifecycleHandler`** | Typed lifecycle event handlers | Not exported |

### P3 — Low Priority (model introspection & status)

| Gap | SDK API | olinda Status |
|-----|---------|---------------|
| **`ModelInfo`** | Rich model descriptor (`id`, `name`, `capabilities`, `billing`, `policy`) | Not exported |
| **`ModelCapabilities`** | Per-model capability flags | Not exported |
| **`ModelBilling`** | Per-model billing metadata | Not exported |
| **`ModelPolicy`** | Per-model policy flags | Not exported |
| **`GetStatusResponse`** | `getStatus()` return shape | Not exported |
| **`GetAuthStatusResponse`** | `getAuthStatus()` return shape | Not exported |
| **`ConnectionState`** | `'disconnected' \| 'connecting' \| 'connected' \| 'error'` | Not exported |
| **`CopilotClientOptions`** | CLI process client options (host, port, cliPath, etc.) | Not exported |

### P3 — Low Priority (session event types)

| Gap | SDK API | olinda Status |
|-----|---------|---------------|
| **`SessionEvent`** union type | Full union of all session event shapes | Not exported |
| **`SessionEventType`** | Union of event type strings | Not exported |
| **`SessionEventPayload<T>`** | Extracts payload for a given event type | Not exported |
| **`SessionEventHandler`** | Handler for all session events | Not exported |
| **`TypedSessionEventHandler<T>`** | Type-safe per-event handler | Not exported |
| **`ToolInvocation`** | Tool call context passed to handlers | Not exported |
| **`ToolCallRequestPayload`** / **`ToolCallResponsePayload`** | Low-level tool RPC shapes | Not exported |
| **`Tool<TArgs>`** | Tool definition interface | Not exported (only `ToolResultObject` re-exported) |
| **`ToolHandler<TArgs>`** | Tool handler function type | Not exported |
| **`UserInputRequest`** / **`UserInputResponse`** | Agent-to-user question/answer shapes | Not exported |

### Hook type alignment

olinda's hook system (`PreToolUseHandler`, `PostToolUseHandler`, etc.) uses a **different input/output type surface** from `@github/copilot-sdk`'s `SessionHooks`. The SDK's types include `PreToolUseHookInput` / `PreToolUseHookOutput` with fields such as `requestId`, `toolCallId`, `sessionId` (on the invocation object) — while olinda's types use `BaseHookInput` with `timestamp` and `cwd`. A bridge adapter is needed for interoperability.

---

## Milestone v0.2.1 — Session Client Export + Core Parity

> **Theme**: Make `CopilotSdkWrapper` a first-class public export and fill the P0 blockers.

### Tasks

- [x] **Export `CopilotSdkWrapper`** from `index.ts`
  - Rename `session_client.ts` to `copilot_sdk_wrapper.ts` or expose it as-is
  - Export `CopilotSdkWrapperOptions`, `InitializeResult`, `SendResult` types
- [x] **Export `approveAll`** — re-export from `@github/copilot-sdk` (it is already a `PermissionHandler`)
- [x] **Add `onPermissionRequest` to `SessionConfig`**
  - Type: `PermissionHandler` (import from `@github/copilot-sdk`)
  - Required when creating sessions via the CLI process client
- [x] **Export `PermissionHandler`**, `PermissionRequest`, `PermissionRequestResult` types
- [x] **Export `UserInputHandler`**, `UserInputRequest`, `UserInputResponse` types
- [x] **Add `onUserInputRequest` to `SessionConfig`**
- [x] Add `sendStream(prompt, onDelta, timeoutMs?)` to `CopilotSdkWrapper`
  - Already present in internal `session_client.ts` — just needs export

---

## Milestone v0.3.2 — Full SessionConfig Parity

> **Theme**: `olinda`'s `SessionConfig` should be a complete superset of `@github/copilot-sdk`'s `SessionConfig`.

### Tasks

- [x] **Add missing `SessionConfig` fields**:
  - `clientName?: string`
  - `configDir?: string`
  - `tools?: Tool<any>[]`
  - `availableTools?: string[]`
  - `excludedTools?: string[]`
  - `systemMessage?: SystemMessageConfig` (replace plain `string`)
  - `hooks?: SessionHooks`
  - `customAgents?: CustomAgentConfig[]`
  - `infiniteSessions?: InfiniteSessionConfig`
- [x] **Fix `reasoningEffort`** — add `'xhigh'` level to match SDK
- [x] **Add `SystemMessageConfig`** union type: `SystemMessageAppendConfig | SystemMessageReplaceConfig`
- [x] **Export `Tool<TArgs>`**, `ToolHandler<TArgs>`, `ToolInvocation` types
- [x] **Add `defineTool<T>(name, config)` helper** — mirrors SDK's function for type-safe tool definition
- [x] **Add `ResumeSessionConfig`** type and wire into `CopilotSdkWrapper.resumeSession()`
- [x] **Add `CustomAgentConfig`** and `InfiniteSessionConfig` types

---

## Milestone v0.4.1 — Permission & Hooks Bridge

> **Theme**: Provide adapters between olinda's hook system and `@github/copilot-sdk`'s `SessionHooks` / `PermissionHandler`.

### Tasks

- [x] **Align hook type signatures** with `@github/copilot-sdk`'s `PreToolUseHookInput` / `PreToolUseHookOutput`
  - `BaseHookInput`: add `requestId`, `toolCallId`, align invocation object to `{ sessionId: string }`
  - Evaluate backward compat breakage (minor semver bump)
- [x] **`approveAllTools()` adapter** — return an `onPermissionRequest`-compatible `PermissionHandler` (not just `PreToolUseHandler`)
- [x] **`createHooks(config)` → `SessionHooks` bridge** — convert olinda's `HooksConfig` into `@github/copilot-sdk`'s `SessionHooks` shape so it can be passed to `SessionConfig.hooks` directly
- [x] **Export aligned `SessionHooks`** interface (wraps SDK's type or re-exports it)
- [x] **Export `UserPromptSubmittedHandler`**, `SessionStartHandler`, `SessionEndHandler`, `ErrorOccurredHandler`

---

## Milestone v0.5.3 — Session Management & Model Introspection

> **Theme**: Export the full set of session management and model query types so consumers don't need to depend on `@github/copilot-sdk` directly for types.

### Tasks

- [ ] **Export session management types**:
  - `SessionContext`, `SessionListFilter`, `SessionMetadata`
  - `ForegroundSessionInfo`
  - `SessionLifecycleEventType`, `SessionLifecycleHandler`, `TypedSessionLifecycleHandler`
- [ ] **Export session event types**:
  - `SessionEvent`, `SessionEventType`, `SessionEventPayload<T>`
  - `SessionEventHandler`, `TypedSessionEventHandler<T>`
  - `AssistantMessageEvent`
- [ ] **Export model introspection types**:
  - `ModelInfo`, `ModelCapabilities`, `ModelBilling`, `ModelPolicy`
- [ ] **Export status types**:
  - `GetStatusResponse`, `GetAuthStatusResponse`
  - `ConnectionState`
- [ ] **Export `CopilotClientOptions`** — CLI process client constructor options (host, port, cliPath, etc.)
- [ ] **Add `CopilotSdkWrapper.resumeSession(sessionId, config)`** — wraps SDK's `client.resumeSession()`
- [ ] **Add session query helpers to `CopilotSdkWrapper`**:
  - `listSessions(filter?)`, `deleteSession(id)`, `getLastSessionId()`
  - `getForegroundSessionId()`, `setForegroundSessionId(id)`
  - `ping()`, `getStatus()`, `getState()`

---

## Milestone v0.8.0 — Advanced Features

> **Theme**: Cover the remaining SDK surface and polish the developer experience.

### Tasks

- [ ] **`ZodSchema<T>` interface** — expose for use with `defineTool`
- [ ] **`ToolResultObject` + `ToolBinaryResult`** — ensure all result shapes are exported
- [ ] **`ToolCallRequestPayload` / `ToolCallResponsePayload`** — low-level RPC shapes for advanced use
- [ ] **`UserInputRequest` / `UserInputResponse`** extended types (full SDK shape)
- [ ] **`MessageOptions`** — full `sendAndWait` options shape (prompt, images, context, timeout, etc.)
- [ ] **`CopilotSdkWrapper.setModel(model)`** — forward to `session.setModel()`
- [ ] **`CopilotSdkWrapper.getMessages()`** — forward to `session.getMessages()`
- [ ] **`CopilotSdkWrapper.abort()`** — already present, ensure exported type is accurate
- [ ] **`CopilotSdkWrapper.registerTools(tools)`** — expose tool registration post-session-create
- [ ] **`CopilotSdkWrapper.on(eventType, handler)`** — expose typed session event subscription
- [ ] **`olinda` ↔ `@github/copilot-sdk` interop guide** — document which olinda types map to which SDK types, with migration examples

---

## Milestone v0.8.0 — Agentic Execution Patterns

> **Theme**: Provide high-level helpers that turn the three agentic patterns (delegate intent, structured context, embedded execution) into simple, typed, composable APIs — reducing the gap between "SDK wrapper" and "execution layer."

### Tasks

#### Intent delegation

- [ ] **`CopilotSdkWrapper.runTask(intent, options)`** — high-level helper that accepts a natural-language intent string and a constraints object (`tools`, `maxTurns`, `timeoutMs`) and runs the agentic loop to completion; returns a structured `TaskResult` with `output`, `steps`, and `exitReason`
- [ ] **`TaskResult`** type — `{ output: string; steps: AgentStep[]; exitReason: 'completed' | 'max_turns' | 'timeout' | 'error' }`
- [ ] **`AgentStep`** type — captures each planning/execution step: `{ type: 'tool_call' | 'message', toolName?: string, input?: unknown, output?: unknown, duration: number }`

#### Event-driven invocation

- [ ] **`createExecutionTrigger(wrapper, options)`** — factory that wraps a `CopilotSdkWrapper` and exposes a `trigger(intent)` method suitable for use in event handlers (file watchers, deployment hooks, user actions, webhooks); handles session lifecycle automatically
- [ ] **`ExecutionTriggerOptions`** type — `{ sessionPolicy: 'reuse' | 'fresh'; onStep?: (step: AgentStep) => void; onComplete?: (result: TaskResult) => void }`
- [ ] Cookbook example: trigger agentic execution from a `fs.watch` event (file change → agent analyzes and patches)
- [ ] Cookbook example: trigger from an HTTP webhook (deployment event → agent runs post-deploy checks)

#### Observable execution

- [ ] **`CopilotSdkWrapper.on('step', handler)`** — stream individual agent steps as they execute (builds on the `on(eventType, handler)` planned in v0.8.0)
- [ ] **`CopilotSdkWrapper.on('tool_call', handler)`** — fires before each tool invocation with the tool name and input
- [ ] **`CopilotSdkWrapper.on('tool_result', handler)`** — fires after each tool returns with the output and duration
- [ ] **`ExecutionObserver`** utility — subscribes to all execution events and emits a structured log, suitable for feeding into telemetry, audit trails, or CI dashboards

#### Background service embedding

- [ ] **`AgentService`** class — long-running wrapper around `CopilotSdkWrapper` designed for background services; manages session keep-alive, auto-reconnect, and a work queue (`enqueue(intent, options)`)
- [ ] **`AgentServiceOptions`** type — `{ keepAliveIntervalMs?: number; maxQueueSize?: number; concurrency?: number }`
- [ ] Document embedding pattern: running `AgentService` inside an Express/Fastify server, a worker thread, or a system daemon

---

## Non-Goals

The following will **not** be implemented in olinda, as they are internal SDK concerns:

- Raw JSON-RPC / MsgPack transport layer (handled by `@github/copilot-sdk` internally)
- CLI process spawning / stdio/TCP connection management (the wrapper delegates to the SDK)
- Replicating `CopilotSession` — the SDK's session class is used directly; olinda wraps it
- Generated RPC stubs (`generated/rpc.d.ts`, `generated/session-events.d.ts`)

---

## What Makes olinda Unique

Even after full parity, olinda's distinct value over bare `@github/copilot-sdk`:

| Feature | olinda | `@github/copilot-sdk` |
|---------|--------|----------------------|
| HTTP REST client (no CLI process) | ✅ `CopilotClient` | ❌ |
| BYOK auth (HMAC, Azure, Anthropic, OpenAI-compatible) | ✅ full auth module | ⚠️ partial via `provider` config only |
| SSE stream parsing utilities | ✅ `parseSSELine`, `parseSSEChunk` | ❌ |
| Message factory utilities | ✅ `createUserMessage`, `createSystemMessage` | ❌ |
| MCP server typed config factories | ✅ `createLocalMCPServer`, etc. | ⚠️ types only, no factories |
| Skills directory utilities | ✅ `loadSkillDirectories` | ⚠️ types only |
| Hook factories (`approveAllTools`, `denyTools`) | ✅ | ❌ |
| Typed `CopilotSdkWrapper` with cookbook patterns | ✅ (after v0.2.1) | ❌ (raw `CopilotClient` only) |
| High-level intent delegation (`runTask`) | ✅ (v0.8.0) | ❌ |
| Event-driven execution triggers | ✅ (v0.8.0) | ❌ |
| Observable execution (`on('step' \| 'tool_call')`) | ✅ (v0.8.0) | ❌ |
| Background service embedding (`AgentService`) | ✅ (v0.8.0) | ❌ |
