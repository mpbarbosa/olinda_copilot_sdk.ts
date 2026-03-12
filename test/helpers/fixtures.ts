/**
 * Shared test fixtures and typed constants.
 * @module test/helpers/fixtures
 * @description Provides reusable test data for unit and integration tests,
 * reducing duplication and keeping individual test files focused on assertions.
 * @since 0.1.0
 */

import type { Message, StreamChunk, CompletionResponse } from '../../src/core/types';

// ─── Message fixtures ─────────────────────────────────────────────────────────

/** A typical user message. */
export const USER_MESSAGE: Message = { role: 'user', content: 'Hello!' };

/** A typical system prompt message. */
export const SYSTEM_MESSAGE: Message = {
	role: 'system',
	content: 'You are a helpful assistant.',
};

/** A typical assistant reply. */
export const ASSISTANT_MESSAGE: Message = {
	role: 'assistant',
	content: 'How can I help you?',
};

/** A function result message. */
export const FUNCTION_MESSAGE: Message = {
	role: 'function',
	name: 'getWeather',
	content: '{"temp":22}',
};

/** A mixed conversation history. */
export const CONVERSATION: Message[] = [
	SYSTEM_MESSAGE,
	USER_MESSAGE,
	ASSISTANT_MESSAGE,
];

// ─── Completion response fixtures ─────────────────────────────────────────────

/** A minimal non-streaming completion response. */
export const COMPLETION_RESPONSE: CompletionResponse = {
	id: 'chatcmpl-abc123',
	object: 'chat.completion',
	created: 1700000000,
	model: 'gpt-4o',
	choices: [
		{
			index: 0,
			message: ASSISTANT_MESSAGE,
			finish_reason: 'stop',
		},
	],
};

// ─── Stream chunk fixtures ─────────────────────────────────────────────────────

/** A mid-stream chunk with partial content. */
export const STREAM_CHUNK: StreamChunk = {
	id: 'chatcmpl-abc123',
	object: 'chat.completion.chunk',
	created: 1700000000,
	model: 'gpt-4o',
	choices: [
		{
			index: 0,
			delta: { content: 'Hello' },
			finish_reason: null,
		},
	],
};

/** A final stream chunk signalling end of response. */
export const STREAM_CHUNK_DONE: StreamChunk = {
	id: 'chatcmpl-abc123',
	object: 'chat.completion.chunk',
	created: 1700000000,
	model: 'gpt-4o',
	choices: [
		{
			index: 0,
			delta: {},
			finish_reason: 'stop',
		},
	],
};

// ─── SSE line fixtures ────────────────────────────────────────────────────────

/** A valid SSE data line. */
export const SSE_DATA_LINE = `data: ${JSON.stringify(STREAM_CHUNK)}`;

/** The SSE [DONE] sentinel. */
export const SSE_DONE_LINE = 'data: [DONE]';

/** A non-data SSE comment line. */
export const SSE_COMMENT_LINE = ': keep-alive';
