/**
 * olinda_copilot_sdk.ts — public API
 * @module index
 */
export { CopilotClient } from './core/completions_client.js';
export { CopilotSDKError, AuthenticationError, APIError, SystemError } from './core/errors.js';
export { isGitHubToken, resolveHmacFromEnv, resolveAuthPriority } from './core/auth.js';
export { createHooks, approveAllTools, denyTools } from './core/hooks.js';
export { createUserMessage, createSystemMessage, createAssistantMessage, createFunctionMessage, extractContent, hasRole, filterByRole, } from './utils/messages.js';
export { parseSSELine, parseSSEChunk, extractDeltaContent, isStreamDone } from './utils/stream.js';
export { createLocalMCPServer, createRemoteMCPServer } from './core/mcp.js';
export { loadSkillDirectories } from './core/skills.js';
