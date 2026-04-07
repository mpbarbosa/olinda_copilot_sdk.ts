# API Reference — olinda_copilot_sdk.ts

Complete API reference for the TypeScript Wrapper Library for GitHub Copilot SDK.

---

## `CopilotClient`

HTTP client for the GitHub Copilot chat completions API.

### Constructor

```typescript
new CopilotClient(options: ClientOptions)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `token` | `string` | _(required)_ | GitHub token for API authentication |
| `baseUrl` | `string` | `'https://api.githubcopilot.com'` | Base URL for the Copilot API |
| `model` | `string` | `'gpt-4o'` | Default model for completions |

Throws `AuthenticationError` when `token` is empty.

### `complete(messages, options?)`

Send a non-streaming chat completion request.

```typescript
async complete(
  messages: Message[],
  options?: Partial<Omit<CompletionRequest, 'messages' | 'stream'>>
): Promise<CompletionResponse>
```

### `stream(messages, options?)`

Send a streaming chat completion request as an async generator.

```typescript
async *stream(
  messages: Message[],
  options?: Partial<Omit<CompletionRequest, 'messages' | 'stream'>>
): AsyncGenerator<StreamChunk>
```

### `streamText(messages, options?)`

Convenience async generator that yields plain text delta strings. Internally
delegates to `stream()` and maps `extractDeltaContent()` over each chunk.

```typescript
async *streamText(
  messages: Message[],
  options?: Partial<Omit<CompletionRequest, 'messages' | 'stream'>>
): AsyncGenerator<string>
```

```typescript
for await (const text of client.streamText(messages)) {
  process.stdout.write(text);
}
```

---

## Message Utilities (`src/utils/messages`)

Pure factory functions — no side effects, no state.

| Function | Signature | Description |
|---|---|---|
| `createUserMessage` | `(content: string) => Message` | Create a `user` message |
| `createSystemMessage` | `(content: string) => Message` | Create a `system` message |
| `createAssistantMessage` | `(content: string) => Message` | Create an `assistant` message |
| `createFunctionMessage` | `(name: string, content: string) => Message` | Create a `function` result message |
| `extractContent` | `(message: Message) => string` | Return message content |
| `hasRole` | `(message: Message, role: MessageRole) => boolean` | Check message role |
| `filterByRole` | `(messages: Message[], role: MessageRole) => Message[]` | Filter messages by role |

---

## Stream Utilities (`src/utils/stream`)

Pure SSE parsing utilities — no side effects, no state.

| Function | Signature | Description |
|---|---|---|
| `parseSSELine` | `(line: string) => string \| null` | Extract data payload from a SSE line |
| `parseSSEChunk` | `(line: string) => StreamChunk \| null` | Parse a SSE line into a typed chunk |
| `parseSSEStream` | `(body: ReadableStream<Uint8Array>) => AsyncGenerator<StreamChunk>` | Parse an entire SSE response body as an async generator |
| `extractDeltaContent` | `(chunk: StreamChunk) => string` | Get combined delta content from a chunk |
| `isStreamDone` | `(chunk: StreamChunk) => boolean` | Check if chunk signals end of stream |

---

## Error Classes (`src/core/errors`)

| Class | Extends | Description |
|---|---|---|
| `CopilotSDKError` | `Error` | Base error for all SDK errors |
| `AuthenticationError` | `CopilotSDKError` | Token missing or authentication failed |
| `SystemError` | `CopilotSDKError` | Precondition not met (e.g. calling `send()` before `initialize()`) |
| `APIError` | `CopilotSDKError` | Non-2xx HTTP response from the API. Exposes `statusCode: number` |

---

## TypeScript Types (`src/core/types`)

| Type / Interface | Description |
|---|---|
| `MessageRole` | `'system' \| 'user' \| 'assistant' \| 'function'` |
| `Message` | Chat message with `role`, `content`, optional `name` |
| `CompletionRequest` | Request body for the completions endpoint |
| `CompletionResponse` | Full non-streaming response |
| `CompletionChoice` | A single choice in a non-streaming response |
| `StreamChunk` | A single SSE chunk in a streaming response |
| `StreamChoice` | A single choice within a stream chunk |
| `StreamDelta` | Partial content update within a stream choice |
| `ClientOptions` | Constructor options for `CopilotClient` |

---

## Authentication — `src/core/auth`

### `AuthOptions`

Composite auth configuration. All fields optional — `resolveAuthPriority` picks the highest-priority method that has a value.

| Field | Type | Description |
|---|---|---|
| `githubToken` | `string` | Explicit GitHub OAuth/PAT token (`gho_`, `ghu_`, `github_pat_` prefixes) |
| `hmacKey` | `HmacKeyConfig` | HMAC key pair for enterprise/backend auth |
| `useLoggedInUser` | `boolean` | `false` disables stored OAuth & GitHub CLI fallback. Default: `true` |
| `provider` | `BYOKProvider` | Route completions through a third-party model |

### `HmacKeyConfig`

| Field | Type | Description |
|---|---|---|
| `keyId` | `string` | HMAC key identifier |
| `secret` | `string` | HMAC shared secret |

### `BYOKProvider`

Discriminated union of four BYOK provider variants:

| `type` | Additional fields | Description |
|---|---|---|
| `'azure'` | `endpoint`, `apiKey`, `deploymentId` | Azure AI Foundry |
| `'openai'` | `apiKey`, `model` | OpenAI |
| `'anthropic'` | `apiKey`, `model` | Anthropic |
| `'openai-compatible'` | `url`, `apiKey`, `model?` | Any OpenAI-compatible endpoint |

### `AuthMethod`

```typescript
type AuthMethod =
  | 'github-token'      // explicit token in AuthOptions
  | 'hmac-key'          // HMAC key from options or env
  | 'direct-api-token'  // COPILOT_TOKEN / GITHUB_COPILOT_TOKEN env var
  | 'env-token'         // COPILOT_GITHUB_TOKEN → GH_TOKEN → GITHUB_TOKEN chain
  | 'stored-oauth'      // requires async I/O from caller
