"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const run_mapping_1 = require("../../../src/claude/internal/run_mapping");
const errors_js_1 = require("../../../src/claude/errors.js");
describe('extractAssistantText', () => {
    it('returns concatenated text from valid text blocks', () => {
        const content = [
            { type: 'text', text: 'Hello ' },
            { type: 'text', text: 'world!' },
        ];
        expect((0, run_mapping_1.extractAssistantText)(content)).toBe('Hello world!');
    });
    it('returns empty string for non-array input', () => {
        expect((0, run_mapping_1.extractAssistantText)(null)).toBe('');
        expect((0, run_mapping_1.extractAssistantText)(undefined)).toBe('');
        expect((0, run_mapping_1.extractAssistantText)({})).toBe('');
        expect((0, run_mapping_1.extractAssistantText)('string')).toBe('');
        expect((0, run_mapping_1.extractAssistantText)(123)).toBe('');
    });
    it('ignores non-text blocks in the array', () => {
        const content = [
            { type: 'text', text: 'foo' },
            { type: 'image', url: 'bar' },
            { type: 'text', text: 'baz' },
            { type: 'text', text: '' },
            { type: 'other', text: 'should not appear' },
        ];
        expect((0, run_mapping_1.extractAssistantText)(content)).toBe('foobaz');
    });
    it('returns empty string for array with no valid text blocks', () => {
        const content = [
            { type: 'image', url: 'bar' },
            { type: 'other', text: 'nope' },
        ];
        expect((0, run_mapping_1.extractAssistantText)(content)).toBe('');
    });
    it('handles text blocks with empty string', () => {
        const content = [
            { type: 'text', text: '' },
            { type: 'text', text: 'a' },
        ];
        expect((0, run_mapping_1.extractAssistantText)(content)).toBe('a');
    });
});
describe('collectClaudeRunResult', () => {
    const makeAssistantMsg = (content, session_id = 'sess1') => ({
        type: 'assistant',
        session_id,
        message: { content },
    });
    const makeResultMsg = (subtype, session_id = 'sess1', extras = {}) => ({
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
            for (const m of messages)
                yield m;
        })();
        const result = await (0, run_mapping_1.collectClaudeRunResult)(asyncIter);
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
        const messages = [];
        const asyncIter = (async function* () {
            for (const m of messages)
                yield m;
        })();
        const result = await (0, run_mapping_1.collectClaudeRunResult)(asyncIter);
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
            for (const m of messages)
                yield m;
        })();
        await expect((0, run_mapping_1.collectClaudeRunResult)(makeIter())).rejects.toThrow(errors_js_1.ClaudeSDKError);
        await expect((0, run_mapping_1.collectClaudeRunResult)(makeIter())).rejects.toThrow('Run failed: bad input');
    });
    it('throws ClaudeSDKError on non-success result subtype with no errors array', async () => {
        const messages = [makeResultMsg('failure', 'sess3')];
        const makeIter = () => (async function* () {
            for (const m of messages)
                yield m;
        })();
        await expect((0, run_mapping_1.collectClaudeRunResult)(makeIter())).rejects.toThrow(errors_js_1.ClaudeSDKError);
        await expect((0, run_mapping_1.collectClaudeRunResult)(makeIter())).rejects.toThrow('Run failed: failure');
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
            for (const m of messages)
                yield m;
        })();
        const result = await (0, run_mapping_1.collectClaudeRunResult)(asyncIter);
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
            for (const m of messages)
                yield m;
        })();
        const result = await (0, run_mapping_1.collectClaudeRunResult)(asyncIter);
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
            for (const m of messages)
                yield m;
        })();
        const result = await (0, run_mapping_1.collectClaudeRunResult)(asyncIter);
        expect(result.content).toBe('');
        expect(result.success).toBe(true);
    });
});
