## README

# olinda_copilot_sdk.ts

TypeScript Wrapper Library for GitHub Copilot SDK — typed abstractions for the
Copilot chat completions API, SSE stream parsing, and message construction utilities.

## Installation

**GitHub dependency** (only supported install method):

```bash
npm install github:mpbarbosa/olinda_copilot_sdk.ts
```

> **Why `github:` and not a CDN tarball?**
> When npm resolves a `github:` shorthand it clones the repository, installs all
> dependencies (including `devDependencies`), and runs the `prepare` lifecycle
> script (`npm run build && npm run build:esm`), which compiles the full TypeScript
> source and produces the correct `dist/` tree.
> Downloading the raw GitHub archive tarball
> (`https://github.com/…/archive/refs/heads/main.tar.gz`) or installing via an
> npm-registry-style tarball URL bypasses `prepare` entirely and will give you a
> broken package — **always use the `github:` shorthand**.

**Local development:**

```bash
git clone https://github.com/mpbarbosa/olinda_copilot_sdk.ts.git
cd olinda_copilot_sdk.ts
npm install
npm run build        # compile TypeScript → dist/ (CJS + types)
npm run build:esm    # compile TypeScript → dist/esm/ (ESM)
```

## Usage

```typescript
import {
  CopilotClient,
  CopilotSdkWrapper,
  approveAll,
  createUserMessage,
  createSystemMessage,
} from 'olinda_copilot_sdk.ts';

const client = new CopilotClient({ token: process.env.GITHUB_TOKEN! });

// Non-streaming completion
const res = await client.complete([
  createSystemMessage('You are a helpful assistant.'),
  createUserMessage('Hello!'),
]);
console.log(res.choices[0].message.content);

// Streaming completion (raw chunks)
for await (const chunk of client.stream([createUserMessage('Tell me a joke')])) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
}

// Streaming completion (text-only convenience generator)
for await (const text of client.streamText([createUserMessage('Tell me a joke')])) {
  process.stdout.write(text);
}

// Session-based wrapper (CLI process, tools, MCP)
const wrapper = new CopilotSdkWrapper({ token: process.env.GITHUB_TOKEN!, onPermissionRequest: approveAll });
await wrapper.initialize();
const result = await wrapper.send('Summarize this repo');
console.log(result.choices[0].message.content);

// Session management (v0.5.3+)
const sessionId = await wrapper.getLastSessionId();
const sessions = await wrapper.listSessions();
const status = await wrapper.getStatus();
const state = wrapper.getState();
await wrapper.cleanup();
```

## API

See [docs/API.md](./docs/API.md) for the full reference.

Additional design guidance:

- [docs/HIGH_COHESION_GUIDE.md](./docs/HIGH_COHESION_GUIDE.md)
- [docs/LOW_COUPLING_GUIDE.md](./docs/LOW_COUPLING_GUIDE.md)

| Module | Description |
|---|---|
| `CopilotClient` | HTTP client wrapping the Copilot completions API |
| `CopilotSdkWrapper` | Session-based wrapper for CLI-process completions (tools, MCP, skills) |
| `approveAll` | Default permission handler — approves all tool requests automatically |
| `createUserMessage` etc. | Pure message factory functions |
| `parseSSELine` etc. | Pure SSE stream parsing utilities |
| `CopilotSDKError` etc. | Typed error hierarchy (`AuthenticationError`, `SystemError`, `APIError`) |
| `resolveAuthPriority` etc. | Auth strategy utilities (`isGitHubToken`, `resolveHmacFromEnv`) |
| `createHooks` etc. | Session hook factory and helpers (`approveAllTools`, `denyTools`) |
| `SessionConfig` | Session configuration interface with full SDK option surface |

## Development

```bash
npm test          # run test suite with coverage
npm run lint      # ESLint
npm run validate  # TypeScript type-check only (no emit)
npm run build     # compile TypeScript → dist/
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

### Deployment

`scripts/deploy.sh` builds the project, runs tests, and publishes to npm (CDN delivery via git tag always runs; npm publish requires `NPM_TOKEN`).

```bash
# CDN delivery only

---

## GETTING_STARTED

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

`