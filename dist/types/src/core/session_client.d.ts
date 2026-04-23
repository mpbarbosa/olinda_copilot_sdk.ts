/**
 * Copilot SDK Wrapper
 *
 * Thin wrapper around the GitHub Copilot SDK that centralises all SDK lifecycle
 * concerns: client start/stop, session creation/destruction, serialised request
 * dispatch, and error-resilient cleanup (try-finally + forceStop race).
 *
 * All cookbook patterns from
 * https://github.com/github/awesome-copilot/blob/main/cookbook/copilot-sdk/nodejs/error-handling.md
 * are implemented here so higher-level code (AiHelper) stays focused on
 * orchestration rather than SDK mechanics.
 *
 * @module core/session_client
 * @version 2.0.0
 */
import { CopilotClient } from '@github/copilot-sdk';
import type { CopilotSession, ConnectionState, GetStatusResponse, ModelInfo, ResumeSessionConfig, SessionListFilter, SessionMetadata } from '@github/copilot-sdk';
/** Options accepted by the {@link CopilotSdkWrapper} constructor. */
export interface CopilotSdkWrapperOptions {
    /** Model identifier to use when creating sessions (e.g. `"claude-sonnet-4.5"`). */
    model?: string;
    /** Default `sendAndWait` timeout in milliseconds. */
    timeout?: number;
    /** Working directory forwarded to the SDK session config. */
    workingDirectory?: string;
}
/** Shape returned by {@link CopilotSdkWrapper.initialize}. */
export interface InitializeResult {
    authenticated: boolean;
    availableModels: ModelInfo[];
}
/** Raw event data returned by {@link CopilotSdkWrapper.send}. */
export interface SendResult {
    content: string;
    success: boolean;
    [key: string]: unknown;
}
/**
 * Wraps the Copilot SDK client/session lifecycle with robust error handling.
 *
 * Responsibilities:
 *  - Availability check (static)
 *  - Client start/stop with try-finally cleanup
 *  - Session creation and recreation after timeouts
 *  - Serialised sendAndWait dispatch (SDK does not allow concurrent calls)
 *  - Graceful cleanup with forceStop fallback
 *  - Optional session.abort() support
 */
