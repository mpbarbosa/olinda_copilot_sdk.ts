/**
 * Shared test fixtures and typed constants.
 * @module test/helpers/fixtures
 * @description Provides reusable test data for unit and integration tests,
 * reducing duplication and keeping individual test files focused on assertions.
 * @since 0.1.3
 */
import type { Message, StreamChunk, CompletionResponse } from '../../src/core/types';
/** A typical user message. */
export declare const USER_MESSAGE: Message;
/** A typical system prompt message. */
export declare const SYSTEM_MESSAGE: Message;
/** A typical assistant reply. */
export declare const ASSISTANT_MESSAGE: Message;
/** A function result message. */
export declare const FUNCTION_MESSAGE: Message;
/** A mixed conversation history. */
export declare const CONVERSATION: Message[];
/** A minimal non-streaming completion response. */
export declare const COMPLETION_RESPONSE: CompletionResponse;
/** A mid-stream chunk with partial content. */
export declare const STREAM_CHUNK: StreamChunk;
/** A final stream chunk signalling end of response. */
export declare const STREAM_CHUNK_DONE: StreamChunk;
/** A valid SSE data line. */
export declare const SSE_DATA_LINE: string;
/** The SSE [DONE] sentinel. */
export declare const SSE_DONE_LINE = "data: [DONE]";
/** A non-data SSE comment line. */
export declare const SSE_COMMENT_LINE = ": keep-alive";
