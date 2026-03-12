# Changelog

All notable changes to `olinda_copilot_sdk.ts` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

---

## [0.4.0] — 2026-03-12

### Added

- **`UserPromptSubmittedHandler`** type alias — aligns with `@github/copilot-sdk`'s internal
  naming for the user-prompt hook handler (`= UserPromptHandler`).
- **SDK-naming type aliases** for all six hook families:
  `PreToolUseHookInput`, `PreToolUseHookOutput`, `PostToolUseHookInput`, `PostToolUseHookOutput`,
  `UserPromptSubmittedHookInput`, `UserPromptSubmittedHookOutput`,
  `SessionStartHookInput`, `SessionStartHookOutput`, `SessionEndHookInput`, `SessionEndHookOutput`,
  `ErrorOccurredHookInput`, `ErrorOccurredHookOutput`.
  All are structurally identical to the existing `*Input`/`*Output` types.
- **`PermissionHandler`** re-exported from `src/core/hooks.ts` (previously only from SDK direct re-export).
- All new hook aliases exported from the public `index.ts` entry point.

### Changed

- **`approveAllTools()` now returns `PermissionHandler`** (breaking change from v0.3.x).
  Previously returned `PreToolUseHandler` for use in `createHooks({ onPreToolUse: approveAllTools() })`.
  Now wraps the SDK's `approveAll` constant, for use in `SessionConfig.onPermissionRequest`.
  Migration: for inline hook-based approval use `createHooks({ onPreToolUse: () => ({ permissionDecision: 'allow' }) })` instead.

### Fixed

- `PermissionHandler` is no longer exported twice (previously from both `hooks.ts` and the `@github/copilot-sdk` direct re-export block in `index.ts`).

---

## [0.3.3]

### Added

- `LogValidator`, `parseLogIssues`, `buildValidationPrompt`, `selectRelevantFiles` — token-efficient
  log-to-SDK validation pipeline (`src/lib/log_validator.ts`).
- `LogIssue`, `CodeSnippet`, `LogValidatorOptions`, `IssueSeverity` — companion types.

### Fixed

- `test/lib/` was missing from `testPathPattern` in all test scripts — `log_validator.test.ts` now runs.
- Cleanup `setTimeout` in `session_client.ts` is now `.unref()`'d to prevent intermittent worker force-exit.
- Broken ROADMAP.md ToC anchor `#milestone-v031--` corrected to `#milestone-v032--`.

---

## [0.2.1] — 2026-03-12

### Added

- `CopilotSdkWrapper` — first-class public export (previously internal-only)
  - `initialize()` — start client, authenticate, fetch models, create session
  - `send(prompt, timeoutMs?)` — serialised send with full response
  - `sendStream(prompt, onDelta, timeoutMs?)` — streaming send with per-delta callback
  - `abort()` — abort in-flight request
  - `recreateSession()` — destroy + restart + fresh session
  - `cleanup()` — graceful shutdown with forceStop fallback
  - `CopilotSdkWrapper.isAvailable()` — static availability check
- `CopilotSdkWrapperOptions`, `InitializeResult`, `SendResult` — companion types
- `approveAll` — re-exported from `@github/copilot-sdk` for convenient default use
- `PermissionHandler`, `PermissionRequest`, `PermissionRequestResult` — re-exported from `@github/copilot-sdk`
- `UserInputHandler`, `UserInputRequest`, `UserInputResponse` — new types for `ask_user` handler support
- `SessionConfig.onPermissionRequest` — optional permission handler (defaults to `approveAll` in wrapper)
- `SessionConfig.onUserInputRequest` — optional handler for `ask_user` tool invocations
- `ReasoningEffort` now includes `'xhigh'` variant

---

---

## [0.1.3] — 2026-03-12

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
- `package.json` — v0.1.3, build/test/lint scripts, `engines: node>=18, npm>=9`
- `tsconfig.json` — CJS build → `dist/`
- `tsconfig.esm.json` — ESM build → `dist/esm/`
- `jest.config.js` — ts-jest, 80% coverage thresholds
- `eslint.config.js` — `@typescript-eslint` rules, complexity gate ≤ 10
- `docs/API.md` — public API reference
- `.github/workflows/ci.yml` — CI pipeline (type-check, lint, test on Node 18/20/22)
- `.github/dependabot.yml` — automated dependency updates
- `.github/copilot-instructions.md` — Copilot coding guidelines
