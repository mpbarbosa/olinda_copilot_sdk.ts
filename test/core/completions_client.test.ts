import CopilotClient from '../../src/core/completions_client';
import { AuthenticationError, APIError } from '../../src/core/errors';
import type { Message } from '../../src/core/types';

// Mock fetch globally
const globalAny: any = global;
beforeEach(() => {
	globalAny.fetch = jest.fn();
});

afterEach(() => {
	jest.resetAllMocks();
});

const validToken = 'test-token';
const baseUrl = 'https://api.githubcopilot.com';
const model = 'gpt-4o';

const sampleMessages: Message[] = [
	{ role: 'user', content: 'Hello!' },
];

const completionResponse = {
	choices: [
		{ message: { content: 'Hi there!' } },
	],
};

const streamChunk = {
	choices: [
		{ delta: { content: 'Hi' } },
	],
};

describe('CopilotClient', () => {
	describe('constructor', () => {
		it('should throw AuthenticationError if token is missing', () => {
			expect(() => new CopilotClient({ token: '' })).toThrow(AuthenticationError);
			expect(() => new CopilotClient({} as any)).toThrow(AuthenticationError);
		});

		it('should set default baseUrl and model', () => {
			const client = new CopilotClient({ token: validToken });
			expect((client as any).baseUrl).toBe(baseUrl);
			expect((client as any).model).toBe(model);
		});

		it('should override baseUrl and model if provided', () => {
			const customUrl = 'https://custom.url';
			const customModel = 'custom-model';
			const client = new CopilotClient({
				token: validToken,
				baseUrl: customUrl,
				model: customModel,
			});
			expect((client as any).baseUrl).toBe(customUrl);
			expect((client as any).model).toBe(customModel);
		});
	});

	describe('complete', () => {
		it('should return completion response on success', async () => {
			globalAny.fetch.mockResolvedValue({
				ok: true,
				status: 200,
				json: () => Promise.resolve(completionResponse),
			});
			const client = new CopilotClient({ token: validToken });
			const res = await client.complete(sampleMessages);
			expect(res).toEqual(completionResponse);
			expect(globalAny.fetch).toHaveBeenCalledWith(
				`${baseUrl}/chat/completions`,
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						Authorization: `Bearer ${validToken}`,
						'Content-Type': 'application/json',
					}),
				}),
			);
		});

		it('should throw AuthenticationError on HTTP 401', async () => {
			globalAny.fetch.mockResolvedValue({
				ok: false,
				status: 401,
				statusText: 'Unauthorized',
			});
			const client = new CopilotClient({ token: validToken });
			await expect(client.complete(sampleMessages)).rejects.toThrow(AuthenticationError);
		});

		it('should throw APIError on non-2xx HTTP response', async () => {
			globalAny.fetch.mockResolvedValue({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
			});
			const client = new CopilotClient({ token: validToken });
			await expect(client.complete(sampleMessages)).rejects.toThrow(APIError);
		});
	});

	describe('stream', () => {
		const createMockStream = (lines: string[]) => {
			const encoder = new TextEncoder();
			const chunks = lines.map(line => encoder.encode(line + '\n'));
			let index = 0;
			return {
				getReader: () => ({
					read: jest.fn().mockImplementation(() => {
						if (index < chunks.length) {
							return Promise.resolve({ done: false, value: chunks[index++] });
						}
						return Promise.resolve({ done: true, value: undefined });
					}),
					releaseLock: jest.fn(),
				}),
			};
		};

		it('should yield stream chunks and stop at [DONE]', async () => {
			const sseLines = [
				'data: {"choices":[{"delta":{"content":"Hi"}}]}',
				'data: [DONE]',
			];
			globalAny.fetch.mockResolvedValue({
				ok: true,
				status: 200,
				body: createMockStream(sseLines),
			});
			const client = new CopilotClient({ token: validToken });
			const chunks: any[] = [];
			for await (const chunk of client.stream(sampleMessages)) {
				chunks.push(chunk);
			}
			expect(chunks).toEqual([streamChunk]);
		});

		it('should skip malformed SSE lines', async () => {
			const sseLines = [
				'data: {"choices":[{"delta":{"content":"Hi"}}]}',
				'data: malformed-json',
				'data: [DONE]',
			];
			globalAny.fetch.mockResolvedValue({
				ok: true,
				status: 200,
				body: createMockStream(sseLines),
			});
			const client = new CopilotClient({ token: validToken });
			const chunks: any[] = [];
			for await (const chunk of client.stream(sampleMessages)) {
				chunks.push(chunk);
			}
			expect(chunks).toEqual([streamChunk]);
		});

		it('should throw AuthenticationError on HTTP 401', async () => {
			globalAny.fetch.mockResolvedValue({
				ok: false,
				status: 401,
				statusText: 'Unauthorized',
			});
			const client = new CopilotClient({ token: validToken });
			const iterator = client.stream(sampleMessages);
			await expect(iterator.next()).rejects.toThrow(AuthenticationError);
		});

		it('should throw APIError on non-2xx HTTP response', async () => {
			globalAny.fetch.mockResolvedValue({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
			});
			const client = new CopilotClient({ token: validToken });
			const iterator = client.stream(sampleMessages);
			await expect(iterator.next()).rejects.toThrow(APIError);
		});

		it('should return immediately if response.body is missing', async () => {
			globalAny.fetch.mockResolvedValue({
				ok: true,
				status: 200,
				body: undefined,
			});
			const client = new CopilotClient({ token: validToken });
			const chunks: any[] = [];
			for await (const chunk of client.stream(sampleMessages)) {
				chunks.push(chunk);
			}
			expect(chunks).toEqual([]);
		});
	});

	describe('streamText', () => {
		const createMockStream = (lines: string[]) => {
			const encoder = new TextEncoder();
			const chunks = lines.map(line => encoder.encode(line + '\n'));
			let index = 0;
			return {
				getReader: () => ({
					read: jest.fn().mockImplementation(() => {
						if (index < chunks.length) {
							return Promise.resolve({ done: false, value: chunks[index++] });
						}
						return Promise.resolve({ done: true, value: undefined });
					}),
					releaseLock: jest.fn(),
				}),
			};
		};

		it('should yield delta text strings from stream chunks', async () => {
			const sseLines = [
				'data: {"choices":[{"delta":{"content":"Hi"},"finish_reason":null}]}',
				'data: {"choices":[{"delta":{"content":" there"},"finish_reason":null}]}',
				'data: [DONE]',
			];
			globalAny.fetch.mockResolvedValue({
				ok: true,
				status: 200,
				body: createMockStream(sseLines),
			});
			const client = new CopilotClient({ token: validToken });
			const texts: string[] = [];
			for await (const text of client.streamText(sampleMessages)) {
				texts.push(text);
			}
			expect(texts).toEqual(['Hi', ' there']);
		});

		it('should throw AuthenticationError on HTTP 401', async () => {
			globalAny.fetch.mockResolvedValue({
				ok: false,
				status: 401,
				statusText: 'Unauthorized',
			});
			const client = new CopilotClient({ token: validToken });
			const iterator = client.streamText(sampleMessages);
			await expect(iterator.next()).rejects.toThrow(AuthenticationError);
		});

		it('should throw APIError on non-2xx HTTP response', async () => {
			globalAny.fetch.mockResolvedValue({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
			});
			const client = new CopilotClient({ token: validToken });
			const iterator = client.streamText(sampleMessages);
			await expect(iterator.next()).rejects.toThrow(APIError);
		});

		it('should return immediately if response.body is missing', async () => {
			globalAny.fetch.mockResolvedValue({
				ok: true,
				status: 200,
				body: undefined,
			});
			const client = new CopilotClient({ token: validToken });
			const texts: string[] = [];
			for await (const text of client.streamText(sampleMessages)) {
				texts.push(text);
			}
			expect(texts).toEqual([]);
		});
	});
});
