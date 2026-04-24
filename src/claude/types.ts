/**
 * TypeScript Types for Anthropic Messages API
 * @module claude/types
 * @description Core TypeScript interfaces and types for the Anthropic Messages API.
 * @since 0.9.1
 */

/**
 * Configuration options for {@link ClaudeClient}.
 * @since 0.9.1
 * @example
 * const client = new ClaudeClient({ apiKey: process.env.ANTHROPIC_API_KEY! });
 */
export interface ClaudeClientOptions {
	/** Anthropic API key. Required. */
	apiKey: string;
	/** Base URL for the Anthropic API. Default: `'https://api.anthropic.com'`. */
	baseUrl?: string;
	/** Default model to use for completions. Default: `'claude-sonnet-4-5'`. */
	model?: string;
	/** Anthropic API version header value. Default: `'2023-06-01'`. */
	apiVersion?: string;
}

/**
 * Role of a message participant in the Anthropic Messages API.
 * Note: system prompts are passed as a separate `system` field in the request body,
 * not as messages.
 * @since 0.9.1
 */
export type ClaudeMessageRole = 'user' | 'assistant';

/**
 * A single message in an Anthropic conversation.
 * @since 0.9.1
 * @example
 * const msg: ClaudeMessage = { role: 'user', content: 'Hello!' };
 */
export interface ClaudeMessage {
	/** The role of the message author. */
	role: ClaudeMessageRole;
	/** The text content of the message. */
	content: string;
}

/**
 * Request body for the Anthropic Messages endpoint.
 * @since 0.9.1
 */
export interface ClaudeCompletionRequest {
	/** Model identifier (e.g. `'claude-sonnet-4-5'`). */
	model?: string;
	/** Conversation history. */
	messages: ClaudeMessage[];
	/**
	 * Maximum number of tokens to generate. Required by the Anthropic API.
	 * Default applied by {@link ClaudeClient}: `4096`.
	 */
	max_tokens: number;
	/** Optional system prompt, passed at the request body level (not inside messages). */
	system?: string;
	/** Whether to stream the response as Server-Sent Events. Default: `false`. */
	stream?: boolean;
	/** Sampling temperature in range [0, 1]. */
	temperature?: number;
}

/**
 * A text content block in an Anthropic completion response.
 * @since 0.9.1
 */
export interface ClaudeContentBlock {
	type: 'text';
	/** The generated text. */
	text: string;
}

/**
 * Token usage statistics from an Anthropic completion.
 * @since 0.9.1
 */
export interface ClaudeUsage {
	/** Number of tokens in the input (prompt). */
	input_tokens: number;
	/** Number of tokens in the output (completion). */
	output_tokens: number;
}

/**
 * Full non-streaming completion response from the Anthropic Messages API.
 * @since 0.9.1
 */
export interface ClaudeCompletionResponse {
	/** Unique identifier for this completion. */
	id: string;
	/** Object type (`'message'`). */
	type: 'message';
	/** Always `'assistant'` for completions. */
	role: 'assistant';
	/** One or more content blocks in the response. */
	content: ClaudeContentBlock[];
	/** Model used to generate the response. */
	model: string;
	/** Reason the model stopped generating (e.g. `'end_turn'`). */
	stop_reason: string | null;
	/** Token usage for this completion. */
	usage: ClaudeUsage;
}

/**
 * Discriminated union of SSE event types emitted by the Anthropic streaming API.
 * @since 0.9.1
 */
export type ClaudeStreamEventType =
	| 'message_start'
	| 'content_block_start'
	| 'content_block_delta'
	| 'content_block_stop'
	| 'message_delta'
	| 'message_stop'
	| 'error';

/**
 * A single SSE event from the Anthropic streaming Messages API.
 * Use {@link ClaudeTextDeltaEvent} for the typed subtype that carries text.
 * @since 0.9.1
 */
export interface ClaudeStreamEvent {
	/** The event type, from the `event:` SSE header line. */
	type: ClaudeStreamEventType;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

/**
 * A `content_block_delta` SSE event carrying an incremental text chunk.
 * @since 0.9.1
 * @example
 * if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
 *   process.stdout.write(event.delta.text);
 * }
 */
export interface ClaudeTextDeltaEvent extends ClaudeStreamEvent {
	type: 'content_block_delta';
	/** Zero-based index of the content block being updated. */
	index: number;
	delta: {
		type: 'text_delta';
		/** Incremental text chunk. */
		text: string;
	};
}
