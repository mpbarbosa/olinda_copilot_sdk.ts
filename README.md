# olinda_copilot_sdk.ts

TypeScript Wrapper Library for GitHub Copilot SDK — typed abstractions for the
Copilot chat completions API, SSE stream parsing, and message construction utilities.

## Installation

**npm (local development):**

```bash
npm install
npm run build
```

## Usage

```typescript
import {
  CopilotClient,
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
```

## API

See [docs/API.md](./docs/API.md) for the full reference.

| Module | Description |
|---|---|
| `CopilotClient` | HTTP client wrapping the Copilot completions API |
| `createUserMessage` etc. | Pure message factory functions |
| `parseSSELine` etc. | Pure SSE stream parsing utilities |
| `CopilotSDKError` etc. | Typed error hierarchy |

## Development

```bash
npm test          # run test suite with coverage
npm run lint      # ESLint
npm run validate  # TypeScript type-check only (no emit)
npm run build     # compile TypeScript → dist/
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Project Structure

```
olinda_copilot_sdk.ts/
├── src/           # TypeScript source
│   ├── core/      # CopilotClient, types, errors
│   └── utils/     # message and stream utilities
├── test/          # Jest test suite
├── docs/          # API reference
└── .github/       # CI workflow and Copilot instructions
```

## License

MIT — see [LICENSE](./LICENSE).
