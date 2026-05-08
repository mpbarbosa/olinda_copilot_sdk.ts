# Getting Started — olinda_copilot_sdk.ts

This guide walks through installing the library, configuring your environment, and sending your first requests using both the REST completions client and the CLI-session client.

---

## Prerequisites

- **Node.js ≥ 18** — required for native `fetch` support
- **npm ≥ 9**
- **GitHub Copilot license** — Individual, Business, or Enterprise
- **GitHub CLI (`gh`)** — required only if you use `CopilotSdkWrapper` (CLI session client)
  - Install: <https://cli.github.com>
  - Authenticate: `gh auth login`

---

## Installation

The package is distributed as a GitHub repository dependency, not via the npm registry.

```bash
npm install github:mpbarbosa/olinda_copilot_sdk.ts
```

> **Why `github:` and not a registry tarball?**
> npm resolves `github:` shorthands by cloning the repository and running the `prepare`
> lifecycle script, which compiles the TypeScript source into `dist/`. Downloading the
> raw GitHub archive tarball bypasses `prepare` and produces a broken install.
> Always use the `github:` shorthand.

---

## Environment Setup

### REST completions client (`CopilotClient`)

Requires a GitHub token with Copilot access. The token can be:

- A personal access token (PAT) with `copilot` scope
- A GitHub Actions `GITHUB_TOKEN` in a Copilot-enabled organisation

```bash
export GITHUB_TOKEN="ghp_..."
```

### CLI session client (`CopilotSdkWrapper`)

Requires the `gh` CLI to be installed and authenticated:

```bash
gh auth login
gh auth status   # verify authentication
```

The SDK spawns a `gh copilot` process internally; no additional token configuration is needed.

---

## Quick Start

### Non-streaming completion

```typescript
import { CopilotClient, createSystemMessage, createUserMessage } from 'olinda_copilot_sdk.ts';

const client = new CopilotClient({ token: process.env.GITHUB_TOKEN! });

const response = await client.complete([
  createSystemMessage('You are a helpful assistant.'),
  createUserMessage('What is the capital of France?'),
]);

console.log(response.choices[0].message.content);
// → "The capital of France is Paris."
```

### Streaming completion (text generator)

```typescript
import { CopilotClient, createUserMessage } from 'olinda_copilot_sdk.ts';

const client = new CopilotClient({ token: process.env.GITHUB_TOKEN! });

for await (const text of client.streamText([createUserMessage('Tell me a short joke')])) {
  process.stdout.write(text);
}
process.stdout.write('\n');
```

### Streaming completion (raw chunks)

```typescript
import { CopilotClient, createUserMessage } from 'olinda_copilot_sdk.ts';

const client = new CopilotClient({ token: process.env.GITHUB_TOKEN! });

for await (const chunk of client.stream([createUserMessage('Hello')])) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) process.stdout.write(delta);
}
```

---

## Session Client (CLI-based)

`CopilotSdkWrapper` manages a persistent `gh copilot` CLI session for agentic workflows.

### Starting a session

```typescript
import { CopilotSdkWrapper, approveAll, createUserMessage } from 'olinda_copilot_sdk.ts';

const wrapper = new CopilotSdkWrapper({ permissionHandler: approveAll });
await wrapper.startSession();

const response = await wrapper.complete([
  createUserMessage('List the files in the current directory.'),
]);
console.log(response.choices[0].message.content);

await wrapper.endSession();
```

### Resuming a previous session

```typescript
const lastSessionId = wrapper.getLastSessionId();
if (lastSessionId) {
  await wrapper.resumeSession(lastSessionId);
}
```

### Listing and deleting sessions

```typescript
const sessions = await wrapper.listSessions();
console.log(sessions);

await wrapper.deleteSession(sessions[0].id);
```

### Health and status checks

```typescript
const alive = await wrapper.ping();
const status = await wrapper.getStatus();
const state = await wrapper.getState();
```

---

## Error Handling

All errors are instances of `CopilotSDKError` subclasses:

```typescript
import {
  CopilotClient,
  createUserMessage,
  AuthenticationError,
  APIError,
  SystemError,
} from 'olinda_copilot_sdk.ts';

try {
  const client = new CopilotClient({ token: '' });  // throws AuthenticationError
  await client.complete([createUserMessage('Hello')]);
} catch (err) {
  if (err instanceof AuthenticationError) {
    console.error('Invalid token:', err.message);
  } else if (err instanceof APIError) {
    console.error('API error:', err.message, err.statusCode);
  } else if (err instanceof SystemError) {
    console.error('Network error:', err.message);
  }
}
```

---

## TypeScript

The library ships full type declarations in `dist/types/`. No additional `@types` package is required.

Import types directly from the main entry point:

```typescript
import type {
  Message,
  CompletionResponse,
  StreamChunk,
  ClientOptions,
  SessionContext,
  ModelInfo,
} from 'olinda_copilot_sdk.ts';
```

---

## Next Steps

- See [API Reference](./API.md) for complete method signatures and options
- See [Architecture](./ARCHITECTURE.md) for an overview of the internal module structure
- See the [CHANGELOG](../CHANGELOG.md) for version history
