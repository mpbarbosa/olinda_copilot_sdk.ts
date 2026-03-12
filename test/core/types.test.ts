import type {
	MessageRole,
	Message,
	CompletionRequest,
	CompletionChoice,
	CompletionResponse,
	StreamDelta,
	StreamChoice,
	StreamChunk,
	ClientOptions,
} from '../../src/core/types';

describe('core/types', () => {
	describe('MessageRole', () => {
		it('should allow valid roles', () => {
			const roles: MessageRole[] = ['system', 'user', 'assistant', 'function'];
			roles.forEach(role => {
				expect(['system', 'user', 'assistant', 'function']).toContain(role);
			});
		});
	});

	describe('Message', () => {
		it('should create a user message', () => {
			const msg: Message = { role: 'user', content: 'Hello!' };
			expect(msg.role).toBe('user');
			expect(msg.content).toBe('Hello!');
			expect(msg.name).toBeUndefined();
		});

		it('should create a function message with name', () => {
			const msg: Message = { role: 'function', content: 'result', name: 'myFunc' };
			expect(msg.role).toBe('function');
			expect(msg.name).toBe('myFunc');
		});
	});

	describe('CompletionRequest', () => {
		it('should create a valid completion request', () => {
			const req: CompletionRequest = {
				messages: [{ role: 'user', content: 'Hi' }],
				model: 'gpt-4o',
				stream: false,
				temperature: 1,
				max_tokens: 100,
			};
			expect(req.model).toBe('gpt-4o');
			expect(req.stream).toBe(false);
			expect(req.temperature).toBe(1);
			expect(req.max_tokens).toBe(100);
		});

		it('should allow minimal completion request', () => {
			const req: CompletionRequest = {
				messages: [{ role: 'user', content: 'Hi' }],
			};
			expect(req.messages.length).toBe(1);
			expect(req.model).toBeUndefined();
			expect(req.stream).toBeUndefined();
		});
	});

	describe('CompletionChoice', () => {
		it('should create a completion choice', () => {
			const choice: CompletionChoice = {
				index: 0,
				message: { role: 'assistant', content: 'Hello!' },
				finish_reason: 'stop',
			};
			expect(choice.index).toBe(0);
			expect(choice.message.role).toBe('assistant');
			expect(choice.finish_reason).toBe('stop');
		});

		it('should allow null finish_reason', () => {
			const choice: CompletionChoice = {
				index: 1,
				message: { role: 'assistant', content: 'Done.' },
				finish_reason: null,
			};
			expect(choice.finish_reason).toBeNull();
		});
	});

	describe('CompletionResponse', () => {
		it('should create a completion response', () => {
			const resp: CompletionResponse = {
				id: 'abc123',
				object: 'chat.completion',
				created: 1234567890,
				model: 'gpt-4o',
				choices: [
					{
						index: 0,
						message: { role: 'assistant', content: 'Hi!' },
						finish_reason: 'stop',
					},
				],
			};
			expect(resp.id).toBe('abc123');
			expect(resp.object).toBe('chat.completion');
			expect(resp.choices.length).toBe(1);
		});
	});

	describe('StreamDelta', () => {
		it('should create a stream delta with role and content', () => {
			const delta: StreamDelta = { role: 'assistant', content: 'Hi' };
			expect(delta.role).toBe('assistant');
			expect(delta.content).toBe('Hi');
		});

		it('should allow partial stream delta', () => {
			const delta: StreamDelta = {};
			expect(delta.role).toBeUndefined();
			expect(delta.content).toBeUndefined();
		});
	});

	describe('StreamChoice', () => {
		it('should create a stream choice', () => {
			const choice: StreamChoice = {
				index: 0,
				delta: { content: 'Hi' },
				finish_reason: null,
			};
			expect(choice.index).toBe(0);
			expect(choice.delta.content).toBe('Hi');
			expect(choice.finish_reason).toBeNull();
		});
	});

	describe('StreamChunk', () => {
		it('should create a stream chunk', () => {
			const chunk: StreamChunk = {
				id: 'chunk1',
				object: 'chat.completion.chunk',
				created: 1234567890,
				model: 'gpt-4o',
				choices: [
					{
						index: 0,
						delta: { content: 'Hi' },
						finish_reason: null,
					},
				],
			};
			expect(chunk.id).toBe('chunk1');
			expect(chunk.object).toBe('chat.completion.chunk');
			expect(chunk.choices.length).toBe(1);
		});
	});

	describe('ClientOptions', () => {
		it('should create client options with all fields', () => {
			const opts: ClientOptions = {
				token: 'token123',
				baseUrl: 'https://api.githubcopilot.com',
				model: 'gpt-4o',
			};
			expect(opts.token).toBe('token123');
			expect(opts.baseUrl).toBe('https://api.githubcopilot.com');
			expect(opts.model).toBe('gpt-4o');
		});

		it('should require token', () => {
			const opts: ClientOptions = { token: 'token123' };
			expect(opts.token).toBe('token123');
			expect(opts.baseUrl).toBeUndefined();
			expect(opts.model).toBeUndefined();
		});
	});
});