export declare class CopilotSdkWrapper {
    private _model;
    private _timeout;
    private _workingDirectory;
    private _client;
    private _session;
    private _authenticated;
    private _availableModels;
    /** Serialises concurrent send() calls — the SDK does not support simultaneous sendAndWait. */
    private _sendQueue;
    constructor({ model, timeout, workingDirectory }?: CopilotSdkWrapperOptions);
    get client(): CopilotClient | null;
    get session(): CopilotSession | null;
    get authenticated(): boolean;
    get availableModels(): ModelInfo[];
    /**
     * Returns true if CopilotClient can be imported and instantiated.
     * Does NOT start the CLI server — safe to call any time.
     */
    static isAvailable(): boolean;
    /**
     * Starts the Copilot CLI server, authenticates, and creates the first session.
     *
     * Cookbook pattern: if auth or session creation fails after client.start()
     * the client is stopped inside a catch block so no orphaned process is left.
     *
     * @returns Resolved authentication state and available models.
     * @throws Re-throws any error after cleaning up the client.
     */
    initialize(): Promise<InitializeResult>;
    /**
     * Sends a prompt to the current session and returns the raw SDK response data.
     * Requests are serialised — concurrent callers wait their turn.
     *
     * @param prompt    - The prompt text.
     * @param timeoutMs - Override the default timeout (ms).
     * @returns Raw event data from the SDK.
     * @throws {@link SystemError} If no active session exists.
     */
    send(prompt: string, timeoutMs?: number): Promise<SendResult>;
    /**
     * Sends a prompt to the current session, streaming text deltas as they arrive.
     * Requests are serialised — concurrent callers wait their turn.
     *
     * Under the hood, this subscribes to `assistant.message_delta` events on the
     * session before calling `sendAndWait`, invoking `onDelta` for every incremental
     * text chunk the model emits. The subscription is cleaned up automatically once
     * the session becomes idle.
     *
     * @param prompt    - The prompt text.
     * @param onDelta   - Called with each incremental text chunk as it streams in.
     * @param timeoutMs - Override the default timeout (ms).
     * @returns Final `SendResult` once the session becomes idle.
     * @throws {@link SystemError} If no active session exists.
     * @since 0.2.1
     * @example
     * await wrapper.sendStream('Write a haiku', (delta) => process.stdout.write(delta));
     */
    sendStream(prompt: string, onDelta: (delta: string) => void, timeoutMs?: number): Promise<SendResult>;
    abort(): Promise<void>;
    /**
     * Destroys the current session, restarts the client, and creates a fresh session.
     * Called before each retry after a timeout so a stuck server process is replaced.
     */
    recreateSession(): Promise<void>;
    /**
     * Shuts down the session and client.
     *
     * Cookbook patterns applied:
     *  - try-finally: client.stop() is always called even if session.destroy() throws.
     *  - forceStop: if client.stop() hangs beyond FORCE_STOP_TIMEOUT_MS, forceStop() is called.
     */
    cleanup(): Promise<void>;
    /**
     * Resumes an existing session by ID, replacing the current active session.
     * The previous session is destroyed before the new one is established.
     *
     * @param sessionId - ID of the session to resume.
     * @param config    - Optional session config overrides.
     * @throws {@link SystemError} If no client is active (before `initialize()`).
     * @since 0.5.3
     * @example
     * const lastId = await wrapper.getLastSessionId();
     * if (lastId) await wrapper.resumeSession(lastId);
     */
    resumeSession(sessionId: string, config?: ResumeSessionConfig): Promise<void>;
    /**
     * Lists all sessions, optionally filtered.
     *
     * @param filter - Optional filter criteria.
     * @returns Array of session metadata.
     * @throws {@link SystemError} If no client is active.
     * @since 0.5.3
     */
    listSessions(filter?: SessionListFilter): Promise<SessionMetadata[]>;
    /**
     * Deletes a session by ID. Does not affect the currently active session.
     *
     * @param sessionId - ID of the session to delete.
     * @throws {@link SystemError} If no client is active.
     * @since 0.5.3
     */
    deleteSession(sessionId: string): Promise<void>;
    /**
     * Returns the ID of the most recently used session, or `undefined` if none.
     *
     * @throws {@link SystemError} If no client is active.
     * @since 0.5.3
     */
    getLastSessionId(): Promise<string | undefined>;
    /**
     * Returns the ID of the current foreground session, or `undefined` if none.
     *
     * @throws {@link SystemError} If no client is active.
     * @since 0.5.3
     */
    getForegroundSessionId(): Promise<string | undefined>;
    /**
     * Promotes a session to foreground by ID.
     *
     * @param sessionId - ID of the session to bring to the foreground.
     * @throws {@link SystemError} If no client is active.
     * @since 0.5.3
     */
    setForegroundSessionId(sessionId: string): Promise<void>;
    /**
     * Sends a ping to the server to verify connectivity.
     *
     * @param message - Optional message to echo back.
     * @returns Ping response containing the echoed message and a numeric timestamp.
     * @throws {@link SystemError} If no client is active.
     * @since 0.5.3
     * @example
     * const { timestamp } = await wrapper.ping('health check');
     */
    ping(message?: string): Promise<{
        message: string;
        timestamp: number;
        protocolVersion?: number;
    }>;
    /**
     * Returns the current server status.
     *
     * @throws {@link SystemError} If no client is active.
     * @since 0.5.3
     */
    getStatus(): Promise<GetStatusResponse>;
    /**
     * Returns the current client connection state without a network round-trip.
     *
     * @throws {@link SystemError} If no client is active.
     * @since 0.5.3
     */
    getState(): ConnectionState;
    /** Throws SystemError if the client has not been started yet. */
    private _requireClient;
    /** Performs a single serialised sendAndWait call. */
    private _doSend;
}
