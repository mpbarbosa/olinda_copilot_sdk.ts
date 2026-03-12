import {
	CopilotClient,
	CopilotSDKError,
	AuthenticationError,
	APIError,
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
});
