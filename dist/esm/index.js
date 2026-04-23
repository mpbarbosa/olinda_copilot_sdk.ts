/**
 * olinda_copilot_sdk.ts — public API
 * @module index
 * @since 0.1.3
 */
export { CopilotClient } from './core/completions_client.js';
export { CopilotSDKError, AuthenticationError, APIError, SystemError } from './core/errors.js';
export { isGitHubToken, resolveHmacFromEnv, resolveAuthPriority } from './core/auth.js';
export { createHooks, approveAllTools, denyTools } from './core/hooks.js';
export { createUserMessage, createSystemMessage, createAssistantMessage, createFunctionMessage, extractContent, hasRole, filterByRole, } from './utils/messages.js';
export { parseSSELine, parseSSEChunk, parseSSEStream, extractDeltaContent, isStreamDone } from './utils/stream.js';
export { createLocalMCPServer, createRemoteMCPServer } from './core/mcp.js';
export { loadSkillDirectories } from './core/skills.js';
// ---------------------------------------------------------------------------
// v0.2.1 — CopilotSdkWrapper + SDK permission/input types
// ---------------------------------------------------------------------------
export { CopilotSdkWrapper, } from './core/session_client.js';
/** Re-exported from `@github/copilot-sdk` — approves all permission requests automatically. */
export { approveAll } from '@github/copilot-sdk';
export { defineTool } from './core/tools.js';
// ---------------------------------------------------------------------------
// v0.3.3 — LogValidator: token-efficient log-to-SDK validation pipeline
// ---------------------------------------------------------------------------
export { LogValidator, parseLogIssues, buildValidationPrompt, selectRelevantFiles } from './lib/log_validator.js';
// ---------------------------------------------------------------------------
// v0.4.2 — SdkSmokeTest: minimal connectivity check for the Copilot API
// ---------------------------------------------------------------------------
export { runSdkSmokeTest, buildSmokeTestPrompt, validateSmokeTestResponse, formatSmokeTestResult } from './lib/sdk_smoke_test.js';
// ---------------------------------------------------------------------------
// v0.7.0 — Claude Agent SDK Wrapper + Anthropic Messages API Client
// ---------------------------------------------------------------------------
export { ClaudeClient } from './claude/completions_client.js';
export { ClaudeSDKError, ClaudeAuthError, ClaudeAPIError } from './claude/errors.js';
export { ClaudeSdkWrapper } from './claude/sdk_wrapper.js';
