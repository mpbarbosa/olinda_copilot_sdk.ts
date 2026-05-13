/**
 * Claude Agent SDK execution wrapper.
 *
 * Keeps Claude execution concerns in one bounded context: wrapper defaults,
 * warmup, and serialised prompt execution. Session administration lives in the
 * separate `claude/sessions` module so the public API does not mix execution
 * behavior with transcript-management helpers.
 *
 * @module claude/sdk_wrapper
 * @since 0.10.0
 */
import { query } from '@anthropic-ai/claude-agent-sdk';
import { getClaudeStartup } from './internal/sdk_compat.js';
import { buildClaudeSdkOptions } from './internal/sdk_options.js';
import { collectClaudeRunResult } from './internal/run_mapping.js';
/**
 * Wraps the Claude Agent SDK `query()` function with library-owned execution options,
 * concurrent-call serialisation, and optional warmup support.
 *
 * @since 0.10.0
 * @example
 * const wrapper = new ClaudeSdkWrapper({
 *   model: 'claude-sonnet-4-5',
 *   cwd: process.cwd(),
 *   permissionMode: 'default',
 * });
 * await wrapper.warmup();
 * const result = await wrapper.run('Summarise the README.md file');
 * console.log(result.content);
 */
export class ClaudeSdkWrapper {
    constructor(options = {}) {
        this._defaults = { ...options };
        this._warmQuery = null;
        this._runQueue = Promise.resolve();
    }
    /** `true` when a pre-warmed process is ready to service the next `run()` call. */
    get warmed() {
        return this._warmQuery !== null;
    }
    /**
     * Returns `true` if `@anthropic-ai/claude-agent-sdk` can be imported at runtime.
     * Does NOT start a subprocess — safe to call any time.
     * @since 0.10.0
     */
    static isAvailable() {
        return typeof query === 'function';
    }
    /**
     * Pre-warms the Claude Code subprocess so the first `run()` call has lower latency.
     *
     * The warm query is consumed by the next `run()` call. Subsequent calls will
     * start a fresh process automatically.
     *
     * @param initializeTimeoutMs - Timeout in milliseconds for the warmup handshake.
     * @returns `{ warmed: true }` on success.
     * @since 0.10.0
     * @example
     * await wrapper.warmup();
     * const result = await wrapper.run('Hello!');
     */
    async warmup(initializeTimeoutMs) {
        const startup = await getClaudeStartup();
        this._warmQuery = await startup({
            options: buildClaudeSdkOptions(this._defaults),
            ...(initializeTimeoutMs !== undefined ? { initializeTimeoutMs } : {}),
        });
        return { warmed: true };
    }
    /**
     * Sends a prompt to the agent and returns the collected result.
     *
     * Calls are serialised — concurrent callers wait their turn. If `warmup()` was
     * called previously and the warm process has not yet been consumed, the first
     * call will use it (lower latency); subsequent calls use a fresh process.
     *
     * @param prompt - The prompt text to send.
     * @param overrides - Per-run library-owned execution overrides. Note: overrides are not applied
     *   when the warm query is consumed (options were fixed at `warmup()` time).
     * @returns Collected run result including concatenated text and metadata.
     * @since 0.10.0
     * @example
     * const { content, totalCostUsd } = await wrapper.run('What is 2 + 2?');
     */
    async run(prompt, overrides) {
        const result = this._runQueue.then(() => this._doRun(prompt, overrides));
        // Advance the queue regardless of success/failure so later callers are not blocked.
        this._runQueue = result.catch(() => { });
        return result;
    }
    /** Performs a single serialised agent run. */
    async _doRun(prompt, overrides) {
        const messageStream = this._warmQuery !== null
            ? this._consumeWarmQuery(prompt)
            : query({ prompt, options: buildClaudeSdkOptions(this._defaults, overrides) });
        return collectClaudeRunResult(messageStream);
    }
    /** Consume the current warm query exactly once. */
    _consumeWarmQuery(prompt) {
        const warmQuery = this._warmQuery;
        this._warmQuery = null;
        return warmQuery.query(prompt);
    }
}
