import {
	extractAssistantText,
	collectClaudeRunResult,
} from '../../../src/claude/internal/run_mapping';
import { ClaudeSDKError } from '../../../src/claude/errors.js';

describe('extractAssistantText', () => {
	it('returns concatenated text from valid text blocks', () => {
		const content = [
			{ type: 'text', text: 'Hello ' },
			{ type: 'text', text: 'world!' },
		];
		expect(extractAssistantText(content)).toBe('Hello world!');
	});

	it('returns empty string for non-array input', () => {
		expect(extractAssistantText(null)).toBe('');
		expect(extractAssistantText(undefined)).toBe('');
		expect(extractAssistantText({})).toBe('');
		expect(extractAssistantText('string')).toBe('');
		expect(extractAssistantText(123)).toBe('');
	});

	it('ignores non-text blocks in the array', () => {
		const content = [
			{ type: 'text', text: 'foo' },
			{ type: 'image', url: 'bar' },
			{ type: 'text', text: 'baz' },
			{ type: 'text', text: '' },
			{ type: 'other', text: 'should not appear' },
		];
		expect(extractAssistantText(content)).toBe('foobaz');
	});

	it('returns empty string for array with no valid text blocks', () => {
		const content = [
			{ type: 'image', url: 'bar' },
			{ type: 'other', text: 'nope' },
		];
		expect(extractAssistantText(content)).toBe('');
	});

	it('handles text blocks with empty string', () => {
		const content = [
			{ type: 'text', text: '' },
			{ type: 'text', text: 'a' },
		];
		expect(extractAssistantText(content)).toBe('a');
	});
});

describe('collectClaudeRunResult', () => {
	const makeAssistantMsg = (content: unknown, session_id = 'sess1') => ({
		type: 'assistant',
		session_id,
		message: { content },
	});
	const makeResultMsg = (
		subtype: string,
		session_id = 'sess1',
		extras: Partial<Record<string, unknown>> = {},
	) => ({
		type: 'result',
		session_id,
		subtype,
		...extras,
	});

	it('aggregates assistant text and successful result', async () => {
		const messages = [
			makeAssistantMsg([{ type: 'text', text: 'Hello ' }]),
			makeAssistantMsg([{ type: 'text', text: 'world!' }]),
			makeResultMsg('success', 'sess1', {
				total_cost_usd: 1.23,
				num_turns: 2,
				duration_ms: 456,
			}),
		];
		const asyncIter = (async function* () {
			for (const m of messages) yield m as any;
		})();
		const result = await collectClaudeRunResult(asyncIter as any);
		expect(result).toEqual({
			content: 'Hello world!',
			sessionId: 'sess1',
			success: true,
			totalCostUsd: 1.23,
			numTurns: 2,
			durationMs: 456,
		});
	});

	it('returns empty content and false success if no assistant or result messages', async () => {
		const messages: unknown[] = [];
		const asyncIter = (async function* () {
			for (const m of messages) yield m as any;
		})();
		const result = await collectClaudeRunResult(asyncIter as any);
		expect(result).toEqual({
			content: '',
			sessionId: undefined,
			success: false,
			totalCostUsd: undefined,
			numTurns: undefined,
			durationMs: undefined,
		});
	});

	it('throws ClaudeSDKError on non-success result subtype with errors array', async () => {
		const messages = [
			makeResultMsg('failure', 'sess2', { errors: ['bad input'] }),
		];
		const makeIter = () => (async function* () {
			for (const m of messages) yield m as any;
		})();
		await expect(collectClaudeRunResult(makeIter())).rejects.toThrow(ClaudeSDKError);
		await expect(collectClaudeRunResult(makeIter())).rejects.toThrow('Run failed: bad input');
	});

	it('throws ClaudeSDKError on non-success result subtype with no errors array', async () => {
		const messages = [makeResultMsg('failure', 'sess3')];
		const makeIter = () => (async function* () {
			for (const m of messages) yield m as any;
		})();
		await expect(collectClaudeRunResult(makeIter())).rejects.toThrow(ClaudeSDKError);
		await expect(collectClaudeRunResult(makeIter())).rejects.toThrow('Run failed: failure');
	});

	it('handles assistant and result messages with different session IDs', async () => {
		const messages = [
			makeAssistantMsg([{ type: 'text', text: 'foo' }], 'sessA'),
			makeResultMsg('success', 'sessB', {
				total_cost_usd: 0.5,
				num_turns: 1,
				duration_ms: 100,
			}),
		];
		const asyncIter = (async function* () {
			for (const m of messages) yield m as any;
		})();
		const result = await collectClaudeRunResult(asyncIter as any);
		expect(result.sessionId).toBe('sessB');
		expect(result.content).toBe('foo');
		expect(result.success).toBe(true);
	});

	it('ignores messages with unknown type', async () => {
		const messages = [
			{ type: 'foo', session_id: 'sessX', message: { content: [] } },
			makeAssistantMsg([{ type: 'text', text: 'bar' }], 'sessX'),
			makeResultMsg('success', 'sessX', {
				total_cost_usd: 0.1,
				num_turns: 1,
				duration_ms: 10,
			}),
		];
		const asyncIter = (async function* () {
			for (const m of messages) yield m as any;
		})();
		const result = await collectClaudeRunResult(asyncIter as any);
		expect(result.content).toBe('bar');
		expect(result.success).toBe(true);
	});

	it('handles assistant message with non-array content gracefully', async () => {
		const messages = [
			makeAssistantMsg('not-an-array'),
			makeResultMsg('success', 'sess1', {
				total_cost_usd: 0.2,
				num_turns: 1,
				duration_ms: 20,
			}),
		];
		const asyncIter = (async function* () {
			for (const m of messages) yield m as any;
		})();
		const result = await collectClaudeRunResult(asyncIter as any);
		expect(result.content).toBe('');
		expect(result.success).toBe(true);
	});
});
