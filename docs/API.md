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
| `extractDeltaContent` | `(chunk: StreamChunk) => string` | Get combined delta content from a chunk |
| `isStreamDone` | `(chunk: StreamChunk) => boolean` | Check if chunk signals end of stream |

---

## Error Classes (`src/core/errors`)

| Class | Extends | Description |
|---|---|---|
| `CopilotSDKError` | `Error` | Base error for all SDK errors |
| `AuthenticationError` | `CopilotSDKError` | Token missing or authentication failed |
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
  | 'github-cli';       // requires gh CLI from caller
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

Resolves the authentication method to use, following the SDK's six-step priority order:

1. `options.githubToken` → `{ method: 'github-token', token }`
2. HMAC key (options or `COPILOT_HMAC_KEY_*` env) → `{ method: 'hmac-key', hmacKey }`
3. `COPILOT_TOKEN` / `GITHUB_COPILOT_TOKEN` → `{ method: 'direct-api-token', token }`
4. `COPILOT_GITHUB_TOKEN` → `GH_TOKEN` → `GITHUB_TOKEN` → `{ method: 'env-token', token }`
5. `useLoggedInUser !== false` → `{ method: 'stored-oauth' }` _(caller performs I/O)_
6. Returns `null` — no auth available

Pass an explicit `env` object in tests to avoid reading from the real environment.

---

## Session Configuration — `src/core/session_config`

### `ReasoningEffort`

```typescript
type ReasoningEffort = 'low' | 'medium' | 'high';
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
| `reasoningEffort` | `ReasoningEffort` | Reasoning depth: `'low'` \| `'medium'` \| `'high'` |
| `streaming` | `boolean` | Emit real-time events. Default: `false` |
| `provider` | `BYOKProvider` | Route through a BYOK provider instead of Copilot |

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
