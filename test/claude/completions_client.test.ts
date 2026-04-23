import ClaudeClient from '../../src/claude/completions_client';
import { ClaudeAuthError, ClaudeAPIError } from '../../src/claude/errors';
import type { ClaudeMessage } from '../../src/claude/types';

// Mock fetch globally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny: any = global;
const originalFetch = globalAny.fetch;

const getFetchMock = (): jest.Mock => globalAny.fetch as jest.Mock;

const mockFetchResponse = (response: unknown): void => {
	getFetchMock().mockResolvedValue(response);
};

beforeEach(() => {
	globalAny.fetch = jest.fn();
});

afterEach(() => {
	jest.resetAllMocks();
	globalAny.fetch = originalFetch;
});

const validKey = 'sk-ant-test-key';
const baseUrl = 'https://api.anthropic.com';
const model = 'claude-sonnet-4-5';
const apiVersion = '2023-06-01';

const sampleMessages: ClaudeMessage[] = [
	{ role: 'user', content: 'Hello!' },
];

const completionResponse = {
	id: 'msg_01',
	type: 'message',
	role: 'assistant',
	content: [{ type: 'text', text: 'Hi there!' }],
	model,
	stop_reason: 'end_turn',
	usage: { input_tokens: 5, output_tokens: 3 },
};

/**
 * Creates a mock ReadableStream that yields Claude-format SSE lines.
 * Each event is encoded as `event: <type>\ndata: <json>\n\n`.
 */
