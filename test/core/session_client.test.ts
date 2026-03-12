import { CopilotSdkWrapper } from '../../src/core/session_client';
import { SystemError } from '../../src/core/errors';

jest.mock('@github/copilot-sdk', () => {
	return {
		CopilotClient: jest.fn().mockImplementation(() => ({
			start: jest.fn().mockResolvedValue(undefined),
			stop: jest.fn().mockResolvedValue(undefined),
			forceStop: jest.fn().mockResolvedValue(undefined),
			getAuthStatus: jest.fn().mockResolvedValue({ isAuthenticated: true }),
			listModels: jest.fn().mockResolvedValue([{ id: 'model-1' }, { id: 'model-2' }]),
			createSession: jest.fn().mockResolvedValue({
				sendAndWait: jest.fn().mockResolvedValue({ data: { content: 'response', success: true } }),
				destroy: jest.fn().mockResolvedValue(undefined),
				abort: jest.fn().mockResolvedValue(undefined),
			}),
		})),
		approveAll: jest.fn(),
	};
});

const CopilotClientMock = require('@github/copilot-sdk').CopilotClient;

describe('CopilotSdkWrapper', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		it('should initialize with default options', () => {
			const wrapper = new CopilotSdkWrapper();
			expect(wrapper.client).toBeNull();
			expect(wrapper.session).toBeNull();
			expect(wrapper.authenticated).toBe(false);
			expect(wrapper.availableModels).toEqual([]);
		});

		it('should initialize with provided options', () => {
			const wrapper = new CopilotSdkWrapper({
				model: 'test-model',
				timeout: 1234,
				workingDirectory: '/tmp',
			});
		 expect((wrapper as any)._model).toBe('test-model');
		 expect((wrapper as any)._timeout).toBe(1234);
		 expect((wrapper as any)._workingDirectory).toBe('/tmp');
		});
	});

	describe('isAvailable', () => {
		it('should return true if CopilotClient is available', () => {
			expect(CopilotSdkWrapper.isAvailable()).toBe(true);
		});

		it('should return false if CopilotClient is not a function', () => {
			const orig = CopilotClientMock;
			require('@github/copilot-sdk').CopilotClient = null;
			expect(CopilotSdkWrapper.isAvailable()).toBe(false);
			require('@github/copilot-sdk').CopilotClient = orig;
		});
	});

	describe('initialize', () => {
		it('should start client, authenticate, fetch models, and create session', async () => {
			const wrapper = new CopilotSdkWrapper();
			const result = await wrapper.initialize();
			expect(wrapper.client).not.toBeNull();
			expect(wrapper.session).not.toBeNull();
			expect(wrapper.authenticated).toBe(true);
			expect(result.authenticated).toBe(true);
			expect(result.availableModels.length).toBeGreaterThan(0);
		});

		it('should handle model fetch failure gracefully', async () => {
			CopilotClientMock.mockImplementationOnce(() => ({
				start: jest.fn().mockResolvedValue(undefined),
				stop: jest.fn().mockResolvedValue(undefined),
				forceStop: jest.fn().mockResolvedValue(undefined),
				getAuthStatus: jest.fn().mockResolvedValue({ isAuthenticated: true }),
				listModels: jest.fn().mockRejectedValueOnce(new Error('fail')),
				createSession: jest.fn().mockResolvedValue({
					sendAndWait: jest.fn().mockResolvedValue({ data: { content: 'response', success: true } }),
					destroy: jest.fn().mockResolvedValue(undefined),
					abort: jest.fn().mockResolvedValue(undefined),
				}),
			}));
			const wrapper = new CopilotSdkWrapper();
			await expect(wrapper.initialize()).resolves.toBeDefined();
		});

		it('should cleanup client and re-throw error if session creation fails', async () => {
			CopilotClientMock.mockImplementationOnce(() => ({
				start: jest.fn().mockResolvedValue(undefined),
				stop: jest.fn().mockResolvedValue(undefined),
				forceStop: jest.fn().mockResolvedValue(undefined),
				getAuthStatus: jest.fn().mockResolvedValue({ isAuthenticated: true }),
				listModels: jest.fn().mockResolvedValue([]),
				createSession: jest.fn().mockRejectedValueOnce(new Error('session fail')),
			}));
			const wrapper = new CopilotSdkWrapper();
			await expect(wrapper.initialize()).rejects.toThrow('session fail');
			expect(wrapper.client).toBeNull();
		});
	});

	describe('send', () => {
		it('should throw SystemError if no session exists', async () => {
			const wrapper = new CopilotSdkWrapper();
			await expect(wrapper.send('prompt')).rejects.toThrow(SystemError);
		});

		it('should send prompt and return response', async () => {
			const wrapper = new CopilotSdkWrapper();
			await wrapper.initialize();
			const res = await wrapper.send('prompt');
			expect(res).toEqual({ content: 'response', success: true });
		});

		it('should serialize concurrent send calls', async () => {
			const wrapper = new CopilotSdkWrapper();
			await wrapper.initialize();
			const sendSpy = jest.spyOn(wrapper.session!, 'sendAndWait');
			await Promise.all([
				wrapper.send('prompt1'),
				wrapper.send('prompt2'),
			]);
			expect(sendSpy).toHaveBeenCalledTimes(2);
		});
	});

	describe('abort', () => {
		it('should call abort on session if available', async () => {
			const wrapper = new CopilotSdkWrapper();
			await wrapper.initialize();
			const abortSpy = jest.spyOn(wrapper.session!, 'abort');
			await wrapper.abort();
			expect(abortSpy).toHaveBeenCalled();
		});

		it('should not throw if abort is not available', async () => {
			const wrapper = new CopilotSdkWrapper();
			await wrapper.initialize();
			(wrapper as any)._session.abort = undefined;
			await expect(wrapper.abort()).resolves.toBeUndefined();
		});
	});

	describe('recreateSession', () => {
		it('should destroy session, stop client, restart client, and create new session', async () => {
			const wrapper = new CopilotSdkWrapper();
			await wrapper.initialize();
			const destroySpy = jest.spyOn(wrapper.session!, 'destroy');
			const stopSpy = jest.spyOn(wrapper.client!, 'stop');
			await wrapper.recreateSession();
			expect(destroySpy).toHaveBeenCalled();
			expect(stopSpy).toHaveBeenCalled();
			// recreateSession creates a new CopilotClient; verify start() was called on it
			const newClient = CopilotClientMock.mock.results[1].value as { start: jest.Mock };
			expect(newClient.start).toHaveBeenCalled();
			expect(wrapper.session).not.toBeNull();
		});
	});

	describe('cleanup', () => {
		it('should destroy session and stop client', async () => {
			const wrapper = new CopilotSdkWrapper();
			await wrapper.initialize();
			const destroySpy = jest.spyOn(wrapper.session!, 'destroy');
			const stopSpy = jest.spyOn(wrapper.client!, 'stop');
			await wrapper.cleanup();
			expect(destroySpy).toHaveBeenCalled();
			expect(stopSpy).toHaveBeenCalled();
			expect(wrapper.session).toBeNull();
			expect(wrapper.client).toBeNull();
		});

		it('should call forceStop if stop times out', async () => {
			const wrapper = new CopilotSdkWrapper();
			await wrapper.initialize();
			jest.useFakeTimers();
			try {
				jest.spyOn(wrapper.client!, 'stop').mockImplementation(() => new Promise(() => {}));
				const forceStopSpy = jest.spyOn(wrapper.client!, 'forceStop');
				const cleanupPromise = wrapper.cleanup();
				await jest.advanceTimersByTimeAsync(6_000);
				await cleanupPromise;
				expect(forceStopSpy).toHaveBeenCalled();
			} finally {
				jest.useRealTimers();
			}
		});
	});
});