```

### `ResolvedAuth`

| Field | Type | Present when |
|---|---|---|
| `method` | `AuthMethod` | Always |
| `token` | `string` | `github-token`, `direct-api-token`, `env-token` |
| `hmacKey` | `HmacKeyConfig` | `hmac-key` |

### `isGitHubToken(token)`

```typescript
isGitHubToken(token: string): boolean
```

Returns `true` when `token` starts with a recognised GitHub prefix (`gho_`, `ghu_`, `github_pat_`).

### `resolveHmacFromEnv(env)`

```typescript
resolveHmacFromEnv(env: Record<string, string | undefined>): HmacKeyConfig | null
```

Reads `COPILOT_HMAC_KEY_ID` and `COPILOT_HMAC_KEY_SECRET` from the given env map. Returns `null` if either is absent.

### `resolveAuthPriority(options, env?)`

```typescript
resolveAuthPriority(
  options: AuthOptions,
  env?: Record<string, string | undefined>,  // default: process.env
): ResolvedAuth | null
```

Resolves the authentication method to use, following the SDK's priority order:

1. `options.githubToken` → `{ method: 'github-token', token }`
2. HMAC key (options or `COPILOT_HMAC_KEY_*` env) → `{ method: 'hmac-key', hmacKey }`
3. `COPILOT_TOKEN` / `GITHUB_COPILOT_TOKEN` → `{ method: 'direct-api-token', token }`
4. `COPILOT_GITHUB_TOKEN` → `GH_TOKEN` → `GITHUB_TOKEN` → `{ method: 'env-token', token }`
5. `useLoggedInUser !== false` → `{ method: 'stored-oauth' }` _(caller performs async I/O)_
6. Returns `null` — no auth available

Pass an explicit `env` object in tests to avoid reading from the real environment.

---

## Session Configuration — `src/core/session_config`

### `ReasoningEffort`

```typescript
type ReasoningEffort = 'low' | 'medium' | 'high' | 'xhigh';
```

Controls reasoning depth for models that support it (e.g. `o3-mini`).

### `SessionConfig`

Full configuration for a `@github/copilot-sdk` session. All fields optional.

| Field | Type | Description |
|---|---|---|
| `sessionId` | `string` | Session ID for resumable sessions |
| `model` | `string` | Model identifier (e.g. `'gpt-4o'`, `'claude-sonnet-4'`) |
| `systemMessage` | `string` | System prompt override |
| `workingDirectory` | `string` | Working directory forwarded to the CLI process |
| `reasoningEffort` | `ReasoningEffort` | Reasoning depth: `'low'` \| `'medium'` \| `'high'` \| `'xhigh'` |
| `streaming` | `boolean` | Emit real-time events. Default: `false` |
| `provider` | `BYOKProvider` | Route through a BYOK provider instead of Copilot |
| `onPermissionRequest` | `PermissionHandler` | Handler for permission requests. Defaults to `approveAll` in `CopilotSdkWrapper` |
| `onUserInputRequest` | `UserInputHandler` | Handler for `ask_user` tool invocations |

### `UserInputRequest`

```typescript
interface UserInputRequest {
  question: string;
  choices?: string[];
  allowFreeform?: boolean;
}
```

### `UserInputResponse`

```typescript
interface UserInputResponse {
  answer: string;
  wasFreeform: boolean;
}
```

### `UserInputHandler`

```typescript
type UserInputHandler = (
  request: UserInputRequest,
  invocation: { sessionId: string },
) => Promise<UserInputResponse> | UserInputResponse;
```

```typescript
// Example
const config: SessionConfig = {
  model: 'gpt-4o',
  systemMessage: 'You are a TypeScript expert.',
  streaming: true,
};

