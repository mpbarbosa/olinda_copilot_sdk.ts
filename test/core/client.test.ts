import { CopilotClient } from '../../src/core/completions_client';
import { AuthenticationError, APIError } from '../../src/core/errors';
import { COMPLETION_RESPONSE, STREAM_CHUNK, USER_MESSAGE } from '../helpers/fixtures';

// ─── Constructor ──────────────────────────────────────────────────────────────

describe('CopilotClient constructor', () => {
	it('throws AuthenticationError when token is empty', () => {
		expect(() => new CopilotClient({ token: '' })).toThrow(AuthenticationError);
	});

	it('throws AuthenticationError with descriptive message', () => {
		expect(() => new CopilotClient({ token: '' })).toThrow('token is required');
	});

	it('creates a client with a valid token', () => {
		expect(() => new CopilotClient({ token: 'ghp_test' })).not.toThrow();
	});
});

// ─── complete() ───────────────────────────────────────────────────────────────

describe('CopilotClient.complete()', () => {
	const client = new CopilotClient({ token: 'ghp_test' });

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('returns a completion response on success', async () => {
		jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(JSON.stringify(COMPLETION_RESPONSE), { status: 200 }),
		);
		const result = await client.complete([USER_MESSAGE]);
		expect(result).toEqual(COMPLETION_RESPONSE);
	});

	it('sends a POST request to the completions endpoint', async () => {
		const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(JSON.stringify(COMPLETION_RESPONSE), { status: 200 }),
		);
		await client.complete([USER_MESSAGE]);
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(fetchSpy).toHaveBeenCalledWith(
			expect.stringContaining('/chat/completions'),
			expect.objectContaining({ method: 'POST' }),
		);
	});

	it.each([
		[401, 'Unauthorized', AuthenticationError],
		[500, 'Internal Server Error', APIError],
		[404, 'Not Found', APIError],
		[403, 'Forbidden', APIError],
	])('throws %p (%s) for HTTP %i', async (status, statusText, ErrorClass) => {
		jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(statusText, { status, statusText }),
		);
		await expect(client.complete([USER_MESSAGE])).rejects.toBeInstanceOf(ErrorClass);
	});

	it('APIError carries the HTTP status code', async () => {
		jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response('Not Found', { status: 404, statusText: 'Not Found' }),
		);
		await expect(client.complete([USER_MESSAGE])).rejects.toMatchObject({ statusCode: 404 });
	});

	it('uses the custom baseUrl when provided', async () => {
		const customClient = new CopilotClient({
			token: 'ghp_test',
			baseUrl: 'https://custom.example.com',
		});
		const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(JSON.stringify(COMPLETION_RESPONSE), { status: 200 }),
		);
		await customClient.complete([USER_MESSAGE]);
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(fetchSpy).toHaveBeenCalledWith(
			'https://custom.example.com/chat/completions',
			expect.anything(),
		);
	});
});

// ─── stream() ─────────────────────────────────────────────────────────────────

describe('CopilotClient.stream()', () => {
	const client = new CopilotClient({ token: 'ghp_test' });

	afterEach(() => {
		jest.restoreAllMocks();
	});

	function makeSSEResponse(lines: string[]): Response {
		const body = lines.join('\n') + '\n';
		return new Response(body, { status: 200 });
	}

	it('yields parsed stream chunks', async () => {
		const sseLines = [
			`data: ${JSON.stringify(STREAM_CHUNK)}`,
			'data: [DONE]',
		];
		jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(makeSSEResponse(sseLines));

		const chunks = [];
		for await (const chunk of client.stream([USER_MESSAGE])) {
			chunks.push(chunk);
		}
		expect(chunks).toHaveLength(1);
		expect(chunks[0]).toEqual(STREAM_CHUNK);
	});

	it('stops at [DONE] sentinel', async () => {
		const sseLines = ['data: [DONE]'];
		jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(makeSSEResponse(sseLines));

		const chunks = [];
		for await (const chunk of client.stream([USER_MESSAGE])) {
			chunks.push(chunk);
		}
		expect(chunks).toHaveLength(0);
	});

	it('skips malformed JSON lines', async () => {
		const sseLines = [
			'data: not-valid-json',
			`data: ${JSON.stringify(STREAM_CHUNK)}`,
			'data: [DONE]',
		];
		jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(makeSSEResponse(sseLines));

		const chunks = [];
		for await (const chunk of client.stream([USER_MESSAGE])) {
			chunks.push(chunk);
		}
		expect(chunks).toHaveLength(1);
	});

	it('throws AuthenticationError on 401', async () => {
		jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' }),
		);
		const gen = client.stream([USER_MESSAGE]);
		await expect(gen.next()).rejects.toBeInstanceOf(AuthenticationError);
	});

	it('throws APIError on non-2xx status', async () => {
		jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response('Server Error', { status: 500, statusText: 'Internal Server Error' }),
		);
		const gen = client.stream([USER_MESSAGE]);
		await expect(gen.next()).rejects.toBeInstanceOf(APIError);
	});

	it('returns empty when response body is null', async () => {
		jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(null, { status: 200 }),
		);
		const chunks = [];
		for await (const chunk of client.stream([USER_MESSAGE])) {
			chunks.push(chunk);
		}
		expect(chunks).toHaveLength(0);
	});
});
