/**
 * TypeScript Types for GitHub Copilot SDK
 * @module core/types
 * @description Core TypeScript interfaces and types for the GitHub Copilot API.
 * @since 0.1.2
 */

/**
 * Role of a chat message participant.
 * @since 0.1.2
 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'function';

/**
 * A single chat message in a conversation.
 * @since 0.1.2
 * @example
 * const msg: Message = { role: 'user', content: 'Hello!' };
 */
export interface Message {
	/** The role of the message author. */
	role: MessageRole;
	/** The content of the message. */
	content: string;
	/** Optional name of the function (used with `role: 'function'`). */
	name?: string;
}

/**
 * Request body for the Copilot completions endpoint.
 * @since 0.1.2
 */
export interface CompletionRequest {
	/** Conversation history to send to the model. */
	messages: Message[];
	/** Model identifier (e.g. `'gpt-4o'`). */
	model?: string;
	/** Whether to stream the response as Server-Sent Events. Default: `false`. */
	stream?: boolean;
	/** Sampling temperature in range [0, 2]. Default: `1`. */
	temperature?: number;
	/** Maximum number of tokens to generate. */
	max_tokens?: number;
}

/**
 * A single choice in a non-streaming completion response.
 * @since 0.1.2
 */
export interface CompletionChoice {
	/** Zero-based index of this choice. */
	index: number;
	/** The generated message. */
	message: Message;
	/** Reason the model stopped generating. */
	finish_reason: string | null;
}

/**
 * Full non-streaming completion response from the Copilot API.
 * @since 0.1.2
 */
export interface CompletionResponse {
	/** Unique identifier for this completion. */
	id: string;
	/** Object type (`'chat.completion'`). */
	object: string;
	/** Unix timestamp of when this completion was created. */
	created: number;
	/** Model used to generate the response. */
	model: string;
	/** One or more completion choices. */
	choices: CompletionChoice[];
}

/**
 * A delta (partial update) within a streaming response chunk.
 * @since 0.1.2
 */
export interface StreamDelta {
	/** Role, present only in the first chunk. */
	role?: MessageRole;
	/** Partial content token(s). */
	content?: string;
}

/**
 * A single choice within a streaming response chunk.
 * @since 0.1.2
 */
export interface StreamChoice {
	/** Zero-based index of this choice. */
	index: number;
	/** Partial content update. */
	delta: StreamDelta;
	/** Non-null only in the final chunk. */
	finish_reason: string | null;
}

/**
 * A single Server-Sent Events chunk from a streaming completion.
 * @since 0.1.2
 */
export interface StreamChunk {
	/** Unique identifier for this completion stream. */
	id: string;
	/** Object type (`'chat.completion.chunk'`). */
	object: string;
	/** Unix timestamp of when this chunk was created. */
	created: number;
	/** Model used to generate the response. */
	model: string;
	/** Partial completion choices in this chunk. */
	choices: StreamChoice[];
}

/**
 * Configuration options for {@link CopilotClient}.
 * @since 0.1.2
 */
export interface ClientOptions {
	/** GitHub token used to authenticate with the Copilot API. */
	token: string;
	/** Base URL for the Copilot API. Default: `'https://api.githubcopilot.com'`. */
	baseUrl?: string;
	/** Default model to use for completions. Default: `'gpt-4o'`. */
	model?: string;
}
