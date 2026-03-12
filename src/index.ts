/**
 * olinda_copilot_sdk.ts — public API
 * @module index
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

export {
	CopilotSDKError,
	AuthenticationError,
	APIError,
	SystemError,
} from './core/errors.js';

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

export {
	isGitHubToken,
	resolveHmacFromEnv,
	resolveAuthPriority,
} from './core/auth.js';

export type { ReasoningEffort, SessionConfig } from './core/session_config.js';

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

export {
	parseSSELine,
	parseSSEChunk,
	extractDeltaContent,
	isStreamDone,
} from './utils/stream.js';
