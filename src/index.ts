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
