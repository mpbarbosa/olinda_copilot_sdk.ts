"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const session_client_1 = require("../../src/core/session_client");
const errors_1 = require("../../src/core/errors");
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
                on: jest.fn().mockReturnValue(jest.fn()),
            }),
            resumeSession: jest.fn().mockResolvedValue({
                sendAndWait: jest.fn().mockResolvedValue({ data: { content: 'resumed', success: true } }),
                destroy: jest.fn().mockResolvedValue(undefined),
                abort: jest.fn().mockResolvedValue(undefined),
                on: jest.fn().mockReturnValue(jest.fn()),
            }),
            listSessions: jest.fn().mockResolvedValue([{ id: 'session-1' }, { id: 'session-2' }]),
            deleteSession: jest.fn().mockResolvedValue(undefined),
            getLastSessionId: jest.fn().mockResolvedValue('session-1'),
            getForegroundSessionId: jest.fn().mockResolvedValue('session-1'),
            setForegroundSessionId: jest.fn().mockResolvedValue(undefined),
            ping: jest.fn().mockResolvedValue({ message: 'hello', timestamp: 1735689600000 }),
            getStatus: jest.fn().mockResolvedValue({ isAuthenticated: true }),
            getState: jest.fn().mockReturnValue('connected'),
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
            const wrapper = new session_client_1.CopilotSdkWrapper();
            expect(wrapper.client).toBeNull();
            expect(wrapper.session).toBeNull();
            expect(wrapper.authenticated).toBe(false);
            expect(wrapper.availableModels).toEqual([]);
        });
        it('should initialize with provided options', () => {
            const wrapper = new session_client_1.CopilotSdkWrapper({
                model: 'test-model',
                timeout: 1234,
                workingDirectory: '/tmp',
            });
            expect(wrapper._model).toBe('test-model');
            expect(wrapper._timeout).toBe(1234);
            expect(wrapper._workingDirectory).toBe('/tmp');
        });
    });
    describe('isAvailable', () => {
        it('should return true if CopilotClient is available', () => {
            expect(session_client_1.CopilotSdkWrapper.isAvailable()).toBe(true);
        });
        it('should return false if CopilotClient is not a function', () => {
            const orig = CopilotClientMock;
            require('@github/copilot-sdk').CopilotClient = null;
            expect(session_client_1.CopilotSdkWrapper.isAvailable()).toBe(false);
            require('@github/copilot-sdk').CopilotClient = orig;
        });
    });
    describe('initialize', () => {
        it('should start client, authenticate, fetch models, and create session', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
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
            const wrapper = new session_client_1.CopilotSdkWrapper();
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
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await expect(wrapper.initialize()).rejects.toThrow('session fail');
            expect(wrapper.client).toBeNull();
        });
    });
    describe('send', () => {
        it('should throw SystemError if no session exists', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await expect(wrapper.send('prompt')).rejects.toThrow(errors_1.SystemError);
        });
        it('should send prompt and return response', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const res = await wrapper.send('prompt');
            expect(res).toEqual({ content: 'response', success: true });
        });
        it('should serialize concurrent send calls', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const sendSpy = jest.spyOn(wrapper.session, 'sendAndWait');
            await Promise.all([
                wrapper.send('prompt1'),
                wrapper.send('prompt2'),
            ]);
            expect(sendSpy).toHaveBeenCalledTimes(2);
        });
    });
    describe('abort', () => {
        it('should call abort on session if available', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const abortSpy = jest.spyOn(wrapper.session, 'abort');
            await wrapper.abort();
            expect(abortSpy).toHaveBeenCalled();
        });
        it('should not throw if abort is not available', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            wrapper._session.abort = undefined;
            await expect(wrapper.abort()).resolves.toBeUndefined();
        });
    });
    describe('recreateSession', () => {
        it('should destroy session, stop client, restart client, and create new session', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const destroySpy = jest.spyOn(wrapper.session, 'destroy');
            const stopSpy = jest.spyOn(wrapper.client, 'stop');
            await wrapper.recreateSession();
            expect(destroySpy).toHaveBeenCalled();
            expect(stopSpy).toHaveBeenCalled();
            // recreateSession creates a new CopilotClient; verify start() was called on it
            const newClient = CopilotClientMock.mock.results[1].value;
            expect(newClient.start).toHaveBeenCalled();
            expect(wrapper.session).not.toBeNull();
        });
    });
    describe('cleanup', () => {
        it('should destroy session and stop client', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const destroySpy = jest.spyOn(wrapper.session, 'destroy');
            const stopSpy = jest.spyOn(wrapper.client, 'stop');
            await wrapper.cleanup();
            expect(destroySpy).toHaveBeenCalled();
            expect(stopSpy).toHaveBeenCalled();
            expect(wrapper.session).toBeNull();
            expect(wrapper.client).toBeNull();
        });
        it('should call forceStop if stop times out', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            jest.useFakeTimers();
            try {
                jest.spyOn(wrapper.client, 'stop').mockImplementation(() => new Promise(() => { }));
                const forceStopSpy = jest.spyOn(wrapper.client, 'forceStop');
                const cleanupPromise = wrapper.cleanup();
                await jest.advanceTimersByTimeAsync(6000);
                await cleanupPromise;
                expect(forceStopSpy).toHaveBeenCalled();
            }
            finally {
                jest.useRealTimers();
            }
        });
    });
    describe('sendStream', () => {
        it('should throw SystemError if no session exists', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await expect(wrapper.sendStream('prompt', jest.fn())).rejects.toThrow(errors_1.SystemError);
        });
        it('should call onDelta for each assistant.message_delta event', async () => {
            let capturedHandler = null;
            const unsubscribeMock = jest.fn();
            CopilotClientMock.mockImplementationOnce(() => ({
                start: jest.fn().mockResolvedValue(undefined),
                stop: jest.fn().mockResolvedValue(undefined),
                forceStop: jest.fn().mockResolvedValue(undefined),
                getAuthStatus: jest.fn().mockResolvedValue({ isAuthenticated: true }),
                listModels: jest.fn().mockResolvedValue([]),
                createSession: jest.fn().mockResolvedValue({
                    destroy: jest.fn().mockResolvedValue(undefined),
                    abort: jest.fn().mockResolvedValue(undefined),
                    on: jest.fn().mockImplementation((handler) => {
                        capturedHandler = handler;
                        return unsubscribeMock;
                    }),
                    sendAndWait: jest.fn().mockImplementation(async () => {
                        capturedHandler?.({ type: 'assistant.message_delta', data: { deltaContent: 'hello ' } });
                        capturedHandler?.({ type: 'assistant.message_delta', data: { deltaContent: 'world' } });
                        capturedHandler?.({ type: 'assistant.message', data: { content: 'hello world' } });
                        return { data: { content: 'hello world', success: true } };
                    }),
                }),
            }));
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const onDelta = jest.fn();
            const result = await wrapper.sendStream('write a haiku', onDelta);
            expect(onDelta).toHaveBeenCalledTimes(2);
            expect(onDelta).toHaveBeenNthCalledWith(1, 'hello ');
            expect(onDelta).toHaveBeenNthCalledWith(2, 'world');
            expect(result).toEqual({ content: 'hello world', success: true });
            expect(unsubscribeMock).toHaveBeenCalled();
        });
        it('should return success=true from assistant.message event', async () => {
            let capturedHandler = null;
            CopilotClientMock.mockImplementationOnce(() => ({
                start: jest.fn().mockResolvedValue(undefined),
                stop: jest.fn().mockResolvedValue(undefined),
                forceStop: jest.fn().mockResolvedValue(undefined),
                getAuthStatus: jest.fn().mockResolvedValue({ isAuthenticated: true }),
                listModels: jest.fn().mockResolvedValue([]),
                createSession: jest.fn().mockResolvedValue({
                    destroy: jest.fn().mockResolvedValue(undefined),
                    abort: jest.fn().mockResolvedValue(undefined),
                    on: jest.fn().mockImplementation((handler) => {
                        capturedHandler = handler;
                        return jest.fn();
                    }),
                    sendAndWait: jest.fn().mockImplementation(async () => {
                        capturedHandler?.({ type: 'assistant.message', data: { content: 'the answer' } });
                        return { data: { content: 'the answer', success: true } };
                    }),
                }),
            }));
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const result = await wrapper.sendStream('prompt', jest.fn());
            expect(result).toEqual({ content: 'the answer', success: true });
        });
        it('should unsubscribe from events even if sendAndWait throws', async () => {
            const unsubscribeMock = jest.fn();
            CopilotClientMock.mockImplementationOnce(() => ({
                start: jest.fn().mockResolvedValue(undefined),
                stop: jest.fn().mockResolvedValue(undefined),
                forceStop: jest.fn().mockResolvedValue(undefined),
                getAuthStatus: jest.fn().mockResolvedValue({ isAuthenticated: true }),
                listModels: jest.fn().mockResolvedValue([]),
                createSession: jest.fn().mockResolvedValue({
                    destroy: jest.fn().mockResolvedValue(undefined),
                    abort: jest.fn().mockResolvedValue(undefined),
                    on: jest.fn().mockReturnValue(unsubscribeMock),
                    sendAndWait: jest.fn().mockRejectedValue(new Error('network error')),
                }),
            }));
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            await expect(wrapper.sendStream('prompt', jest.fn())).rejects.toThrow('network error');
            expect(unsubscribeMock).toHaveBeenCalled();
        });
    });
    describe('resumeSession', () => {
        it('should throw SystemError if no client is active', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await expect(wrapper.resumeSession('session-1')).rejects.toThrow(errors_1.SystemError);
        });
        it('should destroy existing session and resume new one by ID', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const destroySpy = jest.spyOn(wrapper.session, 'destroy');
            const resumeSpy = jest.spyOn(wrapper.client, 'resumeSession');
            await wrapper.resumeSession('session-1');
            expect(destroySpy).toHaveBeenCalled();
            expect(resumeSpy).toHaveBeenCalledWith('session-1', { onPermissionRequest: expect.any(Function) });
            expect(wrapper.session).not.toBeNull();
        });
        it('should pass config to resumeSession when provided', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const resumeSpy = jest.spyOn(wrapper.client, 'resumeSession');
            await wrapper.resumeSession('session-1', { model: 'test-model', onPermissionRequest: jest.fn() });
            expect(resumeSpy).toHaveBeenCalledWith('session-1', { model: 'test-model', onPermissionRequest: expect.any(Function) });
        });
    });
    describe('listSessions', () => {
        it('should throw SystemError if no client is active', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await expect(wrapper.listSessions()).rejects.toThrow(errors_1.SystemError);
        });
        it('should return sessions from the client', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const sessions = await wrapper.listSessions();
            expect(sessions).toEqual([{ id: 'session-1' }, { id: 'session-2' }]);
        });
        it('should forward optional filter to client', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const listSpy = jest.spyOn(wrapper.client, 'listSessions');
            await wrapper.listSessions({ repository: 'owner/repo' });
            expect(listSpy).toHaveBeenCalledWith({ repository: 'owner/repo' });
        });
    });
    describe('deleteSession', () => {
        it('should throw SystemError if no client is active', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await expect(wrapper.deleteSession('session-1')).rejects.toThrow(errors_1.SystemError);
        });
        it('should call deleteSession on the client', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const deleteSpy = jest.spyOn(wrapper.client, 'deleteSession');
            await wrapper.deleteSession('session-1');
            expect(deleteSpy).toHaveBeenCalledWith('session-1');
        });
    });
    describe('getLastSessionId', () => {
        it('should throw SystemError if no client is active', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await expect(wrapper.getLastSessionId()).rejects.toThrow(errors_1.SystemError);
        });
        it('should return last session ID from the client', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const id = await wrapper.getLastSessionId();
            expect(id).toBe('session-1');
        });
    });
    describe('getForegroundSessionId', () => {
        it('should throw SystemError if no client is active', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await expect(wrapper.getForegroundSessionId()).rejects.toThrow(errors_1.SystemError);
        });
        it('should return foreground session ID from the client', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const id = await wrapper.getForegroundSessionId();
            expect(id).toBe('session-1');
        });
    });
    describe('setForegroundSessionId', () => {
        it('should throw SystemError if no client is active', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await expect(wrapper.setForegroundSessionId('session-1')).rejects.toThrow(errors_1.SystemError);
        });
        it('should call setForegroundSessionId on the client', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const setSpy = jest.spyOn(wrapper.client, 'setForegroundSessionId');
            await wrapper.setForegroundSessionId('session-1');
            expect(setSpy).toHaveBeenCalledWith('session-1');
        });
    });
    describe('ping', () => {
        it('should throw SystemError if no client is active', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await expect(wrapper.ping()).rejects.toThrow(errors_1.SystemError);
        });
        it('should return ping response from the client', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const result = await wrapper.ping('hello');
            expect(result).toEqual({ message: 'hello', timestamp: 1735689600000 });
        });
    });
    describe('getStatus', () => {
        it('should throw SystemError if no client is active', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await expect(wrapper.getStatus()).rejects.toThrow(errors_1.SystemError);
        });
        it('should return status from the client', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const status = await wrapper.getStatus();
            expect(status).toEqual({ isAuthenticated: true });
        });
    });
    describe('getState', () => {
        it('should throw SystemError if no client is active', () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            expect(() => wrapper.getState()).toThrow(errors_1.SystemError);
        });
        it('should return connection state from the client', async () => {
            const wrapper = new session_client_1.CopilotSdkWrapper();
            await wrapper.initialize();
            const state = wrapper.getState();
            expect(state).toBe('connected');
        });
    });
});
