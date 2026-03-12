# olinda_copilot_sdk.ts

TypeScript Wrapper Library for GitHub Copilot SDK — typed abstractions for the
Copilot chat completions API, SSE stream parsing, and message construction utilities.

## Installation

**GitHub dependency** (only supported install method):

```bash
npm install github:mpbarbosa/olinda_copilot_sdk.ts#v0.3.2
```

> **Why `github:` and not a CDN tarball?**
> The `dist/` committed at the v0.3.2 tag is **incomplete** — `tools.js` and the
> `sendStream` method are absent from the archived snapshot.
> When npm resolves a `github:` shorthand it clones the repository, installs all
> dependencies (including `devDependencies`), and runs the `prepare` lifecycle
> script (`npm run build && npm run build:esm`), which compiles the full TypeScript
> source and produces the correct `dist/` tree.
> Downloading the raw GitHub archive tarball
> (`https://github.com/…/archive/refs/tags/v0.3.2.tar.gz`) or installing via an
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

// Streaming completion
for await (const chunk of client.stream([createUserMessage('Tell me a joke')])) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
}

// Session-based wrapper (CLI process, tools, MCP)
const wrapper = new CopilotSdkWrapper({ token: process.env.GITHUB_TOKEN!, onPermissionRequest: approveAll });
await wrapper.initialize();
const result = await wrapper.send('Summarize this repo');
console.log(result.choices[0].message.content);
await wrapper.cleanup();
```

## API

See [docs/API.md](./docs/API.md) for the full reference.

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
# CDN delivery only (no npm publish)
bash scripts/deploy.sh

# Full publish (CDN + npm registry)
NPM_TOKEN=npm_... bash scripts/deploy.sh
```

The script guards against a dirty working tree and failing tests before proceeding.

## Project Structure

```text
olinda_copilot_sdk.ts/
├── src/                # TypeScript source
│   ├── core/           # CopilotClient, types, errors
│   └── utils/          # message and stream utilities
├── test/               # Jest test suite
│   └── __stubs__/      # shared test fixtures and typed constants
├── scripts/            # automation scripts (deploy.sh)
├── docs/               # API reference
└── .github/            # CI/CD workflows and Copilot instructions
    └── workflows/      # GitHub Actions workflow definitions
```

## License

MIT — see [LICENSE](./LICENSE).
