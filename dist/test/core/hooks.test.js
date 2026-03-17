"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hooks_js_1 = require("../../src/core/hooks.js");
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const baseInput = {
    timestamp: Date.now(),
    cwd: '/workspace',
};
function makePreInput(toolName, toolArgs = {}) {
    return { ...baseInput, toolName, toolArgs };
}
const invocation = { sessionId: 'sess-001' };
// ---------------------------------------------------------------------------
// createHooks
// ---------------------------------------------------------------------------
describe('createHooks', () => {
    it('returns an empty SessionHooks when given an empty config', () => {
        const hooks = (0, hooks_js_1.createHooks)({});
        expect(hooks).toEqual({});
    });
    it('preserves a single handler', () => {
        const handler = jest.fn();
        const hooks = (0, hooks_js_1.createHooks)({ onPreToolUse: handler });
        expect(hooks.onPreToolUse).toBe(handler);
    });
    it('preserves all six handlers when provided', () => {
        const config = {
            onPreToolUse: jest.fn(),
            onPostToolUse: jest.fn(),
            onUserPromptSubmitted: jest.fn(),
            onSessionStart: jest.fn(),
            onSessionEnd: jest.fn(),
            onErrorOccurred: jest.fn(),
        };
        const hooks = (0, hooks_js_1.createHooks)(config);
        expect(hooks.onPreToolUse).toBe(config.onPreToolUse);
        expect(hooks.onPostToolUse).toBe(config.onPostToolUse);
        expect(hooks.onUserPromptSubmitted).toBe(config.onUserPromptSubmitted);
        expect(hooks.onSessionStart).toBe(config.onSessionStart);
        expect(hooks.onSessionEnd).toBe(config.onSessionEnd);
        expect(hooks.onErrorOccurred).toBe(config.onErrorOccurred);
    });
    it('does not mutate the original config object', () => {
        const config = { onPreToolUse: jest.fn() };
        (0, hooks_js_1.createHooks)(config);
        expect(Object.keys(config)).toHaveLength(1);
    });
    it('result is assignable as SessionHooks', () => {
        const hooks = (0, hooks_js_1.createHooks)({});
        expect(hooks).toBeDefined();
    });
});
// ---------------------------------------------------------------------------
// approveAllTools
// ---------------------------------------------------------------------------
describe('approveAllTools', () => {
    it('returns a function', () => {
        expect(typeof (0, hooks_js_1.approveAllTools)()).toBe('function');
    });
    it('returns the same approveAll reference each call', () => {
        expect((0, hooks_js_1.approveAllTools)()).toBe((0, hooks_js_1.approveAllTools)());
    });
    it('result is assignable as PermissionHandler (type-level)', () => {
        const handler = (0, hooks_js_1.approveAllTools)();
        expect(handler).toBeDefined();
    });
    it('handler is synchronous (no Promise)', () => {
        const handler = (0, hooks_js_1.approveAllTools)();
        const result = handler({ kind: 'shell' }, { sessionId: 'sess-001' });
        expect(result).not.toBeInstanceOf(Promise);
    });
    it('returns same handler reference (delegates to SDK approveAll)', () => {
        const h1 = (0, hooks_js_1.approveAllTools)();
        const h2 = (0, hooks_js_1.approveAllTools)();
        expect(h1).toBe(h2);
    });
});
// ---------------------------------------------------------------------------
// denyTools
// ---------------------------------------------------------------------------
describe('denyTools', () => {
    it('returns a function', () => {
        expect(typeof (0, hooks_js_1.denyTools)([])).toBe('function');
    });
    it('denies a single listed tool', () => {
        const handler = (0, hooks_js_1.denyTools)(['bash']);
        const result = handler(makePreInput('bash'), invocation);
        expect(result).toMatchObject({ permissionDecision: 'deny' });
    });
    it('denies multiple listed tools', () => {
        const handler = (0, hooks_js_1.denyTools)(['bash', 'write_file', 'python']);
        for (const name of ['bash', 'write_file', 'python']) {
            const result = handler(makePreInput(name), invocation);
            expect(result.permissionDecision).toBe('deny');
        }
    });
    it('returns void for unlisted tools', () => {
        const handler = (0, hooks_js_1.denyTools)(['bash']);
        const result = handler(makePreInput('read_file'), invocation);
        expect(result).toBeUndefined();
    });
    it('returns void for all tools when list is empty', () => {
        const handler = (0, hooks_js_1.denyTools)([]);
        const result = handler(makePreInput('bash'), invocation);
        expect(result).toBeUndefined();
    });
    it('includes the reason when provided', () => {
        const handler = (0, hooks_js_1.denyTools)(['bash'], 'blocked by policy');
        const result = handler(makePreInput('bash'), invocation);
        expect(result.permissionDecisionReason).toBe('blocked by policy');
    });
    it('omits permissionDecisionReason when no reason is given', () => {
        const handler = (0, hooks_js_1.denyTools)(['bash']);
        const result = handler(makePreInput('bash'), invocation);
        expect(result).not.toHaveProperty('permissionDecisionReason');
    });
    it('does not include reason in the output for allowed tools', () => {
        const handler = (0, hooks_js_1.denyTools)(['bash'], 'blocked');
        const result = handler(makePreInput('read_file'), invocation);
        expect(result).toBeUndefined();
    });
    it('is case-sensitive for tool names', () => {
        const handler = (0, hooks_js_1.denyTools)(['Bash']);
        const result = handler(makePreInput('bash'), invocation);
        expect(result).toBeUndefined();
    });
    it('returns a synchronous result (no Promise)', () => {
        const handler = (0, hooks_js_1.denyTools)(['bash']);
        const result = handler(makePreInput('bash'), invocation);
        expect(result).not.toBeInstanceOf(Promise);
    });
    it('creates an independent handler each call', () => {
        expect((0, hooks_js_1.denyTools)(['bash'])).not.toBe((0, hooks_js_1.denyTools)(['bash']));
    });
    it('handler for different deny lists works independently', () => {
        const h1 = (0, hooks_js_1.denyTools)(['bash']);
        const h2 = (0, hooks_js_1.denyTools)(['python']);
        expect(h1(makePreInput('bash'), invocation)?.permissionDecision).toBe('deny');
        expect(h1(makePreInput('python'), invocation)).toBeUndefined();
        expect(h2(makePreInput('python'), invocation)?.permissionDecision).toBe('deny');
        expect(h2(makePreInput('bash'), invocation)).toBeUndefined();
    });
    it('works with a large deny list', () => {
        const names = Array.from({ length: 100 }, (_, i) => `tool_${i}`);
        const handler = (0, hooks_js_1.denyTools)(names);
        for (const name of names) {
            expect(handler(makePreInput(name), invocation)?.permissionDecision).toBe('deny');
        }
        expect(handler(makePreInput('unlisted'), invocation)).toBeUndefined();
    });
});
// ---------------------------------------------------------------------------
// Handler signature compatibility
// ---------------------------------------------------------------------------
describe('handler type compatibility', () => {
    it('createHooks preserves handler identity after round-trip', () => {
        const myHandler = jest.fn().mockReturnValue(undefined);
        const hooks = (0, hooks_js_1.createHooks)({ onPreToolUse: myHandler });
        hooks.onPreToolUse(makePreInput('bash'), invocation);
        expect(myHandler).toHaveBeenCalledTimes(1);
    });
    it('denyTools handler output includes only permissionDecision when no reason', () => {
        const handler = (0, hooks_js_1.denyTools)(['bash']);
        const result = handler(makePreInput('bash'), invocation);
        expect(Object.keys(result)).toEqual(['permissionDecision']);
    });
    it('UserPromptSubmittedHandler is assignable to UserPromptHandler (alias)', () => {
        const fn = async (_input, _inv) => ({ modifiedPrompt: 'hi' });
        const hooks = (0, hooks_js_1.createHooks)({ onUserPromptSubmitted: fn });
        expect(hooks.onUserPromptSubmitted).toBe(fn);
    });
    it('createHooks result is assignable to SessionHooks (SDK bridge check)', () => {
        const hooks = (0, hooks_js_1.createHooks)({
            onPreToolUse: jest.fn(),
            onPostToolUse: jest.fn(),
            onUserPromptSubmitted: jest.fn(),
            onSessionStart: jest.fn(),
            onSessionEnd: jest.fn(),
            onErrorOccurred: jest.fn(),
        });
        expect(hooks).toBeDefined();
        expect(Object.keys(hooks)).toHaveLength(6);
    });
});
