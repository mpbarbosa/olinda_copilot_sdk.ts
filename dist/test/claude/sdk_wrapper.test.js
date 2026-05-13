"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_wrapper_1 = require("../../src/claude/sdk_wrapper");
const errors_1 = require("../../src/claude/errors");
const mockQuery = jest.fn();
const mockStartup = jest.fn();
jest.mock('@anthropic-ai/claude-agent-sdk', () => ({
    query: (...args) => mockQuery(...args),
    startup: (...args) => mockStartup(...args),
}));
async function* makeGen(messages) {
    for (const msg of messages)
        yield msg;
}
const sessionId = 'sess-00000000';
const assistantMsg = {
    type: 'assistant',
    session_id: sessionId,
    message: { content: [{ type: 'text', text: 'Hello from Claude' }] },
    parent_tool_use_id: null,
    uuid: '00000000-0000-0000-0000-000000000001',
};
const resultSuccessMsg = {
    type: 'result',
    subtype: 'success',
    session_id: sessionId,
    result: 'done',
    total_cost_usd: 0.001,
    num_turns: 2,
    duration_ms: 1500,
    duration_api_ms: 1200,
    is_error: false,
    stop_reason: 'end_turn',
    usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
    modelUsage: {},
    permission_denials: [],
    uuid: '00000000-0000-0000-0000-000000000002',
};
const resultErrorMsg = {
    type: 'result',
    subtype: 'error_during_execution',
    session_id: sessionId,
    errors: ['Something went wrong'],
    is_error: true,
    num_turns: 1,
    duration_ms: 500,
    duration_api_ms: 400,
    stop_reason: null,
    total_cost_usd: 0,
    usage: { input_tokens: 5, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
    modelUsage: {},
    permission_denials: [],
    uuid: '00000000-0000-0000-0000-000000000003',
};
describe('ClaudeSdkWrapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockQuery.mockImplementation(() => makeGen([assistantMsg, resultSuccessMsg]));
        mockStartup.mockResolvedValue({
            query: jest.fn().mockReturnValue(makeGen([assistantMsg, resultSuccessMsg])),
            close: jest.fn(),
            [Symbol.asyncDispose]: jest.fn(),
        });
    });
    describe('constructor', () => {
        it('should initialize with default options', () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            expect(wrapper.warmed).toBe(false);
        });
        it('should report warmed state only after warmup', async () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper({
                model: 'claude-opus-4-7',
                cwd: '/tmp/project',
                permissionMode: 'acceptEdits',
                maxTurns: 5,
                systemPrompt: 'Be brief.',
            });
            expect(wrapper.warmed).toBe(false);
            await wrapper.warmup();
            expect(wrapper.warmed).toBe(true);
        });
    });
    describe('isAvailable', () => {
        it('should return true when the SDK stub is loaded', () => {
            expect(sdk_wrapper_1.ClaudeSdkWrapper.isAvailable()).toBe(true);
        });
    });
    describe('warmup', () => {
        it('should call startup() and mark the wrapper as warmed', async () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper({ model: 'claude-sonnet-4-5', cwd: '/tmp' });
            const result = await wrapper.warmup();
            expect(result).toEqual({ warmed: true });
            expect(wrapper.warmed).toBe(true);
            expect(mockStartup).toHaveBeenCalledTimes(1);
        });
        it('should pass wrapper defaults to startup options', async () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper({ model: 'claude-haiku-4-5', maxTurns: 3 });
            await wrapper.warmup();
            const callArgs = mockStartup.mock.calls[0][0];
            expect(callArgs.options.model).toBe('claude-haiku-4-5');
            expect(callArgs.options.maxTurns).toBe(3);
        });
        it('should forward initializeTimeoutMs to startup', async () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            await wrapper.warmup(5000);
            expect(mockStartup).toHaveBeenCalledWith(expect.objectContaining({ initializeTimeoutMs: 5000 }));
        });
    });
    describe('run', () => {
        it('should return ClaudeRunResult with collected text on success', async () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            const result = await wrapper.run('Hello');
            expect(result.success).toBe(true);
            expect(result.content).toBe('Hello from Claude');
            expect(result.sessionId).toBe(sessionId);
            expect(result.totalCostUsd).toBe(0.001);
            expect(result.numTurns).toBe(2);
            expect(result.durationMs).toBe(1500);
        });
        it('should pass prompt and merged wrapper overrides to query()', async () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper({ model: 'claude-sonnet-4-5', cwd: '/my/dir' });
            await wrapper.run('Do something', { maxTurns: 10 });
            expect(mockQuery).toHaveBeenCalledWith(expect.objectContaining({
                prompt: 'Do something',
                options: expect.objectContaining({
                    model: 'claude-sonnet-4-5',
                    cwd: '/my/dir',
                    maxTurns: 10,
                }),
            }));
        });
        it('should throw ClaudeSDKError when result subtype is an error', async () => {
            mockQuery.mockImplementationOnce(() => makeGen([resultErrorMsg]));
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            await expect(wrapper.run('Fail please')).rejects.toThrow(errors_1.ClaudeSDKError);
        });
        it('should include the error message from the result in ClaudeSDKError', async () => {
            mockQuery.mockImplementationOnce(() => makeGen([resultErrorMsg]));
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            await expect(wrapper.run('Fail please')).rejects.toThrow('Something went wrong');
        });
        it('should use warm query when warmed and clear warmed state after use', async () => {
            const warmQueryMock = {
                query: jest.fn().mockReturnValue(makeGen([assistantMsg, resultSuccessMsg])),
                close: jest.fn(),
                [Symbol.asyncDispose]: jest.fn(),
            };
            mockStartup.mockResolvedValueOnce(warmQueryMock);
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            await wrapper.warmup();
            expect(wrapper.warmed).toBe(true);
            const result = await wrapper.run('warm prompt');
            expect(warmQueryMock.query).toHaveBeenCalledWith('warm prompt');
            expect(mockQuery).not.toHaveBeenCalled();
            expect(wrapper.warmed).toBe(false);
            expect(result.success).toBe(true);
        });
        it('should concatenate text from multiple assistant messages', async () => {
            const msg1 = { ...assistantMsg, message: { content: [{ type: 'text', text: 'Part 1 ' }] } };
            const msg2 = { ...assistantMsg, message: { content: [{ type: 'text', text: 'Part 2' }] } };
            mockQuery.mockImplementationOnce(() => makeGen([msg1, msg2, resultSuccessMsg]));
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            const result = await wrapper.run('Multi-turn');
            expect(result.content).toBe('Part 1 Part 2');
        });
    });
    describe('serialisation', () => {
        it('should serialise concurrent run() calls', async () => {
            const order = [];
            mockQuery
                .mockImplementationOnce(() => {
                return (async function* () {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    order.push(1);
                    yield assistantMsg;
                    yield resultSuccessMsg;
                })();
            })
                .mockImplementationOnce(() => {
                return (async function* () {
                    order.push(2);
                    yield assistantMsg;
                    yield resultSuccessMsg;
                })();
            });
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            await Promise.all([wrapper.run('first'), wrapper.run('second')]);
            expect(order).toEqual([1, 2]);
        });
    });
});
