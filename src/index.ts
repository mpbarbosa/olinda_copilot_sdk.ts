/**
 * olinda_copilot_sdk.ts — public API
 * @module index
 */

export { CopilotClient } from './core/client.js';
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
} from './core/errors.js';

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
