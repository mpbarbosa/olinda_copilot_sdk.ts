"use strict";
/**
 * Shared test fixtures and typed constants.
 * @module test/helpers/fixtures
 * @description Provides reusable test data for unit and integration tests,
 * reducing duplication and keeping individual test files focused on assertions.
 * @since 0.1.3
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSE_COMMENT_LINE = exports.SSE_DONE_LINE = exports.SSE_DATA_LINE = exports.STREAM_CHUNK_DONE = exports.STREAM_CHUNK = exports.COMPLETION_RESPONSE = exports.CONVERSATION = exports.FUNCTION_MESSAGE = exports.ASSISTANT_MESSAGE = exports.SYSTEM_MESSAGE = exports.USER_MESSAGE = void 0;
// ─── Message fixtures ─────────────────────────────────────────────────────────
/** A typical user message. */
exports.USER_MESSAGE = { role: 'user', content: 'Hello!' };
/** A typical system prompt message. */
exports.SYSTEM_MESSAGE = {
    role: 'system',
    content: 'You are a helpful assistant.',
};
/** A typical assistant reply. */
exports.ASSISTANT_MESSAGE = {
    role: 'assistant',
    content: 'How can I help you?',
};
/** A function result message. */
exports.FUNCTION_MESSAGE = {
    role: 'function',
    name: 'getWeather',
    content: '{"temp":22}',
};
/** A mixed conversation history. */
exports.CONVERSATION = [
    exports.SYSTEM_MESSAGE,
    exports.USER_MESSAGE,
    exports.ASSISTANT_MESSAGE,
];
// ─── Completion response fixtures ─────────────────────────────────────────────
/** A minimal non-streaming completion response. */
exports.COMPLETION_RESPONSE = {
    id: 'chatcmpl-abc123',
    object: 'chat.completion',
    created: 1700000000,
    model: 'gpt-4o',
    choices: [
        {
            index: 0,
            message: exports.ASSISTANT_MESSAGE,
            finish_reason: 'stop',
        },
    ],
};
// ─── Stream chunk fixtures ─────────────────────────────────────────────────────
/** A mid-stream chunk with partial content. */
exports.STREAM_CHUNK = {
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
exports.STREAM_CHUNK_DONE = {
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
exports.SSE_DATA_LINE = `data: ${JSON.stringify(exports.STREAM_CHUNK)}`;
/** The SSE [DONE] sentinel. */
exports.SSE_DONE_LINE = 'data: [DONE]';
/** A non-data SSE comment line. */
exports.SSE_COMMENT_LINE = ': keep-alive';
