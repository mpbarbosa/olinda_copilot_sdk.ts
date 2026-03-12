import {
	CopilotClient,
	CopilotSDKError,
	AuthenticationError,
	APIError,
	SystemError,
	createUserMessage,
	createSystemMessage,
	createAssistantMessage,
	createFunctionMessage,
	extractContent,
	hasRole,
	filterByRole,
	parseSSELine,
	parseSSEChunk,
	extractDeltaContent,
	isStreamDone,
	isGitHubToken,
	resolveHmacFromEnv,
	resolveAuthPriority,
	createHooks,
	approveAllTools,
	denyTools,
} from '../src/index';

describe('Public API surface', () => {
	it('should export CopilotClient class', () => expect(CopilotClient).toBeDefined());
	it('should export CopilotSDKError class', () => expect(CopilotSDKError).toBeDefined());
	it('should export AuthenticationError class', () => expect(AuthenticationError).toBeDefined());
	it('should export APIError class', () => expect(APIError).toBeDefined());

	it('should export message utility functions', () => {
		expect(typeof createUserMessage).toBe('function');
		expect(typeof createSystemMessage).toBe('function');
		expect(typeof createAssistantMessage).toBe('function');
		expect(typeof createFunctionMessage).toBe('function');
		expect(typeof extractContent).toBe('function');
		expect(typeof hasRole).toBe('function');
		expect(typeof filterByRole).toBe('function');
	});

	it('should export stream utility functions', () => {
		expect(typeof parseSSELine).toBe('function');
		expect(typeof parseSSEChunk).toBe('function');
		expect(typeof extractDeltaContent).toBe('function');
		expect(typeof isStreamDone).toBe('function');
	});

	it('CopilotClient throws AuthenticationError when token is missing', () => {
		expect(() => new CopilotClient({ token: '' })).toThrow(AuthenticationError);
	});

	it('createUserMessage returns a user-role message', () => {
		const msg = createUserMessage('hello');
		expect(msg.role).toBe('user');
		expect(msg.content).toBe('hello');
	});

	it('parseSSELine returns null for [DONE] sentinel', () => {
		expect(parseSSELine('data: [DONE]')).toBeNull();
	});

	it('CopilotSDKError is an instance of Error', () => {
		expect(new CopilotSDKError('test')).toBeInstanceOf(Error);
	});

	it('AuthenticationError is an instance of CopilotSDKError', () => {
		expect(new AuthenticationError('x')).toBeInstanceOf(CopilotSDKError);
	});

	it('APIError exposes statusCode', () => {
		expect(new APIError('Not Found', 404).statusCode).toBe(404);
	});

	it('should export SystemError class', () => expect(SystemError).toBeDefined());

	it('SystemError is an instance of CopilotSDKError', () => {
		expect(new SystemError('test')).toBeInstanceOf(CopilotSDKError);
	});

	it('should export auth utility functions', () => {
		expect(typeof isGitHubToken).toBe('function');
		expect(typeof resolveHmacFromEnv).toBe('function');
		expect(typeof resolveAuthPriority).toBe('function');
	});

	it('isGitHubToken recognises gho_ prefix', () => {
		expect(isGitHubToken('gho_abc')).toBe(true);
		expect(isGitHubToken('sk-abc')).toBe(false);
	});

	it('resolveHmacFromEnv returns null when vars are absent', () => {
		expect(resolveHmacFromEnv({})).toBeNull();
	});

	it('resolveAuthPriority returns github-token method for explicit token', () => {
		const result = resolveAuthPriority({ githubToken: 'gho_test' }, {});
		expect(result?.method).toBe('github-token');
	});

	it('should export hook factory functions', () => {
		expect(typeof createHooks).toBe('function');
		expect(typeof approveAllTools).toBe('function');
		expect(typeof denyTools).toBe('function');
	});

	it('approveAllTools returns a handler that approves every tool', () => {
		const handler = approveAllTools();
		const result = handler(
			{ timestamp: 0, cwd: '/', toolName: 'bash', toolArgs: {} },
			{ sessionId: 'test' },
		);
		expect(result).toEqual({ permissionDecision: 'allow' });
	});

	it('denyTools returns a handler that denies listed tools', () => {
		const handler = denyTools(['bash'], 'blocked');
		const denied = handler(
			{ timestamp: 0, cwd: '/', toolName: 'bash', toolArgs: {} },
			{ sessionId: 'test' },
		);
		expect(denied).toMatchObject({ permissionDecision: 'deny' });
	});

	it('createHooks returns an object with the provided hooks', () => {
		const onPreToolUse = approveAllTools();
		const hooks = createHooks({ onPreToolUse });
		expect(hooks.onPreToolUse).toBe(onPreToolUse);
	});
});
