/**
 * Copilot API Client
 * @module core/completions_client
 * @description HTTP client for interacting with the GitHub Copilot chat completions API.
 * Wraps native `fetch` (available in Node.js ≥ 18) and provides typed request/response
 * helpers for both non-streaming and streaming completions.
 * @since 0.1.3
 */

import { AuthenticationError, APIError } from './errors.js';
import { parseSSEStream, extractDeltaContent } from '../utils/stream.js';
import type {
	ClientOptions,
	CompletionRequest,
	CompletionResponse,
	StreamChunk,
	Message,
} from './types.js';

/**
 * Client for the GitHub Copilot chat completions API.
 * @since 0.1.3
 * @example
 * const client = new CopilotClient({ token: process.env.GITHUB_TOKEN! });
 * const res = await client.complete([{ role: 'user', content: 'Hello!' }]);
 * console.log(res.choices[0].message.content);
 */
export class CopilotClient {
	private readonly token: string;
	private readonly baseUrl: string;
	private readonly model: string;

	/**
	 * Create a new CopilotClient.
	 * @param options - Client configuration.
	 * @throws {AuthenticationError} When `options.token` is empty or missing.
	 */
	constructor(options: ClientOptions) {
		if (!options.token) {
			throw new AuthenticationError('token is required');
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
	async complete(
		messages: Message[],
		options?: Partial<Omit<CompletionRequest, 'messages' | 'stream'>>,
	): Promise<CompletionResponse> {
		const body: CompletionRequest = {
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
				throw new AuthenticationError('Invalid or expired token');
			}
			throw new APIError(`API request failed: ${response.statusText}`, response.status);
		}

		return response.json() as Promise<CompletionResponse>;
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
	async *stream(
		messages: Message[],
		options?: Partial<Omit<CompletionRequest, 'messages' | 'stream'>>,
	): AsyncGenerator<StreamChunk> {
		const body: CompletionRequest = {
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
				throw new AuthenticationError('Invalid or expired token');
			}
			throw new APIError(`API request failed: ${response.statusText}`, response.status);
		}

		if (!response.body) return;

		yield* parseSSEStream(response.body);
	}

	/**
	 * Send a streaming chat completion request and yield the delta text content directly.
	 * Equivalent to calling {@link stream} and mapping {@link extractDeltaContent} over each chunk.
	 * @param messages - Conversation history.
	 * @param options - Optional overrides for the request body.
	 * @returns Async iterable of text strings (one per SSE chunk).
	 * @throws {AuthenticationError} On HTTP 401.
	 * @throws {APIError} On any other non-2xx HTTP response.
	 * @since 0.4.2
	 * @example
	 * for await (const text of client.streamText([createUserMessage('Hi')])) {
	 *   process.stdout.write(text);
	 * }
	 */
	async *streamText(
		messages: Message[],
		options?: Partial<Omit<CompletionRequest, 'messages' | 'stream'>>,
	): AsyncGenerator<string> {
		for await (const chunk of this.stream(messages, options)) {
			yield extractDeltaContent(chunk);
		}
	}
}

export default CopilotClient;
