/**
 * Claude Agent SDK Wrapper
 *
 * Thin wrapper around the `@anthropic-ai/claude-agent-sdk` `query()` function that
 * centralises default option management, serialises concurrent `run()` calls (the SDK
 * does not support simultaneous queries on a single pre-warmed process), and surfaces
 * session management utilities as instance methods.
 *
 * Unlike `CopilotSdkWrapper`, there is no explicit process lifecycle to manage: each
 * `query()` call is self-contained. The optional `warmup()` method pre-heats the
 * subprocess so the first `run()` call has lower latency; after the warm query is
 * consumed, subsequent calls start a fresh process automatically.
 *
 * @module claude/sdk_wrapper
 * @since 0.9.1
 */
import type { Options, PermissionMode, SDKSessionInfo, SessionMessage, WarmQuery, ListSessionsOptions, GetSessionInfoOptions, GetSessionMessagesOptions, SessionMutationOptions } from '@anthropic-ai/claude-agent-sdk';
/**
 * Options accepted by the {@link ClaudeSdkWrapper} constructor.
 * All fields become defaults for every `run()` call; they can be overridden
 * per-call via the `overrides` argument.
 * @since 0.9.1
 */
export interface ClaudeSdkWrapperOptions {
    /** Model alias or full model ID (e.g. `'claude-sonnet-4-5'`). */
    model?: string;
    /** Working directory forwarded to the agent process. Defaults to `process.cwd()`. */
    cwd?: string;
    /** Permission mode controlling how tool executions are handled. */
    permissionMode?: PermissionMode;
    /** Maximum number of agentic turns (API round-trips) before stopping. */
    maxTurns?: number;
    /** Custom system prompt prepended to the conversation. */
    systemPrompt?: string;
}
/**
 * Result of a successful {@link ClaudeSdkWrapper.warmup} call.
 * @since 0.9.1
 */
export interface WarmupResult {
    /** Always `true` — indicates the subprocess was pre-warmed successfully. */
    warmed: boolean;
}
/**
 * Result returned by {@link ClaudeSdkWrapper.run}.
 * @since 0.9.1
 */
export interface RunResult {
    /** Concatenated text from all assistant messages in the run. */
    content: string;
    /** Session ID for the completed run, available for `resume` in future calls. */
    sessionId: string | undefined;
    /** `true` when the run completed without errors. */
    success: boolean;
    /** Total API cost in USD. Available on successful runs. */
    totalCostUsd?: number;
    /** Number of agentic turns executed. */
    numTurns?: number;
    /** Wall-clock duration of the run in milliseconds. */
    durationMs?: number;
}
/**
 * Wraps the Claude Agent SDK `query()` function with default option management,
 * concurrent-call serialisation, and session management utilities.
 *
 * @since 0.9.1
 * @example
 * const wrapper = new ClaudeSdkWrapper({
 *   model: 'claude-sonnet-4-5',
 *   cwd: process.cwd(),
 *   allowedTools: ['Read', 'Glob', 'Grep'],
 * });
 * await wrapper.warmup();
 * const result = await wrapper.run('Summarise the README.md file');
 * console.log(result.content);
 */
export declare class ClaudeSdkWrapper {
    private _model;
    private _cwd;
    private _permissionMode;
    private _maxTurns;
    private _systemPrompt;
    private _warmQuery;
    /** Serialises concurrent run() calls. */
    private _runQueue;
    constructor({ model, cwd, permissionMode, maxTurns, systemPrompt, }?: ClaudeSdkWrapperOptions);
    /** `true` when a pre-warmed process is ready to service the next `run()` call. */
    get warmed(): boolean;
    /** The pre-warmed query object, or `null` if `warmup()` has not been called. */
    get warmQuery(): WarmQuery | null;
    /**
     * Returns `true` if `@anthropic-ai/claude-agent-sdk` can be required at runtime.
     * Does NOT start a subprocess — safe to call any time.
     * @since 0.9.1
     */
    static isAvailable(): boolean;
    /**
     * Pre-warms the Claude Code subprocess so the first `run()` call has lower latency.
     *
     * The warm query is consumed by the next `run()` call. Subsequent calls will
     * start a fresh process automatically.
     *
     * @param initializeTimeoutMs - Timeout in milliseconds for the warmup handshake.
     * @returns `{ warmed: true }` on success.
     * @since 0.9.1
     * @example
     * await wrapper.warmup();
     * const result = await wrapper.run('Hello!');
     */
    warmup(initializeTimeoutMs?: number): Promise<WarmupResult>;
    /**
     * Sends a prompt to the agent and returns the collected result.
     *
     * Calls are serialised — concurrent callers wait their turn. If `warmup()` was
     * called previously and the warm process has not yet been consumed, the first
     * call will use it (lower latency); subsequent calls use a fresh process.
     *
     * @param prompt - The prompt text to send.
     * @param overrides - Per-call option overrides. Note: overrides are not applied
     *   when the warm query is consumed (options were fixed at `warmup()` time).
     * @returns Collected run result including concatenated text and metadata.
     * @throws {@link ClaudeSDKError} When the agent run terminates with an error subtype.
     * @since 0.9.1
     * @example
     * const { content, totalCostUsd } = await wrapper.run('What is 2 + 2?');
     */
    run(prompt: string, overrides?: Partial<Options>): Promise<RunResult>;
    /**
     * Lists sessions, optionally filtered by directory or limit.
     * @param options - Filter options (e.g. `{ dir: process.cwd(), limit: 10 }`).
     * @returns Array of session metadata.
     * @since 0.9.1
     */
    listSessions(options?: ListSessionsOptions): Promise<SDKSessionInfo[]>;
    /**
     * Reads metadata for a single session by ID.
     * @param sessionId - UUID of the session.
     * @param options - Optional `{ dir }` project path.
     * @returns Session info, or `undefined` if not found.
     * @since 0.9.1
     */
    getSessionInfo(sessionId: string, options?: GetSessionInfoOptions): Promise<SDKSessionInfo | undefined>;
    /**
     * Deletes a session by ID.
     * @param sessionId - UUID of the session.
     * @param options - Optional `{ dir }` project path.
     * @since 0.9.1
     */
    deleteSession(sessionId: string, options?: SessionMutationOptions): Promise<void>;
    /**
     * Renames a session by appending a custom-title entry to its transcript.
     * @param sessionId - UUID of the session.
     * @param title - New title for the session.
     * @param options - Optional `{ dir }` project path.
     * @since 0.9.1
     */
    renameSession(sessionId: string, title: string, options?: SessionMutationOptions): Promise<void>;
    /**
     * Reads a session's conversation messages in chronological order.
     * @param sessionId - UUID of the session.
     * @param options - Optional filter (e.g. `{ limit, offset }`).
     * @returns Array of messages, or empty array if session not found.
     * @since 0.9.1
     */
    getSessionMessages(sessionId: string, options?: GetSessionMessagesOptions): Promise<SessionMessage[]>;
    /** Performs a single serialised agent run. */
    private _doRun;
    /** Extracts concatenated text from a BetaMessage content array. */
    private _extractText;
    /** Merges wrapper defaults with per-call overrides into a full Options object. */
    private _buildOptions;
}
