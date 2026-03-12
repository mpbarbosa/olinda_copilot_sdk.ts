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
export { parseSSELine, parseSSEChunk, extractDeltaContent, isStreamDone } from './utils/stream.js';
export { createLocalMCPServer, createRemoteMCPServer } from './core/mcp.js';
export { loadSkillDirectories } from './core/skills.js';
// ---------------------------------------------------------------------------
// v0.2.1 — CopilotSdkWrapper + SDK permission/input types
// ---------------------------------------------------------------------------
export { CopilotSdkWrapper, } from './core/session_client.js';
/** Re-exported from `@github/copilot-sdk` — approves all permission requests automatically. */
export { approveAll } from '@github/copilot-sdk';
export { defineTool } from './core/tools.js';
