/**
 * SSE Stream Utility Functions
 * @module utils/stream
 * @description Pure utility functions for parsing GitHub Copilot Server-Sent Events (SSE) streams.
 * All functions are referentially transparent — no side effects, deterministic output.
 * @since 0.1.3
 */
import type { StreamChunk } from '../core/types.js';
/**
 * Parse a `ReadableStream` of SSE bytes into an async generator of {@link StreamChunk} objects.
 * Handles UTF-8 decoding, line buffering, and `[DONE]` sentinel detection internally.
 * Releases the stream reader lock on completion or error (via `finally`).
 * @param body - The readable byte stream from a `fetch` response body.
 * @returns Async generator yielding parsed {@link StreamChunk} objects until `[DONE]`.
 * @since 0.4.2
 * @example
 * const response = await fetch(url, options);
 * if (response.body) {
 *   for await (const chunk of parseSSEStream(response.body)) {
 *     process.stdout.write(extractDeltaContent(chunk));
 *   }
 * }
 */
export declare function parseSSEStream(body: ReadableStream<Uint8Array>): AsyncGenerator<StreamChunk>;
/**
 * Parse a single SSE line, returning the `data` payload or `null`.
 * Returns `null` for `[DONE]` sentinel and non-data lines.
 * @param line - A single line from an SSE stream.
 * @returns The raw data string, or `null` when the line should be skipped.
 * @since 0.1.3
 * @example
 * parseSSELine('data: {"id":"1"}') // '{"id":"1"}'
 * parseSSELine('data: [DONE]')     // null
 * parseSSELine(':comment')         // null
 */
export declare function parseSSELine(line: string): string | null;
/**
 * Parse a full SSE data line into a typed {@link StreamChunk}.
 * @param line - A single SSE line (e.g. `'data: {...}'`).
 * @returns Parsed {@link StreamChunk}, or `null` for sentinel / malformed lines.
 * @since 0.1.3
 * @example
 * const chunk = parseSSEChunk('data: {"id":"1","choices":[...]}');
 */
export declare function parseSSEChunk(line: string): StreamChunk | null;
/**
 * Extract the combined delta content from all choices in a stream chunk.
 * Empty or undefined deltas are treated as empty strings.
 * @param chunk - A parsed {@link StreamChunk}.
 * @returns Concatenated content from all choices in this chunk.
 * @since 0.1.3
 * @example
 * extractDeltaContent(chunk) // 'Hello'
 */
export declare function extractDeltaContent(chunk: StreamChunk): string;
/**
 * Check whether a stream chunk signals the end of the response.
 * A chunk is considered final when at least one choice has a non-null `finish_reason`.
 * @param chunk - A parsed {@link StreamChunk}.
 * @returns `true` when the stream is finished.
 * @since 0.1.3
 * @example
 * isStreamDone(chunk) // true when chunk.choices[0].finish_reason === 'stop'
 */
export declare function isStreamDone(chunk: StreamChunk): boolean;
