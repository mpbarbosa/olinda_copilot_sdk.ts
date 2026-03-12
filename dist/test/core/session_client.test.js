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
            }),
        }), approveAll, jest.fn())
    };
});
;
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
            const client = new CopilotClientMock();
            client.listModels.mockRejectedValueOnce(new Error('fail'));
            const wrapper = new session_client_1.CopilotSdkWrapper();
            wrapper._client = client;
            client.getAuthStatus.mockResolvedValue({ isAuthenticated: true });
            client.createSession.mockResolvedValue({
                sendAndWait: jest.fn().mockResolvedValue({ data: { content: 'response', success: true } }),
                destroy: jest.fn().mockResolvedValue(undefined),
                abort: jest.fn().mockResolvedValue(undefined),
            });
            await expect(wrapper.initialize()).resolves.toBeDefined();
        });
        it('should cleanup client and re-throw error if session creation fails', async () => {
            const client = new CopilotClientMock();
            client.createSession.mockRejectedValueOnce(new Error('session fail'));
            const wrapper = new session_client_1.CopilotSdkWrapper();
            wrapper._client = client;
            client.getAuthStatus.mockResolvedValue({ isAuthenticated: true });
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
            const startSpy = jest.spyOn(wrapper.client, 'start');
            await wrapper.recreateSession();
            expect(destroySpy).toHaveBeenCalled();
            expect(stopSpy).toHaveBeenCalled();
            expect(startSpy).toHaveBeenCalled();
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
            const stopSpy = jest.spyOn(wrapper.client, 'stop').mockImplementation(() => new Promise(() => { }));
            const forceStopSpy = jest.spyOn(wrapper.client, 'forceStop');
            await wrapper.cleanup();
            expect(forceStopSpy).toHaveBeenCalled();
        });
    });
});
