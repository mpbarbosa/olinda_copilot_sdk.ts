import { CopilotSDKError, AuthenticationError, APIError } from '../../src/core/errors';

// ─── CopilotSDKError ──────────────────────────────────────────────────────────

describe('CopilotSDKError', () => {
	it('sets name to CopilotSDKError', () => {
		const err = new CopilotSDKError('test');
		expect(err.name).toBe('CopilotSDKError');
	});

	it('includes message in error text', () => {
		const err = new CopilotSDKError('something failed');
		expect(err.message).toContain('something failed');
	});

	it('is an instance of Error', () => {
		expect(new CopilotSDKError('x')).toBeInstanceOf(Error);
	});

	it('is an instance of CopilotSDKError', () => {
		expect(new CopilotSDKError('x')).toBeInstanceOf(CopilotSDKError);
	});
});

// ─── AuthenticationError ──────────────────────────────────────────────────────

describe('AuthenticationError', () => {
	it('sets name to AuthenticationError', () => {
		const err = new AuthenticationError('bad token');
		expect(err.name).toBe('AuthenticationError');
	});

	it('includes message in error text', () => {
		expect(new AuthenticationError('bad token').message).toContain('bad token');
	});

	it('is an instance of Error', () => {
		expect(new AuthenticationError('x')).toBeInstanceOf(Error);
	});

	it('is an instance of CopilotSDKError', () => {
		expect(new AuthenticationError('x')).toBeInstanceOf(CopilotSDKError);
	});

	it('is an instance of AuthenticationError', () => {
		expect(new AuthenticationError('x')).toBeInstanceOf(AuthenticationError);
	});
});

// ─── APIError ─────────────────────────────────────────────────────────────────

describe('APIError', () => {
	it('sets name to APIError', () => {
		const err = new APIError('Not Found', 404);
		expect(err.name).toBe('APIError');
	});

	it('exposes the statusCode', () => {
		expect(new APIError('Forbidden', 403).statusCode).toBe(403);
	});

	it('includes message in error text', () => {
		expect(new APIError('Not Found', 404).message).toContain('Not Found');
	});

	it('is an instance of Error', () => {
		expect(new APIError('x', 500)).toBeInstanceOf(Error);
	});

	it('is an instance of CopilotSDKError', () => {
		expect(new APIError('x', 500)).toBeInstanceOf(CopilotSDKError);
	});

	it('is an instance of APIError', () => {
		expect(new APIError('x', 500)).toBeInstanceOf(APIError);
	});
});
