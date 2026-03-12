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
