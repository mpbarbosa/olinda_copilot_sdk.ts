"use strict";
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
 * @since 0.9.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeSdkWrapper = void 0;
const claude_agent_sdk_1 = require("@anthropic-ai/claude-agent-sdk");
const errors_js_1 = require("./errors.js");
// ==============================================================================
// ClaudeSdkWrapper
// ==============================================================================
/**
 * Wraps the Claude Agent SDK `query()` function with default option management,
 * concurrent-call serialisation, and session management utilities.
 *
 * @since 0.9.0
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
class ClaudeSdkWrapper {
    constructor({ model, cwd, permissionMode, maxTurns, systemPrompt, } = {}) {
        this._model = model;
        this._cwd = cwd;
        this._permissionMode = permissionMode;
        this._maxTurns = maxTurns;
        this._systemPrompt = systemPrompt;
        this._warmQuery = null;
        this._runQueue = Promise.resolve();
    }
    // --------------------------------------------------------------------------
    // Getters
    // --------------------------------------------------------------------------
    /** `true` when a pre-warmed process is ready to service the next `run()` call. */
    get warmed() {
        return this._warmQuery !== null;
    }
    /** The pre-warmed query object, or `null` if `warmup()` has not been called. */
    get warmQuery() {
        return this._warmQuery;
    }
    // --------------------------------------------------------------------------
    // Static helpers
    // --------------------------------------------------------------------------
    /**
     * Returns `true` if `@anthropic-ai/claude-agent-sdk` can be required at runtime.
     * Does NOT start a subprocess — safe to call any time.
     * @since 0.9.0
     */
    static isAvailable() {
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const mod = require('@anthropic-ai/claude-agent-sdk');
            return typeof mod.query === 'function';
        }
        catch {
            return false;
        }
    }
    // --------------------------------------------------------------------------
    // Lifecycle
    // --------------------------------------------------------------------------
    /**
     * Pre-warms the Claude Code subprocess so the first `run()` call has lower latency.
     *
     * The warm query is consumed by the next `run()` call. Subsequent calls will
     * start a fresh process automatically.
     *
     * @param initializeTimeoutMs - Timeout in milliseconds for the warmup handshake.
     * @returns `{ warmed: true }` on success.
     * @since 0.9.0
     * @example
     * await wrapper.warmup();
     * const result = await wrapper.run('Hello!');
     */
    async warmup(initializeTimeoutMs) {
        this._warmQuery = await (0, claude_agent_sdk_1.startup)({
            options: this._buildOptions(),
            ...(initializeTimeoutMs !== undefined ? { initializeTimeoutMs } : {}),
        });
        return { warmed: true };
    }
    // --------------------------------------------------------------------------
    // Core run — serialised queue
    // --------------------------------------------------------------------------
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
     * @since 0.9.0
     * @example
     * const { content, totalCostUsd } = await wrapper.run('What is 2 + 2?');
     */
    async run(prompt, overrides) {
        const result = this._runQueue.then(() => this._doRun(prompt, overrides));
        // Advance the queue regardless of success/failure so later callers are not blocked.
        this._runQueue = result.catch(() => { });
        return result;
    }
    // --------------------------------------------------------------------------
    // Session management utilities
    // --------------------------------------------------------------------------
    /**
     * Lists sessions, optionally filtered by directory or limit.
     * @param options - Filter options (e.g. `{ dir: process.cwd(), limit: 10 }`).
     * @returns Array of session metadata.
     * @since 0.9.0
     */
    async listSessions(options) {
        return (0, claude_agent_sdk_1.listSessions)(options);
    }
    /**
     * Reads metadata for a single session by ID.
     * @param sessionId - UUID of the session.
     * @param options - Optional `{ dir }` project path.
     * @returns Session info, or `undefined` if not found.
     * @since 0.9.0
     */
    async getSessionInfo(sessionId, options) {
        return (0, claude_agent_sdk_1.getSessionInfo)(sessionId, options);
    }
    /**
     * Deletes a session by ID.
     * @param sessionId - UUID of the session.
     * @param options - Optional `{ dir }` project path.
     * @since 0.9.0
     */
    async deleteSession(sessionId, options) {
        return (0, claude_agent_sdk_1.deleteSession)(sessionId, options);
    }
    /**
     * Renames a session by appending a custom-title entry to its transcript.
     * @param sessionId - UUID of the session.
     * @param title - New title for the session.
     * @param options - Optional `{ dir }` project path.
     * @since 0.9.0
     */
    async renameSession(sessionId, title, options) {
        return (0, claude_agent_sdk_1.renameSession)(sessionId, title, options);
    }
    /**
     * Reads a session's conversation messages in chronological order.
     * @param sessionId - UUID of the session.
     * @param options - Optional filter (e.g. `{ limit, offset }`).
     * @returns Array of messages, or empty array if session not found.
     * @since 0.9.0
     */
    async getSessionMessages(sessionId, options) {
        return (0, claude_agent_sdk_1.getSessionMessages)(sessionId, options);
    }
    // --------------------------------------------------------------------------
    // Private helpers
    // --------------------------------------------------------------------------
    /** Performs a single serialised agent run. */
    async _doRun(prompt, overrides) {
        const queryGen = this._warmQuery !== null
            ? (() => { const q = this._warmQuery.query(prompt); this._warmQuery = null; return q; })()
            : (0, claude_agent_sdk_1.query)({ prompt, options: this._buildOptions(overrides) });
        let content = '';
        let sessionId;
        let success = false;
        let totalCostUsd;
        let numTurns;
        let durationMs;
        for await (const message of queryGen) {
            if (message.type === 'assistant') {
                sessionId = message.session_id;
                content += this._extractText(message.message.content);
            }
            else if (message.type === 'result') {
                sessionId = message.session_id;
                if (message.subtype === 'success') {
                    success = true;
                    totalCostUsd = message.total_cost_usd;
                    numTurns = message.num_turns;
                    durationMs = message.duration_ms;
                }
                else {
                    const reason = 'errors' in message && message.errors?.[0]
                        ? message.errors[0]
                        : message.subtype;
                    throw new errors_js_1.ClaudeSDKError(`Run failed: ${reason}`);
                }
            }
        }
        return { content, sessionId, success, totalCostUsd, numTurns, durationMs };
    }
    /** Extracts concatenated text from a BetaMessage content array. */
    _extractText(blocks) {
        let text = '';
        for (const block of blocks) {
            if (block.type === 'text' && typeof block.text === 'string') {
                text += block.text;
            }
        }
        return text;
    }
    /** Merges wrapper defaults with per-call overrides into a full Options object. */
    _buildOptions(overrides) {
        const base = {};
        if (this._model !== undefined)
            base.model = this._model;
        if (this._cwd !== undefined)
            base.cwd = this._cwd;
        if (this._permissionMode !== undefined)
            base.permissionMode = this._permissionMode;
        if (this._maxTurns !== undefined)
            base.maxTurns = this._maxTurns;
        if (this._systemPrompt !== undefined)
            base.systemPrompt = this._systemPrompt;
        return { ...base, ...overrides };
    }
}
exports.ClaudeSdkWrapper = ClaudeSdkWrapper;
