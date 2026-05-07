/**
 * Claude API Client
 * @module claude/completions_client
 * @description Stateless HTTP client for the Anthropic Messages API.
 * Wraps native `fetch` (available in Node.js ≥ 18) and provides typed request/response
 * helpers for both non-streaming and streaming completions.
 *
 * Note: Anthropic's SSE format differs from OpenAI's — events use `event:`+`data:` pairs
 * rather than bare `data:` lines, so the existing `parseSSEStream` utility is not used here.
 * @since 0.9.1
 */
import type { ClaudeClientOptions, ClaudeCompletionRequest, ClaudeCompletionResponse, ClaudeMessage, ClaudeStreamEvent } from './types.js';
/**
 * Stateless HTTP client for the Anthropic Messages API.
 * @since 0.9.1
 * @example
 * const client = new ClaudeClient({ apiKey: process.env.ANTHROPIC_API_KEY! });
 * const res = await client.complete([{ role: 'user', content: 'Hello!' }]);
 * console.log(res.content[0].text);
 */
export declare class ClaudeClient {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly model;
    private readonly apiVersion;
    /**
     * Create a new ClaudeClient.
     * @param options - Client configuration.
     * @throws {ClaudeAuthError} When `options.apiKey` is empty or missing.
     */
    constructor(options: ClaudeClientOptions);
    /**
     * Send a non-streaming chat completion request.
     * @param messages - Conversation history (user/assistant turns).
     * @param options - Optional overrides for the request body (e.g. `system`, `temperature`).
     * @returns Resolved completion response.
     * @throws {ClaudeAuthError} On HTTP 401.
     * @throws {ClaudeAPIError} On any other non-2xx HTTP response.
     * @since 0.9.1
     * @example
     * const res = await client.complete([{ role: 'user', content: 'Hi' }]);
     * console.log(res.content[0].text);
     */
    complete(messages: ClaudeMessage[], options?: Partial<Omit<ClaudeCompletionRequest, 'messages' | 'stream'>>): Promise<ClaudeCompletionResponse>;
    /**
     * Send a streaming chat completion request and return an async iterator of SSE events.
     *
     * Anthropic's SSE format uses `event:`+`data:` line pairs. Each yielded value is a
     * parsed {@link ClaudeStreamEvent}. Iteration stops automatically at the `message_stop`
     * event.
     *
     * @param messages - Conversation history (user/assistant turns).
     * @param options - Optional overrides for the request body.
     * @returns Async iterable of stream events.
     * @throws {ClaudeAuthError} On HTTP 401.
     * @throws {ClaudeAPIError} On any other non-2xx HTTP response.
     * @since 0.9.1
     * @example
     * for await (const event of client.stream([{ role: 'user', content: 'Hi' }])) {
     *   if (event.type === 'content_block_delta') {
     *     process.stdout.write(event.delta?.text ?? '');
     *   }
     * }
     */
    stream(messages: ClaudeMessage[], options?: Partial<Omit<ClaudeCompletionRequest, 'messages' | 'stream'>>): AsyncGenerator<ClaudeStreamEvent>;
    /**
     * Send a streaming chat completion request and yield text delta strings directly.
     * Filters the SSE stream for `content_block_delta` events of type `text_delta` and
     * yields each incremental text chunk.
     * @param messages - Conversation history (user/assistant turns).
     * @param options - Optional overrides for the request body.
     * @returns Async iterable of text strings.
     * @throws {ClaudeAuthError} On HTTP 401.
     * @throws {ClaudeAPIError} On any other non-2xx HTTP response.
     * @since 0.9.1
     * @example
     * for await (const text of client.streamText([{ role: 'user', content: 'Hi' }])) {
     *   process.stdout.write(text);
     * }
     */
    streamText(messages: ClaudeMessage[], options?: Partial<Omit<ClaudeCompletionRequest, 'messages' | 'stream'>>): AsyncGenerator<string>;
    private _headers;
    /** Throws the appropriate typed error for a non-2xx response. */
    private _throwHttpError;
    /**
     * Parses the Anthropic SSE format: `event: <type>\ndata: <json>\n\n` pairs.
     * Yields one `ClaudeStreamEvent` per pair; stops at `message_stop`.
     */
    private _parseClaudeSSE;
    /**
     * Extracts complete SSE event pairs from a buffer, returning parsed events
     * and the remaining unconsumed buffer.
     */
    private _drainBuffer;
    /**
     * Processes a single SSE line. Updates `state.lastEventType` on `event:` lines.
     * Returns a parsed event object on `data:` lines, `null` otherwise.
     */
    private _processLine;
}
export default ClaudeClient;