// Resumable BYOK session
const config: SessionConfig = {
  sessionId: 'session-user42-2026-03-12',
  provider: { type: 'anthropic', apiKey: 'sk-ant-...', model: 'claude-sonnet-4' },
};
```

---

## `CopilotSdkWrapper`

High-level wrapper around the `@github/copilot-sdk` `CopilotClient` that manages
the full session lifecycle: client start/stop, session creation/destruction,
serialised request dispatch, and error-resilient cleanup.

### Constructor

```typescript
new CopilotSdkWrapper(options?: CopilotSdkWrapperOptions)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `model` | `string` | SDK default | Model identifier for sessions |
| `timeout` | `number` | SDK default | Default `sendAndWait` timeout (ms) |
| `workingDirectory` | `string` | `process.cwd()` | Working directory for the session |

### `CopilotSdkWrapper.isAvailable()`

Static method. Returns `true` if the `@github/copilot-sdk` `CopilotClient` is importable.
Use this to gate SDK features in environments where the SDK may not be installed.

```typescript
if (CopilotSdkWrapper.isAvailable()) {
  const wrapper = new CopilotSdkWrapper();
}
```

### `initialize()`

Starts the client, authenticates, fetches available models, and creates a new session.

```typescript
async initialize(): Promise<InitializeResult>
```

Returns `InitializeResult`:

| Field | Type | Description |
|---|---|---|
| `authenticated` | `boolean` | Whether the SDK is authenticated |
| `availableModels` | `ModelInfo[]` | List of models returned by the SDK |

### `send(prompt, timeoutMs?)`

Sends a prompt and waits for the complete response. Requests are serialised — concurrent
callers queue automatically.

```typescript
async send(prompt: string, timeoutMs?: number): Promise<SendResult>
```

Returns `SendResult`:

| Field | Type | Description |
|---|---|---|
| `content` | `string` | Full response text |
| `success` | `boolean` | Whether the SDK considers the response successful |

Throws `SystemError` if called before `initialize()`.

### `sendStream(prompt, onDelta, timeoutMs?)`

Sends a prompt and calls `onDelta` for each incremental text chunk as the model streams.
Returns the final `SendResult` once streaming completes. Requests are serialised like `send()`.

```typescript
async sendStream(
  prompt: string,
  onDelta: (delta: string) => void,
  timeoutMs?: number,
): Promise<SendResult>
```

Throws `SystemError` if called before `initialize()`.

