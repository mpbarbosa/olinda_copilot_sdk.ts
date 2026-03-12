"use strict";
/**
 * Copilot API Client
 * @module core/completions_client
 * @description HTTP client for interacting with the GitHub Copilot chat completions API.
 * Wraps native `fetch` (available in Node.js ≥ 18) and provides typed request/response
 * helpers for both non-streaming and streaming completions.
 * @since 0.1.3
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotClient = void 0;
const errors_js_1 = require("./errors.js");
/**
 * Parse a batch of SSE text lines into typed stream chunks.
 * Returns `null` as a sentinel value to signal `[DONE]`.
 * @internal
 */
function parseSSELines(lines) {
    const results = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: '))
            continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') {
            results.push(null);
            return results;
        }
        try {
            results.push(JSON.parse(data));
        }
        catch {
            // skip malformed lines
        }
    }
    return results;
}
/**
 * Client for the GitHub Copilot chat completions API.
 * @since 0.1.3
 * @example
 * const client = new CopilotClient({ token: process.env.GITHUB_TOKEN! });
 * const res = await client.complete([{ role: 'user', content: 'Hello!' }]);
 * console.log(res.choices[0].message.content);
 */
class CopilotClient {
    /**
     * Create a new CopilotClient.
     * @param options - Client configuration.
     * @throws {AuthenticationError} When `options.token` is empty or missing.
     */
    constructor(options) {
        if (!options.token) {
            throw new errors_js_1.AuthenticationError('token is required');
        }
        this.token = options.token;
        this.baseUrl = options.baseUrl ?? 'https://api.githubcopilot.com';
        this.model = options.model ?? 'gpt-4o';
    }
    /**
     * Send a non-streaming chat completion request.
     * @param messages - Conversation history.
     * @param options - Optional overrides for the request body.
     * @returns Resolved completion response.
     * @throws {AuthenticationError} On HTTP 401.
     * @throws {APIError} On any other non-2xx HTTP response.
     * @since 0.1.3
     * @example
     * const res = await client.complete([createUserMessage('Hi')]);
     * console.log(res.choices[0].message.content);
     */
    async complete(messages, options) {
        const body = {
            messages,
            model: this.model,
            stream: false,
            ...options,
        };
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new errors_js_1.AuthenticationError('Invalid or expired token');
            }
            throw new errors_js_1.APIError(`API request failed: ${response.statusText}`, response.status);
        }
        return response.json();
    }
    /**
     * Send a streaming chat completion request and return an async iterator of chunks.
     * Each yielded value is a parsed {@link StreamChunk}; `[DONE]` sentinel lines are skipped.
     * @param messages - Conversation history.
     * @param options - Optional overrides for the request body.
     * @returns Async iterable of stream chunks.
     * @throws {AuthenticationError} On HTTP 401.
     * @throws {APIError} On any other non-2xx HTTP response.
     * @since 0.1.3
     * @example
     * for await (const chunk of client.stream([createUserMessage('Hi')])) {
     *   process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
     * }
     */
    async *stream(messages, options) {
        const body = {
            messages,
            model: this.model,
            stream: true,
            ...options,
        };
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new errors_js_1.AuthenticationError('Invalid or expired token');
            }
            throw new errors_js_1.APIError(`API request failed: ${response.statusText}`, response.status);
        }
        if (!response.body)
            return;
        const decoder = new TextDecoder();
        const reader = response.body.getReader();
        try {
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                const items = parseSSELines(lines);
                for (const item of items) {
                    if (item === null)
                        return;
                    yield item;
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
}
exports.CopilotClient = CopilotClient;
exports.default = CopilotClient;
