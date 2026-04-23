"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_wrapper_1 = require("../../src/claude/sdk_wrapper");
const errors_1 = require("../../src/claude/errors");
// ---------------------------------------------------------------------------
// Mock @anthropic-ai/claude-agent-sdk
// ---------------------------------------------------------------------------
const mockQuery = jest.fn();
const mockStartup = jest.fn();
const mockListSessions = jest.fn();
const mockGetSessionInfo = jest.fn();
const mockDeleteSession = jest.fn();
const mockRenameSession = jest.fn();
const mockGetSessionMessages = jest.fn();
jest.mock('@anthropic-ai/claude-agent-sdk', () => ({
    query: (...args) => mockQuery(...args),
    startup: (...args) => mockStartup(...args),
    listSessions: (...args) => mockListSessions(...args),
    getSessionInfo: (...args) => mockGetSessionInfo(...args),
    deleteSession: (...args) => mockDeleteSession(...args),
    renameSession: (...args) => mockRenameSession(...args),
    getSessionMessages: (...args) => mockGetSessionMessages(...args),
}));
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Creates an async generator that yields the provided messages. */
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
// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('ClaudeSdkWrapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default: query returns a successful assistant + result sequence
        mockQuery.mockImplementation(() => makeGen([assistantMsg, resultSuccessMsg]));
        mockStartup.mockResolvedValue({
            query: jest.fn().mockReturnValue(makeGen([assistantMsg, resultSuccessMsg])),
            close: jest.fn(),
            [Symbol.asyncDispose]: jest.fn(),
        });
        mockListSessions.mockResolvedValue([{ sessionId }]);
        mockGetSessionInfo.mockResolvedValue({ sessionId });
        mockDeleteSession.mockResolvedValue(undefined);
        mockRenameSession.mockResolvedValue(undefined);
        mockGetSessionMessages.mockResolvedValue([]);
    });
    // -------------------------------------------------------------------------
    // constructor
    // -------------------------------------------------------------------------
    describe('constructor', () => {
        it('should initialize with default options', () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            expect(wrapper.warmed).toBe(false);
            expect(wrapper.warmQuery).toBeNull();
        });
        it('should store provided options', () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper({
                model: 'claude-opus-4-7',
                cwd: '/tmp/project',
                permissionMode: 'acceptEdits',
                maxTurns: 5,
                systemPrompt: 'Be brief.',
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const w = wrapper;
            expect(w._model).toBe('claude-opus-4-7');
            expect(w._cwd).toBe('/tmp/project');
            expect(w._permissionMode).toBe('acceptEdits');
            expect(w._maxTurns).toBe(5);
            expect(w._systemPrompt).toBe('Be brief.');
        });
    });
    // -------------------------------------------------------------------------
    // isAvailable
    // -------------------------------------------------------------------------
    describe('isAvailable', () => {
        it('should return true when the SDK stub is loaded', () => {
            expect(sdk_wrapper_1.ClaudeSdkWrapper.isAvailable()).toBe(true);
        });
    });
    // -------------------------------------------------------------------------
    // warmup
    // -------------------------------------------------------------------------
    describe('warmup', () => {
        it('should call startup() and mark the wrapper as warmed', async () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper({ model: 'claude-sonnet-4-5', cwd: '/tmp' });
            const result = await wrapper.warmup();
            expect(result).toEqual({ warmed: true });
            expect(wrapper.warmed).toBe(true);
            expect(wrapper.warmQuery).not.toBeNull();
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
    // -------------------------------------------------------------------------
    // run
    // -------------------------------------------------------------------------
    describe('run', () => {
        it('should return RunResult with collected text on success', async () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            const result = await wrapper.run('Hello');
            expect(result.success).toBe(true);
            expect(result.content).toBe('Hello from Claude');
            expect(result.sessionId).toBe(sessionId);
            expect(result.totalCostUsd).toBe(0.001);
            expect(result.numTurns).toBe(2);
            expect(result.durationMs).toBe(1500);
        });
        it('should pass prompt and merged options to query()', async () => {
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
        it('should use warm query when warmed and set warmQuery to null after use', async () => {
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
    // -------------------------------------------------------------------------
    // Serialisation
    // -------------------------------------------------------------------------
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
    // -------------------------------------------------------------------------
    // Session utilities
    // -------------------------------------------------------------------------
    describe('listSessions', () => {
        it('should delegate to SDK listSessions', async () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            const sessions = await wrapper.listSessions({ limit: 5 });
            expect(mockListSessions).toHaveBeenCalledWith({ limit: 5 });
            expect(sessions).toEqual([{ sessionId }]);
        });
    });
    describe('getSessionInfo', () => {
        it('should delegate to SDK getSessionInfo', async () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            const info = await wrapper.getSessionInfo(sessionId, { dir: '/tmp' });
            expect(mockGetSessionInfo).toHaveBeenCalledWith(sessionId, { dir: '/tmp' });
            expect(info).toEqual({ sessionId });
        });
    });
    describe('deleteSession', () => {
        it('should delegate to SDK deleteSession', async () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            await wrapper.deleteSession(sessionId);
            expect(mockDeleteSession).toHaveBeenCalledWith(sessionId, undefined);
        });
    });
    describe('renameSession', () => {
        it('should delegate to SDK renameSession', async () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            await wrapper.renameSession(sessionId, 'New Title');
            expect(mockRenameSession).toHaveBeenCalledWith(sessionId, 'New Title', undefined);
        });
    });
    describe('getSessionMessages', () => {
        it('should delegate to SDK getSessionMessages', async () => {
            const wrapper = new sdk_wrapper_1.ClaudeSdkWrapper();
            const messages = await wrapper.getSessionMessages(sessionId, { limit: 10 });
            expect(mockGetSessionMessages).toHaveBeenCalledWith(sessionId, { limit: 10 });
            expect(messages).toEqual([]);
        });
    });
});