```typescript
const wrapper = new CopilotSdkWrapper();
await wrapper.initialize();
await wrapper.sendStream('Write a haiku', (delta) => process.stdout.write(delta));
```

### `abort()`

Aborts the current in-flight request, if supported by the SDK session.

```typescript
async abort(): Promise<void>
```

### `recreateSession()`

Destroys the current session, stops the client, restarts the client, and creates a fresh
session. Called before each retry after a timeout.

```typescript
async recreateSession(): Promise<void>
```

### `cleanup()`

Destroys the current session and stops the client. Calls `forceStop()` if `stop()` does not
complete within 5 seconds.

```typescript
async cleanup(): Promise<void>
```

### Session Management (v0.5.3)

All methods below require `initialize()` to have been called first (i.e. a client must be active).
They throw `SystemError` otherwise.

#### `resumeSession(sessionId, config?)`

Destroys the current active session (if any) and resumes an existing session by ID.

```typescript
async resumeSession(sessionId: string, config?: ResumeSessionConfig): Promise<void>
```

#### `listSessions(filter?)`

Lists all sessions, optionally filtered.

```typescript
async listSessions(filter?: SessionListFilter): Promise<SessionMetadata[]>
```

#### `deleteSession(sessionId)`

Permanently deletes a session by ID. Does not affect the currently active session.

```typescript
async deleteSession(sessionId: string): Promise<void>
```

#### `getLastSessionId()`

Returns the ID of the most recently used session, or `undefined` if none.

```typescript
async getLastSessionId(): Promise<string | undefined>
```

#### `getForegroundSessionId()`

Returns the ID of the current foreground session, or `undefined` if none.

```typescript
async getForegroundSessionId(): Promise<string | undefined>
```

#### `setForegroundSessionId(sessionId)`

Brings the given session to the foreground.

```typescript
async setForegroundSessionId(sessionId: string): Promise<void>
```

#### `ping(message?)`

Sends a ping to verify server connectivity.

```typescript
async ping(message?: string): Promise<{ message?: string; timestamp: string }>
```

#### `getStatus()`

Returns the current server status.

```typescript
async getStatus(): Promise<GetStatusResponse>
```

#### `getState()`

Returns the current connection state synchronously, without a network round-trip.

```typescript
getState(): ConnectionState
```

### Properties

| Property | Type | Description |
|---|---|---|
| `client` | `CopilotClient \| null` | The underlying SDK client, or `null` if not started |
| `session` | `CopilotSession \| null` | The active session, or `null` if not initialised |
| `authenticated` | `boolean` | `true` after a successful `initialize()` |
| `availableModels` | `ModelInfo[]` | Models fetched during `initialize()` |

---

## `approveAll`

Re-exported from `@github/copilot-sdk`. A ready-made `PermissionHandler` that
unconditionally approves every permission request.

```typescript
import { approveAll } from 'olinda_copilot_sdk.ts';

const wrapper = new CopilotSdkWrapper();
// approveAll is the default — pass it explicitly only if you want to be explicit:
const config: SessionConfig = { onPermissionRequest: approveAll };
```

### `PermissionHandler` / `PermissionRequest` / `PermissionRequestResult`

Re-exported types from `@github/copilot-sdk` for consumers who want to implement
custom permission handlers.

```typescript
import type { PermissionHandler, PermissionRequest } from 'olinda_copilot_sdk.ts';

const handler: PermissionHandler = async (request, { sessionId }) => {
  console.log(`Session ${sessionId} requesting: ${request.type}`);
  return approveAll(request, { sessionId });
};
```

---

## Hooks

Session hooks let you intercept and influence the Copilot session lifecycle.
All hooks are optional; include only the ones you need.

### Hook overview

| Hook | Trigger | Can modify |
|------|---------|-----------|
| `onPreToolUse` | Before a tool runs | args, permission decision |
| `onPostToolUse` | After a tool runs | tool result |
| `onUserPromptSubmitted` | When the user submits a prompt | prompt text |
| `onSessionStart` | When a session starts | initial context, config |
| `onSessionEnd` | When a session ends | cleanup actions, summary |
| `onErrorOccurred` | When an error occurs | recovery strategy |

