"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
describe('Public API surface', () => {
    it('should export CopilotClient class', () => expect(index_1.CopilotClient).toBeDefined());
    it('should export CopilotSDKError class', () => expect(index_1.CopilotSDKError).toBeDefined());
    it('should export AuthenticationError class', () => expect(index_1.AuthenticationError).toBeDefined());
    it('should export APIError class', () => expect(index_1.APIError).toBeDefined());
    it('should export message utility functions', () => {
        expect(typeof index_1.createUserMessage).toBe('function');
        expect(typeof index_1.createSystemMessage).toBe('function');
        expect(typeof index_1.createAssistantMessage).toBe('function');
        expect(typeof index_1.createFunctionMessage).toBe('function');
        expect(typeof index_1.extractContent).toBe('function');
        expect(typeof index_1.hasRole).toBe('function');
        expect(typeof index_1.filterByRole).toBe('function');
    });
    it('should export stream utility functions', () => {
        expect(typeof index_1.parseSSELine).toBe('function');
        expect(typeof index_1.parseSSEChunk).toBe('function');
        expect(typeof index_1.extractDeltaContent).toBe('function');
        expect(typeof index_1.isStreamDone).toBe('function');
    });
    it('CopilotClient throws AuthenticationError when token is missing', () => {
        expect(() => new index_1.CopilotClient({ token: '' })).toThrow(index_1.AuthenticationError);
    });
    it('createUserMessage returns a user-role message', () => {
        const msg = (0, index_1.createUserMessage)('hello');
        expect(msg.role).toBe('user');
        expect(msg.content).toBe('hello');
    });
    it('parseSSELine returns null for [DONE] sentinel', () => {
        expect((0, index_1.parseSSELine)('data: [DONE]')).toBeNull();
    });
    it('CopilotSDKError is an instance of Error', () => {
        expect(new index_1.CopilotSDKError('test')).toBeInstanceOf(Error);
    });
    it('AuthenticationError is an instance of CopilotSDKError', () => {
        expect(new index_1.AuthenticationError('x')).toBeInstanceOf(index_1.CopilotSDKError);
    });
    it('APIError exposes statusCode', () => {
        expect(new index_1.APIError('Not Found', 404).statusCode).toBe(404);
    });
    it('should export SystemError class', () => expect(index_1.SystemError).toBeDefined());
    it('SystemError is an instance of CopilotSDKError', () => {
        expect(new index_1.SystemError('test')).toBeInstanceOf(index_1.CopilotSDKError);
    });
    it('should export CopilotSdkWrapper class', () => expect(index_1.CopilotSdkWrapper).toBeDefined());
    it('CopilotSdkWrapper initialises with no session', () => {
        const wrapper = new index_1.CopilotSdkWrapper();
        expect(wrapper.session).toBeNull();
    });
    it('should export approveAll function', () => expect(typeof index_1.approveAll).toBe('function'));
    it('should export auth utility functions', () => {
        expect(typeof index_1.isGitHubToken).toBe('function');
        expect(typeof index_1.resolveHmacFromEnv).toBe('function');
        expect(typeof index_1.resolveAuthPriority).toBe('function');
    });
    it('isGitHubToken recognises gho_ prefix', () => {
        expect((0, index_1.isGitHubToken)('gho_abc')).toBe(true);
        expect((0, index_1.isGitHubToken)('sk-abc')).toBe(false);
    });
    it('resolveHmacFromEnv returns null when vars are absent', () => {
        expect((0, index_1.resolveHmacFromEnv)({})).toBeNull();
    });
    it('resolveAuthPriority returns github-token method for explicit token', () => {
        const result = (0, index_1.resolveAuthPriority)({ githubToken: 'gho_test' }, {});
        expect(result?.method).toBe('github-token');
    });
    it('should export hook factory functions', () => {
        expect(typeof index_1.createHooks).toBe('function');
        expect(typeof index_1.approveAllTools).toBe('function');
        expect(typeof index_1.denyTools).toBe('function');
    });
    it('approveAllTools returns a PermissionHandler function', () => {
        const handler = (0, index_1.approveAllTools)();
        expect(typeof handler).toBe('function');
    });
    it('denyTools returns a handler that denies listed tools', () => {
        const handler = (0, index_1.denyTools)(['bash'], 'blocked');
        const denied = handler({ timestamp: 0, cwd: '/', toolName: 'bash', toolArgs: {} }, { sessionId: 'test' });
        expect(denied).toMatchObject({ permissionDecision: 'deny' });
    });
    it('createHooks returns an object with the provided hooks', () => {
        const onPreToolUse = jest.fn();
        const hooks = (0, index_1.createHooks)({ onPreToolUse });
        expect(hooks.onPreToolUse).toBe(onPreToolUse);
    });
});
