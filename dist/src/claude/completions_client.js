"use strict";
/**
 * Claude API Client
 * @module claude/completions_client
 * @description Stateless HTTP client for the Anthropic Messages API.
 * Wraps native `fetch` (available in Node.js ≥ 18) and provides typed request/response
 * helpers for both non-streaming and streaming completions.
 *
 * Note: Anthropic's SSE format differs from OpenAI's — events use `event:`+`data:` pairs
 * rather than bare `data:` lines, so the existing `parseSSEStream` utility is not used here.
 * @since 0.9.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeClient = void 0;
const errors_js_1 = require("./errors.js");
const DEFAULT_MAX_TOKENS = 4096;
/**
 * Stateless HTTP client for the Anthropic Messages API.
 * @since 0.9.0
 * @example
 * const client = new ClaudeClient({ apiKey: process.env.ANTHROPIC_API_KEY! });
 * const res = await client.complete([{ role: 'user', content: 'Hello!' }]);
 * console.log(res.content[0].text);
 */
class ClaudeClient {
    /**
     * Create a new ClaudeClient.
     * @param options - Client configuration.
     * @throws {ClaudeAuthError} When `options.apiKey` is empty or missing.
     */
    constructor(options) {
        if (!options.apiKey) {
            throw new errors_js_1.ClaudeAuthError('apiKey is required');
        }
        this.apiKey = options.apiKey;
        this.baseUrl = options.baseUrl ?? 'https://api.anthropic.com';
        this.model = options.model ?? 'claude-sonnet-4-5';
        this.apiVersion = options.apiVersion ?? '2023-06-01';
    }
    /**
     * Send a non-streaming chat completion request.
     * @param messages - Conversation history (user/assistant turns).
     * @param options - Optional overrides for the request body (e.g. `system`, `temperature`).
     * @returns Resolved completion response.
     * @throws {ClaudeAuthError} On HTTP 401.
     * @throws {ClaudeAPIError} On any other non-2xx HTTP response.
     * @since 0.9.0
     * @example
     * const res = await client.complete([{ role: 'user', content: 'Hi' }]);
     * console.log(res.content[0].text);
     */
    async complete(messages, options) {
        const body = {
            model: this.model,
            messages,
            max_tokens: DEFAULT_MAX_TOKENS,
            stream: false,
            ...options,
        };
        const response = await fetch(`${this.baseUrl}/v1/messages`, {
            method: 'POST',
            headers: this._headers(),
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            this._throwHttpError(response);
        }
        return response.json();
    }
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
     * @since 0.9.0
     * @example
     * for await (const event of client.stream([{ role: 'user', content: 'Hi' }])) {
     *   if (event.type === 'content_block_delta') {
     *     process.stdout.write(event.delta?.text ?? '');
     *   }
     * }
     */
    async *stream(messages, options) {
        const body = {
            model: this.model,
            messages,
            max_tokens: DEFAULT_MAX_TOKENS,
            stream: true,
            ...options,
        };
        const response = await fetch(`${this.baseUrl}/v1/messages`, {
            method: 'POST',
            headers: this._headers(),
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            this._throwHttpError(response);
        }
        if (!response.body)
            return;
        yield* this._parseClaudeSSE(response.body);
    }
    /**
     * Send a streaming chat completion request and yield text delta strings directly.
     * Filters the SSE stream for `content_block_delta` events of type `text_delta` and
     * yields each incremental text chunk.
     * @param messages - Conversation history (user/assistant turns).
     * @param options - Optional overrides for the request body.
     * @returns Async iterable of text strings.
     * @throws {ClaudeAuthError} On HTTP 401.
     * @throws {ClaudeAPIError} On any other non-2xx HTTP response.
     * @since 0.9.0
     * @example
     * for await (const text of client.streamText([{ role: 'user', content: 'Hi' }])) {
     *   process.stdout.write(text);
     * }
     */
    async *streamText(messages, options) {
        for await (const event of this.stream(messages, options)) {
            if (event.type === 'content_block_delta' &&
                event.delta?.type === 'text_delta' &&
                typeof event.delta.text === 'string') {
                yield event.delta.text;
            }
        }
    }
    // --------------------------------------------------------------------------
    // Private helpers
    // --------------------------------------------------------------------------
    _headers() {
        return {
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion,
            'Content-Type': 'application/json',
        };
    }
    /** Throws the appropriate typed error for a non-2xx response. */
    _throwHttpError(response) {
        if (response.status === 401) {
            throw new errors_js_1.ClaudeAuthError('Invalid or expired API key');
        }
        throw new errors_js_1.ClaudeAPIError(`API request failed: ${response.statusText}`, response.status);
    }
    /**
     * Parses the Anthropic SSE format: `event: <type>\ndata: <json>\n\n` pairs.
     * Yields one `ClaudeStreamEvent` per pair; stops at `message_stop`.
     */
    async *_parseClaudeSSE(body) {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        const state = { lastEventType: '' };
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const event = this._drainBuffer(buffer, state);
                buffer = event.remainder;
                for (const parsed of event.events) {
                    yield parsed;
                    if (parsed.type === 'message_stop')
                        return;
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    /**
     * Extracts complete SSE event pairs from a buffer, returning parsed events
     * and the remaining unconsumed buffer.
     */
    _drainBuffer(buffer, state) {
        const events = [];
        const lines = buffer.split('\n');
        // The last element may be an incomplete line; keep it in the buffer.
        const remainder = lines.pop() ?? '';
        for (const line of lines) {
            const parsed = this._processLine(line.trimEnd(), state);
            if (parsed !== null) {
                events.push(parsed);
            }
        }
        return { events, remainder };
    }
    /**
     * Processes a single SSE line. Updates `state.lastEventType` on `event:` lines.
     * Returns a parsed event object on `data:` lines, `null` otherwise.
     */
    _processLine(line, state) {
        if (line.startsWith('event:')) {
            state.lastEventType = line.slice(6).trim();
            return null;
        }
        if (!line.startsWith('data:'))
            return null;
        const raw = line.slice(5).trim();
        if (!raw)
            return null;
        try {
            const parsed = JSON.parse(raw);
            // Prefer the event: header type; fall back to the JSON type field.
            if (state.lastEventType)
                parsed.type = state.lastEventType;
            state.lastEventType = '';
            return parsed;
        }
        catch {
            return null;
        }
    }
}
exports.ClaudeClient = ClaudeClient;
exports.default = ClaudeClient;