### `createHooks(config)`

Factory that returns a typed `SessionHooks` object.

```typescript
import { createHooks, approveAllTools, denyTools } from 'olinda_copilot_sdk.ts';

const hooks = createHooks({
  onPreToolUse: approveAllTools(),
  onSessionEnd: async (input) => ({
    sessionSummary: `Ended: ${input.reason}`,
  }),
});
```

Pass the result to `SessionConfig.hooks` (or the SDK's `SessionConfig`).

### `approveAllTools()`

Returns a `PreToolUseHandler` that unconditionally approves every tool.

```typescript
const hooks = createHooks({ onPreToolUse: approveAllTools() });
```

### `denyTools(toolNames, reason?)`

Returns a `PreToolUseHandler` that denies the listed tools and passes all others through.

| Parameter | Type | Description |
|-----------|------|-------------|
| `toolNames` | `string[]` | Tool names to deny |
| `reason` | `string` (optional) | Human-readable denial reason |

```typescript
const hooks = createHooks({
  onPreToolUse: denyTools(['bash', 'write_file'], 'blocked by policy'),
});
```

### Hook input / output types

Every hook input extends `BaseHookInput`:

```typescript
interface BaseHookInput {
  timestamp: number;  // Unix epoch ms
  cwd: string;        // Working directory at hook time
}
```

#### Pre-tool-use

```typescript
interface PreToolUseInput extends BaseHookInput {
  toolName: string;
  toolArgs: unknown;
}

interface PreToolUseOutput {
  permissionDecision?: 'allow' | 'deny' | 'ask';
  permissionDecisionReason?: string;
  modifiedArgs?: unknown;
  additionalContext?: string;
  suppressOutput?: boolean;
}
```

#### Post-tool-use

```typescript
interface PostToolUseInput extends BaseHookInput {
  toolName: string;
  toolArgs: unknown;
  toolResult: ToolResultObject;
}

interface PostToolUseOutput {
  modifiedResult?: ToolResultObject;
  additionalContext?: string;
  suppressOutput?: boolean;
}
```

#### User prompt submitted

```typescript
interface UserPromptInput extends BaseHookInput { prompt: string }
interface UserPromptOutput {
  modifiedPrompt?: string;
  additionalContext?: string;
  suppressOutput?: boolean;
}
```

#### Session start / end

```typescript
interface SessionStartInput extends BaseHookInput {
  source: 'startup' | 'resume' | 'new';
  initialPrompt?: string;
}
interface SessionStartOutput {
  additionalContext?: string;
  modifiedConfig?: Record<string, unknown>;
}

interface SessionEndInput extends BaseHookInput {
  reason: 'complete' | 'error' | 'abort' | 'timeout' | 'user_exit';
  finalMessage?: string;
  error?: string;
}
interface SessionEndOutput {
  suppressOutput?: boolean;
  cleanupActions?: string[];
  sessionSummary?: string;
}
```

#### Error occurred

```typescript
interface ErrorOccurredInput extends BaseHookInput {
  error: string;
  errorContext: 'model_call' | 'tool_execution' | 'system' | 'user_input';
  recoverable: boolean;
}
interface ErrorOccurredOutput {
  suppressOutput?: boolean;
  errorHandling?: 'retry' | 'skip' | 'abort';
  retryCount?: number;
  userNotification?: string;
}
```

---

## MCP Servers (`src/core/mcp.ts`)

Typed configuration interfaces and factory helpers for [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers, which extend Copilot sessions with external tools.

### Interfaces

```typescript
interface LocalMCPServer {
  type?: 'local' | 'stdio';
  command: string;
  args: string[];
  env?: Record<string, string>;
  cwd?: string;
  tools?: string[];   // ['*'] = all, [] = none, or list specific names
  timeout?: number;
}

interface RemoteMCPServer {
  type: 'http' | 'sse';
  url: string;
  headers?: Record<string, string>;
  tools?: string[];
  timeout?: number;
}

type MCPServerMap = Record<string, LocalMCPServer | RemoteMCPServer>;
```

### Factory functions

#### `createLocalMCPServer(config: LocalMCPServer): LocalMCPServer`

Returns a typed copy of a local (stdio) MCP server config. Pass the result to `SessionConfig.mcpServers`.

```typescript
const fs = createLocalMCPServer({
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
  tools: ['*'],
});
```

#### `createRemoteMCPServer(config: RemoteMCPServer): RemoteMCPServer`

Returns a typed copy of a remote (HTTP/SSE) MCP server config.

```typescript
const gh = createRemoteMCPServer({
  type: 'http',
  url: 'https://api.githubcopilot.com/mcp/',
  headers: { Authorization: 'Bearer TOKEN' },
  tools: ['*'],
});
```

---

## Skills (`src/core/skills.ts`)

Typed configuration interfaces and utilities for [Copilot Skills](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md) — reusable prompt modules loaded from directories containing a `SKILL.md` file.

### Interfaces

```typescript
interface SkillConfig {
  name?: string;
  description?: string;
  body: string;   // full SKILL.md markdown content
}

interface SkillSessionConfig {
  skillDirectories: string[];
  disabledSkills?: string[];
}
```

### Utility functions

#### `loadSkillDirectories(paths: string[]): string[]`

Normalises and deduplicates a list of skill directory paths. Trims whitespace, removes empty strings, and preserves insertion order. Pure function — no filesystem access.

```typescript
loadSkillDirectories(['./skills', './skills', '', '  ./extra  '])
// → ['./skills', './extra']
```

---

## Session Management & Model Introspection Types (v0.5.3)

All types below are re-exported from `@github/copilot-sdk` for consumers who want full type
coverage without a direct dependency on the SDK package.

### Connection

| Type | Description |
|---|---|
| `ConnectionState` | `'disconnected' \| 'connecting' \| 'connected' \| 'error'` |
| `CopilotClientOptions` | Constructor options for the SDK's `CopilotClient` (host, port, cliPath, etc.) |

### Session Lifecycle

| Type | Description |
|---|---|
| `SessionContext` | Session context snapshot |
| `SessionListFilter` | Filter criteria for `listSessions()` |
| `SessionMetadata` | Session metadata shape (id, name, timestamps, context) |
| `ForegroundSessionInfo` | Foreground session descriptor |
| `SessionLifecycleEventType` | `'session.created' \| 'session.deleted' \| 'session.updated' \| ...` |
| `SessionLifecycleEvent` | Lifecycle event with type discriminant and metadata |
| `SessionLifecycleHandler` | `(event: SessionLifecycleEvent) => void` |
| `TypedSessionLifecycleHandler<K>` | Type-safe handler for a specific lifecycle event type |

### Session Events

| Type | Description |
|---|---|
| `SessionEvent` | Full union of all session event shapes |
| `SessionEventType` | Union of all event type strings |
| `SessionEventPayload<T>` | Extracts the payload type for a given event type string |
| `SessionEventHandler` | `(event: SessionEvent) => void` |
| `TypedSessionEventHandler<T>` | Type-safe handler for a specific session event type |
| `AssistantMessageEvent` | The `assistant.message` event shape |

### Model Introspection

| Type | Description |
|---|---|
| `ModelInfo` | Rich model descriptor (id, name, capabilities, billing, policy) |
| `ModelCapabilities` | Per-model capability flags (streaming, functions, vision, etc.) |
| `ModelBilling` | Per-model billing metadata |
| `ModelPolicy` | Per-model policy flags |

### Status

| Type | Description |
|---|---|
| `GetStatusResponse` | Return shape of `CopilotSdkWrapper.getStatus()` |
| `GetAuthStatusResponse` | Auth status shape (used in `initialize()`) |

### Message Options

| Type | Description |
|---|---|
| `MessageOptions` | Full `sendAndWait` options (prompt, images, context, timeout, etc.) |

---

## See Also

- [ROADMAP.md](../ROADMAP.md) — planned phases and backlog items
- [CONTRIBUTING.md](../CONTRIBUTING.md) — development setup, testing requirements, and commit conventions
