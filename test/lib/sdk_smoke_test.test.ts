/**
 * Tests for src/lib/sdk_smoke_test.ts
 *
 * Structure mirrors the referential transparency pattern:
 *   1. Pure function tests  — deterministic, no mocks needed.
 *   2. runSdkSmokeTest tests — CopilotSdkWrapper and logger are mocked.
 */

import {
	buildSmokeTestPrompt,
	validateSmokeTestResponse,
	formatSmokeTestResult,
	runSdkSmokeTest,
} from '../../src/lib/sdk_smoke_test';

// ---------------------------------------------------------------------------
// Mock: CopilotSdkWrapper (isolate SDK from unit tests)
// ---------------------------------------------------------------------------

const mockInitialize = jest.fn().mockResolvedValue({ authenticated: true, availableModels: [] });
const mockSend = jest.fn().mockResolvedValue({ content: 'ok', success: true });
const mockCleanup = jest.fn().mockResolvedValue(undefined);

jest.mock('../../src/core/session_client', () => ({
	CopilotSdkWrapper: jest.fn().mockImplementation(() => ({
		initialize: mockInitialize,
		send: mockSend,
		cleanup: mockCleanup,
		get authenticated() {
			return true;
		},
	})),
}));

// Mock: logger (suppress output)
jest.mock('../../src/core/logger', () => ({
	logger: {
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
		success: jest.fn(),
		debug: jest.fn(),
	},
}));

// ---------------------------------------------------------------------------
// Shared silent logger stub for injection
// ---------------------------------------------------------------------------

const silentLog = {
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
	success: jest.fn(),
};

// ---------------------------------------------------------------------------
// Pure function tests
// ---------------------------------------------------------------------------

describe('buildSmokeTestPrompt', () => {
	test('returns a non-empty string', () => {
		const prompt = buildSmokeTestPrompt();
		expect(typeof prompt).toBe('string');
		expect(prompt.length).toBeGreaterThan(0);
	});

	test('is deterministic — same value every call', () => {
		expect(buildSmokeTestPrompt()).toBe(buildSmokeTestPrompt());
	});

	test('contains the expected probe phrase', () => {
		expect(buildSmokeTestPrompt()).toContain('ok');
	});
});

describe('validateSmokeTestResponse', () => {
	test('returns true for a SendResult with non-empty content', () => {
		expect(validateSmokeTestResponse({ content: 'ok', success: true })).toBe(true);
	});

	test('returns true for multi-word content', () => {
		expect(validateSmokeTestResponse({ content: 'Sure, ok!', success: true })).toBe(true);
	});

	test('returns false for null', () => {
		expect(validateSmokeTestResponse(null)).toBe(false);
	});

	test('returns false for undefined', () => {
		expect(validateSmokeTestResponse(undefined)).toBe(false);
	});

	test('returns false for a primitive', () => {
		expect(validateSmokeTestResponse('string')).toBe(false);
		expect(validateSmokeTestResponse(42)).toBe(false);
	});

	test('returns false when content is missing', () => {
		expect(validateSmokeTestResponse({ success: true })).toBe(false);
	});

	test('returns false when content is an empty string', () => {
		expect(validateSmokeTestResponse({ content: '', success: true })).toBe(false);
	});

	test('returns false when content is only whitespace', () => {
		expect(validateSmokeTestResponse({ content: '   ', success: true })).toBe(false);
	});

	test('returns false when content is not a string', () => {
		expect(validateSmokeTestResponse({ content: 123 })).toBe(false);
		expect(validateSmokeTestResponse({ content: null })).toBe(false);
	});
});

describe('formatSmokeTestResult', () => {
	test('returns status "passed" on success', () => {
		const result = formatSmokeTestResult(true, 'All good');
		expect(result.status).toBe('passed');
	});

	test('returns status "failed" on failure', () => {
		const result = formatSmokeTestResult(false, 'Timeout');
		expect(result.status).toBe('failed');
	});

	test('includes the details string', () => {
		const result = formatSmokeTestResult(true, 'responded in 200ms');
		expect(result.details).toBe('responded in 200ms');
	});

	test('coerces non-string details to string', () => {
		const result = formatSmokeTestResult(false, 42);
		expect(result.details).toBe('42');
	});

	test('is deterministic', () => {
		expect(formatSmokeTestResult(true, 'x')).toEqual(formatSmokeTestResult(true, 'x'));
	});
});

