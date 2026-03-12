# Changelog

All notable changes to `olinda_copilot_sdk.ts` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

---

## [0.1.2] — 2026-03-12

### Added

- `src/core/types.ts` — TypeScript interfaces for the GitHub Copilot API
  - `Message`, `MessageRole`, `CompletionRequest`, `CompletionResponse`, `CompletionChoice`
  - `StreamChunk`, `StreamChoice`, `StreamDelta`, `ClientOptions`
- `src/core/errors.ts` — custom error hierarchy
  - `CopilotSDKError` (base), `AuthenticationError`, `APIError`
- `src/core/client.ts` — `CopilotClient` class wrapping the Copilot completions API
  - `complete()` — non-streaming chat completions
  - `stream()` — async generator for SSE streaming completions
- `src/utils/messages.ts` — pure message factory functions
  - `createUserMessage`, `createSystemMessage`, `createAssistantMessage`, `createFunctionMessage`
  - `extractContent`, `hasRole`, `filterByRole`
- `src/utils/stream.ts` — pure SSE parsing utilities
  - `parseSSELine`, `parseSSEChunk`, `extractDeltaContent`, `isStreamDone`
- `src/index.ts` — public barrel export
- `package.json` — v0.1.2, build/test/lint scripts, `engines: node>=18, npm>=9`
- `tsconfig.json` — CJS build → `dist/`
- `tsconfig.esm.json` — ESM build → `dist/esm/`
- `jest.config.js` — ts-jest, 80% coverage thresholds
- `eslint.config.js` — `@typescript-eslint` rules, complexity gate ≤ 10
- `docs/API.md` — public API reference
- `.github/workflows/ci.yml` — CI pipeline (type-check, lint, test on Node 18/20/22)
- `.github/dependabot.yml` — automated dependency updates
- `.github/copilot-instructions.md` — Copilot coding guidelines
