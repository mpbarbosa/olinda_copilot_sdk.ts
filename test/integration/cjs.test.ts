/**
 * CJS integration smoke test — imports from compiled dist/src/index.js
 * @module test/integration/cjs
 * @description Verifies that the CJS build is consumable via require() and
 * that representative functions from each domain behave correctly.
 * @since 0.1.0
 */

// Use require() to exercise the CJS entry point
// eslint-disable-next-line @typescript-eslint/no-require-imports
const lib = require('../../dist/src/index.js') as typeof import('../../src/index');

describe('CJS build — public surface', () => {
	it('exports are accessible via require()', () => {
		expect(typeof lib).toBe('object');
		expect(lib).not.toBeNull();
	});

	describe('CopilotClient', () => {
		it('is exported as a function/class', () => {
			expect(typeof lib.CopilotClient).toBe('function');
		});

		it('throws AuthenticationError when token is missing', () => {
			expect(() => new lib.CopilotClient({ token: '' })).toThrow(lib.AuthenticationError);
		});
	});

	describe('error classes', () => {
		it('CopilotSDKError is exported', () => {
			expect(typeof lib.CopilotSDKError).toBe('function');
		});

		it('AuthenticationError is exported and is a subclass', () => {
			expect(new lib.AuthenticationError('x')).toBeInstanceOf(lib.CopilotSDKError);
		});

		it('APIError exposes statusCode', () => {
			expect(new lib.APIError('err', 422).statusCode).toBe(422);
		});
	});

	describe('message utilities', () => {
		it('createUserMessage returns a user message', () => {
			expect(lib.createUserMessage('hi').role).toBe('user');
		});

		it('createSystemMessage returns a system message', () => {
			expect(lib.createSystemMessage('prompt').role).toBe('system');
		});

		it('extractContent returns message content', () => {
			expect(lib.extractContent({ role: 'user', content: 'hello' })).toBe('hello');
		});

		it('filterByRole filters by role', () => {
			const msgs: import('../../src/core/types').Message[] = [
				{ role: 'user', content: 'a' },
				{ role: 'system', content: 'b' },
			];
			expect(lib.filterByRole(msgs, 'user')).toHaveLength(1);
		});
	});

	describe('stream utilities', () => {
		it('parseSSELine returns null for [DONE]', () => {
			expect(lib.parseSSELine('data: [DONE]')).toBeNull();
		});

		it('parseSSELine returns data for valid line', () => {
			expect(lib.parseSSELine('data: {"id":"1"}')).toBe('{"id":"1"}');
		});

		it('isStreamDone returns true when finish_reason is set', () => {
			const chunk = {
				id: '1', object: 'chat.completion.chunk', created: 0, model: 'gpt-4o',
				choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
			};
			expect(lib.isStreamDone(chunk)).toBe(true);
		});
	});
});