// ---------------------------------------------------------------------------
// Integration tests — runSdkSmokeTest with injected wrapper mock
// ---------------------------------------------------------------------------

/** Build a minimal CopilotSdkWrapper stub for a given test scenario. */
function makeMockWrapper({
	authenticated = true,
	sendResult = { content: 'ok', success: true },
	sendError = null as Error | null,
} = {}) {
	return {
		initialize: jest.fn().mockResolvedValue({ authenticated, availableModels: [] }),
		send: sendError
			? jest.fn().mockRejectedValue(sendError)
			: jest.fn().mockResolvedValue(sendResult),
		cleanup: jest.fn().mockResolvedValue(undefined),
		get authenticated() {
			return authenticated;
		},
	};
}

describe('runSdkSmokeTest', () => {
	beforeEach(() => jest.clearAllMocks());

	test('returns success when API responds with non-empty content', async () => {
		const wrapper = makeMockWrapper({ sendResult: { content: 'ok', success: true } });
		const result = await runSdkSmokeTest({ wrapper, logger: silentLog });

		expect(result.success).toBe(true);
		expect(result.status).toBe('passed');
		expect(result.response).toEqual({ content: 'ok', success: true });
	});

	test('returns failure when SDK is not authenticated', async () => {
		const wrapper = makeMockWrapper({ authenticated: false });
		const result = await runSdkSmokeTest({ wrapper, logger: silentLog });

		expect(result.success).toBe(false);
		expect(result.status).toBe('failed');
		expect(wrapper.send).not.toHaveBeenCalled();
	});

	test('returns failure when response has empty content', async () => {
		const wrapper = makeMockWrapper({ sendResult: { content: '', success: false } });
		const result = await runSdkSmokeTest({ wrapper, logger: silentLog });

		expect(result.success).toBe(false);
		expect(result.status).toBe('failed');
	});

	test('returns failure when send() throws', async () => {
		const wrapper = makeMockWrapper({ sendError: new Error('Timeout after 30000ms') });
		const result = await runSdkSmokeTest({ wrapper, logger: silentLog });

		expect(result.success).toBe(false);
		expect(result.details).toContain('Timeout after 30000ms');
	});

	test('always calls cleanup even when not authenticated', async () => {
		const wrapper = makeMockWrapper({ authenticated: false });
		await runSdkSmokeTest({ wrapper, logger: silentLog });
		expect(wrapper.cleanup).toHaveBeenCalledTimes(1);
	});

	test('always calls cleanup even when send() throws', async () => {
		const wrapper = makeMockWrapper({ sendError: new Error('network error') });
		await runSdkSmokeTest({ wrapper, logger: silentLog });
		expect(wrapper.cleanup).toHaveBeenCalledTimes(1);
	});

	test('sends the exact smoke test prompt to send()', async () => {
		const wrapper = makeMockWrapper();
		await runSdkSmokeTest({ wrapper, logger: silentLog });

		expect(wrapper.send).toHaveBeenCalledWith(buildSmokeTestPrompt());
	});

	test('calls initialize() before send()', async () => {
		const order: string[] = [];
		const wrapper = {
			initialize: jest.fn().mockImplementation(async () => {
				order.push('initialize');
				return { authenticated: true, availableModels: [] };
			}),
			send: jest.fn().mockImplementation(async () => {
				order.push('send');
				return { content: 'ok', success: true };
			}),
			cleanup: jest.fn().mockResolvedValue(undefined),
			get authenticated() { return true; },
		};

		await runSdkSmokeTest({ wrapper, logger: silentLog });

		expect(order).toEqual(['initialize', 'send']);
	});
});
