/**
 * olinda_copilot_sdk.ts — public API
 * @module index
 * @since 0.1.3
 */

export { CopilotClient } from './core/completions_client.js';
export type {
	ClientOptions,
	Message,
	MessageRole,
	CompletionRequest,
	CompletionResponse,
	CompletionChoice,
	StreamChunk,
	StreamChoice,
	StreamDelta,
} from './core/types.js';

export { CopilotSDKError, AuthenticationError, APIError, SystemError } from './core/errors.js';

export type {
	AzureProvider,
	OpenAIProvider,
	AnthropicProvider,
	OpenAICompatibleProvider,
	BYOKProvider,
	HmacKeyConfig,
	AuthOptions,
	AuthMethod,
	ResolvedAuth,
} from './core/auth.js';

export { isGitHubToken, resolveHmacFromEnv, resolveAuthPriority } from './core/auth.js';

export type { ReasoningEffort, SessionConfig, UserInputRequest, UserInputResponse, UserInputHandler } from './core/session_config.js';

export type {
	ToolResultObject,
	BaseHookInput,
	PreToolUseInput,
	PreToolUseOutput,
	PreToolUseHandler,
	PostToolUseInput,
	PostToolUseOutput,
	PostToolUseHandler,
	UserPromptInput,
	UserPromptOutput,
	UserPromptHandler,
	SessionStartInput,
	SessionStartOutput,
	SessionStartHandler,
	SessionEndInput,
	SessionEndOutput,
	SessionEndHandler,
	ErrorOccurredInput,
	ErrorOccurredOutput,
	ErrorOccurredHandler,
	SessionHooks,
	HooksConfig,
} from './core/hooks.js';

export { createHooks, approveAllTools, denyTools } from './core/hooks.js';

export {
	createUserMessage,
	createSystemMessage,
	createAssistantMessage,
	createFunctionMessage,
	extractContent,
	hasRole,
	filterByRole,
} from './utils/messages.js';

export { parseSSELine, parseSSEChunk, extractDeltaContent, isStreamDone } from './utils/stream.js';

export type {
	LocalMCPServer,
	RemoteMCPServer,
	MCPServerMap,
} from './core/mcp.js';

export { createLocalMCPServer, createRemoteMCPServer } from './core/mcp.js';

export type {
	SkillConfig,
	SkillSessionConfig,
} from './core/skills.js';

export { loadSkillDirectories } from './core/skills.js';

// ---------------------------------------------------------------------------
// v0.2.1 — CopilotSdkWrapper + SDK permission/input types
// ---------------------------------------------------------------------------

export {
	CopilotSdkWrapper,
} from './core/session_client.js';

export type {
	CopilotSdkWrapperOptions,
	InitializeResult,
	SendResult,
} from './core/session_client.js';

/** Re-exported from `@github/copilot-sdk` — approves all permission requests automatically. */
export { approveAll } from '@github/copilot-sdk';

export type {
	PermissionHandler,
	PermissionRequest,
	PermissionRequestResult,
} from '@github/copilot-sdk';