const createClaudeMockStream = (events: Array<{ event: string; data: object }>) => {
	const encoder = new TextEncoder();
	const lines: string[] = [];
	for (const { event, data } of events) {
		lines.push(`event: ${event}`);
		lines.push(`data: ${JSON.stringify(data)}`);
		lines.push('');
	}
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

describe('ClaudeClient', () => {
	describe('constructor', () => {
		it.each([
			['an empty apiKey', { apiKey: '' }],
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			['a missing apiKey option', {} as any],
		])('should throw ClaudeAuthError for %s', (_label, options) => {
			expect(() => new ClaudeClient(options)).toThrow(ClaudeAuthError);
		});

		it('should set default baseUrl, model, and apiVersion', () => {
			const client = new ClaudeClient({ apiKey: validKey });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const c = client as any;
			expect(c.baseUrl).toBe(baseUrl);
			expect(c.model).toBe(model);
			expect(c.apiVersion).toBe(apiVersion);
		});

		it('should apply custom baseUrl, model, and apiVersion', () => {
			const client = new ClaudeClient({
				apiKey: validKey,
				baseUrl: 'https://custom.example.com',
				model: 'claude-opus-4-7',
				apiVersion: '2024-01-01',
			});
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const c = client as any;
			expect(c.baseUrl).toBe('https://custom.example.com');
			expect(c.model).toBe('claude-opus-4-7');
			expect(c.apiVersion).toBe('2024-01-01');
		});
	});

	describe('complete', () => {
		it('should return ClaudeCompletionResponse on success', async () => {
			mockFetchResponse({
				ok: true,
				status: 200,
				json: () => Promise.resolve(completionResponse),
			});
			const client = new ClaudeClient({ apiKey: validKey });
			const res = await client.complete(sampleMessages);
			expect(res).toEqual(completionResponse);
		});

		it('should use x-api-key and anthropic-version headers', async () => {
			mockFetchResponse({
				ok: true,
				status: 200,
				json: () => Promise.resolve(completionResponse),
			});
			const client = new ClaudeClient({ apiKey: validKey });
			await client.complete(sampleMessages);
			expect(globalAny.fetch).toHaveBeenCalledWith(
				`${baseUrl}/v1/messages`,
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						'x-api-key': validKey,
						'anthropic-version': apiVersion,
						'Content-Type': 'application/json',
					}),
				}),
			);
		});

		it('should apply optional request overrides', async () => {
			mockFetchResponse({
				ok: true,
				status: 200,
				json: () => Promise.resolve(completionResponse),
			});
			const client = new ClaudeClient({ apiKey: validKey });
			await client.complete(sampleMessages, { system: 'Be brief.', temperature: 0.5 });
			const body = JSON.parse(globalAny.fetch.mock.calls[0][1].body);
			expect(body.system).toBe('Be brief.');
			expect(body.temperature).toBe(0.5);
		});

		it('should throw ClaudeAuthError on HTTP 401', async () => {
			mockFetchResponse({ ok: false, status: 401, statusText: 'Unauthorized' });
			const client = new ClaudeClient({ apiKey: validKey });
			await expect(client.complete(sampleMessages)).rejects.toThrow(ClaudeAuthError);
		});

		it('should throw ClaudeAPIError on non-2xx HTTP response', async () => {
			mockFetchResponse({ ok: false, status: 500, statusText: 'Server Error' });
			const client = new ClaudeClient({ apiKey: validKey });
			await expect(client.complete(sampleMessages)).rejects.toThrow(ClaudeAPIError);
		});

		it('should include the HTTP status code in ClaudeAPIError', async () => {
			mockFetchResponse({ ok: false, status: 429, statusText: 'Too Many Requests' });
			const client = new ClaudeClient({ apiKey: validKey });
			await expect(client.complete(sampleMessages)).rejects.toMatchObject({ statusCode: 429 });
		});
	});

	describe('stream', () => {
		it('should yield ClaudeStreamEvents for each SSE event pair', async () => {
			const events = [
				{ event: 'message_start', data: { type: 'message_start', message: {} } },
				{ event: 'content_block_delta', data: { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Hi' } } },
				{ event: 'message_stop', data: { type: 'message_stop' } },
			];
			mockFetchResponse({
				ok: true,
				status: 200,
				body: createClaudeMockStream(events),
			});
			const client = new ClaudeClient({ apiKey: validKey });
			const collected: unknown[] = [];
			for await (const evt of client.stream(sampleMessages)) {
				collected.push(evt);
			}
			// Should yield message_start, content_block_delta, message_stop, then stop
			expect(collected).toHaveLength(3);
			expect((collected[0] as { type: string }).type).toBe('message_start');
			expect((collected[1] as { type: string }).type).toBe('content_block_delta');
			expect((collected[2] as { type: string }).type).toBe('message_stop');
		});

		it('should stop iteration after message_stop', async () => {
			const events = [
				{ event: 'message_stop', data: { type: 'message_stop' } },
				{ event: 'content_block_delta', data: { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'NEVER' } } },
			];
			mockFetchResponse({
				ok: true,
				status: 200,
				body: createClaudeMockStream(events),
			});
			const client = new ClaudeClient({ apiKey: validKey });
			const collected: unknown[] = [];
			for await (const evt of client.stream(sampleMessages)) {
				collected.push(evt);
			}
			expect(collected).toHaveLength(1);
			expect((collected[0] as { type: string }).type).toBe('message_stop');
		});

		it('should return immediately if response.body is missing', async () => {
			mockFetchResponse({ ok: true, status: 200, body: undefined });
			const client = new ClaudeClient({ apiKey: validKey });
			const collected: unknown[] = [];
			for await (const evt of client.stream(sampleMessages)) {
				collected.push(evt);
			}
			expect(collected).toHaveLength(0);
		});

		it('should throw ClaudeAuthError on HTTP 401', async () => {
			mockFetchResponse({ ok: false, status: 401, statusText: 'Unauthorized' });
			const client = new ClaudeClient({ apiKey: validKey });
			await expect(client.stream(sampleMessages).next()).rejects.toThrow(ClaudeAuthError);
		});

		it('should throw ClaudeAPIError on non-2xx HTTP response', async () => {
			mockFetchResponse({ ok: false, status: 503, statusText: 'Unavailable' });
			const client = new ClaudeClient({ apiKey: validKey });
			await expect(client.stream(sampleMessages).next()).rejects.toThrow(ClaudeAPIError);
		});
	});

	describe('streamText', () => {
		it('should yield text strings from text_delta events only', async () => {
			const events = [
				{ event: 'message_start', data: { type: 'message_start', message: {} } },
				{ event: 'content_block_delta', data: { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Hello' } } },
				{ event: 'content_block_delta', data: { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: ' world' } } },
				{ event: 'message_stop', data: { type: 'message_stop' } },
			];
			mockFetchResponse({
				ok: true,
				status: 200,
				body: createClaudeMockStream(events),
			});
			const client = new ClaudeClient({ apiKey: validKey });
			const texts: string[] = [];
			for await (const text of client.streamText(sampleMessages)) {
				texts.push(text);
			}
			expect(texts).toEqual(['Hello', ' world']);
		});

		it('should skip non-text_delta events', async () => {
			const events = [
				{ event: 'message_start', data: { type: 'message_start', message: {} } },
				{ event: 'content_block_delta', data: { type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: '{}' } } },
				{ event: 'message_stop', data: { type: 'message_stop' } },
			];
			mockFetchResponse({
				ok: true,
				status: 200,
				body: createClaudeMockStream(events),
			});
			const client = new ClaudeClient({ apiKey: validKey });
			const texts: string[] = [];
			for await (const text of client.streamText(sampleMessages)) {
				texts.push(text);
			}
			expect(texts).toHaveLength(0);
		});

		it('should throw ClaudeAuthError on HTTP 401', async () => {
			mockFetchResponse({ ok: false, status: 401, statusText: 'Unauthorized' });
			const client = new ClaudeClient({ apiKey: validKey });
			await expect(client.streamText(sampleMessages).next()).rejects.toThrow(ClaudeAuthError);
		});

		it('should throw ClaudeAPIError on non-2xx HTTP response', async () => {
			mockFetchResponse({ ok: false, status: 500, statusText: 'Server Error' });
			const client = new ClaudeClient({ apiKey: validKey });
			await expect(client.streamText(sampleMessages).next()).rejects.toThrow(ClaudeAPIError);
		});

		it('should return empty when response.body is missing', async () => {
			mockFetchResponse({ ok: true, status: 200, body: undefined });
			const client = new ClaudeClient({ apiKey: validKey });
			const texts: string[] = [];
			for await (const text of client.streamText(sampleMessages)) {
				texts.push(text);
			}
			expect(texts).toHaveLength(0);
		});
	});
});
