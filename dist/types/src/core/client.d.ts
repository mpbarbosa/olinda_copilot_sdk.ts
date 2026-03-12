/**
 * Copilot API Client
 * @module core/client
 * @description HTTP client for interacting with the GitHub Copilot chat completions API.
 * Wraps native `fetch` (available in Node.js ≥ 18) and provides typed request/response
 * helpers for both non-streaming and streaming completions.
 * @since 0.1.0
 */
import type { ClientOptions, CompletionRequest, CompletionResponse, StreamChunk, Message } from './types.js';
/**
 * Client for the GitHub Copilot chat completions API.
 * @since 0.1.0
 * @example
 * const client = new CopilotClient({ token: process.env.GITHUB_TOKEN! });
 * const res = await client.complete([{ role: 'user', content: 'Hello!' }]);
 * console.log(res.choices[0].message.content);
 */
export declare class CopilotClient {
    private readonly token;
    private readonly baseUrl;
    private readonly model;
    /**
     * Create a new CopilotClient.
     * @param options - Client configuration.
     * @throws {AuthenticationError} When `options.token` is empty or missing.
     */
    constructor(options: ClientOptions);
    /**
     * Send a non-streaming chat completion request.
     * @param messages - Conversation history.
     * @param options - Optional overrides for the request body.
     * @returns Resolved completion response.
     * @throws {AuthenticationError} On HTTP 401.
     * @throws {APIError} On any other non-2xx HTTP response.
     * @since 0.1.0
     * @example
     * const res = await client.complete([createUserMessage('Hi')]);
     * console.log(res.choices[0].message.content);
     */
    complete(messages: Message[], options?: Partial<Omit<CompletionRequest, 'messages' | 'stream'>>): Promise<CompletionResponse>;
    /**
     * Send a streaming chat completion request and return an async iterator of chunks.
     * Each yielded value is a parsed {@link StreamChunk}; `[DONE]` sentinel lines are skipped.
     * @param messages - Conversation history.
     * @param options - Optional overrides for the request body.
     * @returns Async iterable of stream chunks.
     * @throws {AuthenticationError} On HTTP 401.
     * @throws {APIError} On any other non-2xx HTTP response.
     * @since 0.1.0
     * @example
     * for await (const chunk of client.stream([createUserMessage('Hi')])) {
     *   process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
     * }
     */
    stream(messages: Message[], options?: Partial<Omit<CompletionRequest, 'messages' | 'stream'>>): AsyncGenerator<StreamChunk>;
}
export default CopilotClient;
