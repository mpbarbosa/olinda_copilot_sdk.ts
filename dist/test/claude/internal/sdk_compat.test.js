"use strict";
/**
 * Load a fresh sdk_compat module instance backed by a controlled SDK stub.
 * Uses jest.doMock + jest.resetModules to bypass the module-level import cache
 * in sdk_compat.ts, ensuring each test starts with sdkCompatCache = undefined.
 */
function loadFreshModule(sdkStub) {
    jest.doMock('@anthropic-ai/claude-agent-sdk', () => sdkStub);
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../../src/claude/internal/sdk_compat');
}
afterEach(() => {
    jest.dontMock('@anthropic-ai/claude-agent-sdk');
    jest.resetModules();
});
describe('getClaudeStartup', () => {
    it('returns the startup function when the SDK exports it', async () => {
        const startupFn = jest.fn();
        const { getClaudeStartup } = loadFreshModule({ startup: startupFn });
        const result = await getClaudeStartup();
        expect(result).toBe(startupFn);
    });
    it('throws when startup is not exported by the SDK', async () => {
        const { getClaudeStartup } = loadFreshModule({});
        await expect(getClaudeStartup()).rejects.toThrow('startup() is not available in this version of @anthropic-ai/claude-agent-sdk');
        // Second call uses cached empty SDK object — still throws
        await expect(getClaudeStartup()).rejects.toThrow('startup() is not available in this version of @anthropic-ai/claude-agent-sdk');
    });
});
describe('getClaudeDeleteSession', () => {
    it('returns the deleteSession function when the SDK exports it', async () => {
        const deleteSessionFn = jest.fn();
        const { getClaudeDeleteSession } = loadFreshModule({ deleteSession: deleteSessionFn });
        const result = await getClaudeDeleteSession();
        expect(result).toBe(deleteSessionFn);
    });
    it('throws when deleteSession is not exported by the SDK', async () => {
        const { getClaudeDeleteSession } = loadFreshModule({});
        await expect(getClaudeDeleteSession()).rejects.toThrow('deleteSession() is not available in this version of @anthropic-ai/claude-agent-sdk');
        await expect(getClaudeDeleteSession()).rejects.toThrow('deleteSession() is not available in this version of @anthropic-ai/claude-agent-sdk');
    });
});
