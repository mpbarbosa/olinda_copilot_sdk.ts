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
import { getClaudeStartup, type ClaudeWarmQueryHandle } from './internal/sdk_compat.js';
import { buildClaudeSdkOptions } from './internal/sdk_options.js';
import { collectClaudeRunResult } from './internal/run_mapping.js';

/**
 * Claude permission modes supported by this wrapper.
 * @since 0.10.0
 */
export type ClaudePermissionMode =
	| 'default'
	| 'acceptEdits'
	| 'bypassPermissions'
	| 'plan'
	| 'dontAsk';

/**
 * Library-owned execution options shared by Claude wrapper configuration and per-run overrides.
 * @since 0.10.0
 */
export interface ClaudeExecutionOptions {
	/** Model alias or full model ID (e.g. `'claude-sonnet-4-5'`). */
	model?: string;
	/** Working directory forwarded to the agent process. */
	cwd?: string;
	/** Permission mode controlling how tool executions are handled. */
	permissionMode?: ClaudePermissionMode;
	/** Maximum number of agentic turns (API round-trips) before stopping. */
	maxTurns?: number;
	/** Custom system prompt prepended to the conversation. */
	systemPrompt?: string;
}

/**
 * Constructor options accepted by {@link ClaudeSdkWrapper}.
 * @since 0.10.0
 */
export type ClaudeSdkWrapperOptions = ClaudeExecutionOptions;

/**
 * Per-run Claude execution overrides.
 * @since 0.10.0
 */
export type ClaudeRunOptions = ClaudeExecutionOptions;

/**
 * Result of a successful {@link ClaudeSdkWrapper.warmup} call.
 * @since 0.10.0
 */
export interface ClaudeWarmupResult {
	/** Always `true` — indicates the subprocess was pre-warmed successfully. */
	warmed: boolean;
}

/**
 * Result returned by {@link ClaudeSdkWrapper.run}.
 * @since 0.10.0
 */
export interface ClaudeRunResult {
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
	private readonly _defaults: ClaudeExecutionOptions;
	private _warmQuery: ClaudeWarmQueryHandle | null;

	/** Serialises concurrent run() calls. */
	private _runQueue: Promise<void>;

	constructor(options: ClaudeSdkWrapperOptions = {}) {
		this._defaults = { ...options };
		this._warmQuery = null;
		this._runQueue = Promise.resolve();
	}

	/** `true` when a pre-warmed process is ready to service the next `run()` call. */
	get warmed(): boolean {
		return this._warmQuery !== null;
	}

	/**
	 * Returns `true` if `@anthropic-ai/claude-agent-sdk` can be imported at runtime.
	 * Does NOT start a subprocess — safe to call any time.
	 * @since 0.10.0
	 */
	static isAvailable(): boolean {
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
	async warmup(initializeTimeoutMs?: number): Promise<ClaudeWarmupResult> {
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
	async run(prompt: string, overrides?: ClaudeRunOptions): Promise<ClaudeRunResult> {
		const result = this._runQueue.then(() => this._doRun(prompt, overrides));
		// Advance the queue regardless of success/failure so later callers are not blocked.
		this._runQueue = result.catch(() => {}) as Promise<void>;
		return result;
	}

	/** Performs a single serialised agent run. */
	private async _doRun(
		prompt: string,
		overrides?: ClaudeRunOptions,
	): Promise<ClaudeRunResult> {
		const messageStream = this._warmQuery !== null
			? this._consumeWarmQuery(prompt)
			: query({ prompt, options: buildClaudeSdkOptions(this._defaults, overrides) });

		return collectClaudeRunResult(messageStream);
	}

	/** Consume the current warm query exactly once. */
	private _consumeWarmQuery(prompt: string) {
		const warmQuery = this._warmQuery;
		this._warmQuery = null;
		return warmQuery!.query(prompt);
	}
}
