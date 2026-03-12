import { approveAll } from '@github/copilot-sdk';
import type { PermissionHandler, ToolResultObject } from '@github/copilot-sdk';

export type { PermissionHandler, ToolResultObject };

/**
 * Shared base fields present in every hook input.
 *
 * @since 0.2.1
 */
export interface BaseHookInput {
	/** Unix epoch milliseconds at the moment the hook fires. */
	timestamp: number;
	/** Working directory of the session at hook time. */
	cwd: string;
}

/**
 * Input passed to the pre-tool-use hook.
 *
 * @since 0.2.1
 */
export interface PreToolUseInput extends BaseHookInput {
	/** Name of the tool about to be invoked. */
	toolName: string;
	/** Arguments the model supplied to the tool. */
	toolArgs: unknown;
}

/**
 * Output returned by the pre-tool-use hook.
 * Return `void` to pass through without modification.
 *
 * @since 0.2.1
 */
export interface PreToolUseOutput {
	/** Explicit permission decision; omit to defer to default policy. */
	permissionDecision?: 'allow' | 'deny' | 'ask';
	/** Human-readable reason accompanying the decision. */
	permissionDecisionReason?: string;
	/** Overridden arguments to pass to the tool instead of the model's. */
	modifiedArgs?: unknown;
	/** Extra context injected into the conversation before the tool runs. */
	additionalContext?: string;
	/** Suppress output of this hook invocation from the session log. */
	suppressOutput?: boolean;
}

/**
 * Handler function type for the pre-tool-use hook.
 *
 * @since 0.2.1
 */
export type PreToolUseHandler = (
	input: PreToolUseInput,
	invocation: { sessionId: string },
) => Promise<PreToolUseOutput | void> | PreToolUseOutput | void;

/** SDK-naming alias for {@link PreToolUseInput}. @since 0.4.1 */
export type PreToolUseHookInput = PreToolUseInput;
/** SDK-naming alias for {@link PreToolUseOutput}. @since 0.4.1 */
export type PreToolUseHookOutput = PreToolUseOutput;

/**
 * Input passed to the post-tool-use hook.
 *
 * @since 0.2.1
 */
export interface PostToolUseInput extends BaseHookInput {
	/** Name of the tool that was executed. */
	toolName: string;
	/** Arguments that were passed to the tool. */
	toolArgs: unknown;
	/** Result returned by the tool. */
	toolResult: ToolResultObject;
}

/**
 * Output returned by the post-tool-use hook.
 * Return `void` to pass through without modification.
 *
 * @since 0.2.1
 */
export interface PostToolUseOutput {
	/** Replacement result to use instead of the actual tool result. */
	modifiedResult?: ToolResultObject;
	/** Extra context injected into the conversation after the tool runs. */
	additionalContext?: string;
	/** Suppress output of this hook invocation from the session log. */
	suppressOutput?: boolean;
}

/**
 * Handler function type for the post-tool-use hook.
 *
 * @since 0.2.1
 */
export type PostToolUseHandler = (
	input: PostToolUseInput,
	invocation: { sessionId: string },
) => Promise<PostToolUseOutput | void> | PostToolUseOutput | void;

/** SDK-naming alias for {@link PostToolUseInput}. @since 0.4.1 */
export type PostToolUseHookInput = PostToolUseInput;
/** SDK-naming alias for {@link PostToolUseOutput}. @since 0.4.1 */
export type PostToolUseHookOutput = PostToolUseOutput;

/**
 * Input passed to the user-prompt-submitted hook.
 *
 * @since 0.2.1
 */
export interface UserPromptInput extends BaseHookInput {
	/** The raw prompt text the user submitted. */
	prompt: string;
}

/**
 * Output returned by the user-prompt-submitted hook.
 * Return `void` to pass through without modification.
 *
 * @since 0.2.1
 */
export interface UserPromptOutput {
	/** Replacement prompt to use instead of the user's original text. */
	modifiedPrompt?: string;
	/** Extra context prepended to the conversation. */
	additionalContext?: string;
	/** Suppress output of this hook invocation from the session log. */
	suppressOutput?: boolean;
}

/**
 * Handler function type for the user-prompt-submitted hook.
 *
 * @since 0.2.1
 */
export type UserPromptHandler = (
	input: UserPromptInput,
	invocation: { sessionId: string },
) => Promise<UserPromptOutput | void> | UserPromptOutput | void;

/**
 * SDK-aligned alias for {@link UserPromptHandler}.
 * Use this name for full compatibility with `@github/copilot-sdk`'s internal
 * `SessionHooks.onUserPromptSubmitted` field.
 *
 * @since 0.4.1
 */
export type UserPromptSubmittedHandler = UserPromptHandler;

/** SDK-naming alias for {@link UserPromptInput}. @since 0.4.1 */
export type UserPromptSubmittedHookInput = UserPromptInput;
/** SDK-naming alias for {@link UserPromptOutput}. @since 0.4.1 */
export type UserPromptSubmittedHookOutput = UserPromptOutput;

/**
 * Input passed to the session-start hook.
 *
 * @since 0.2.1
 */
export interface SessionStartInput extends BaseHookInput {
	/** How the session was initiated. */
	source: 'startup' | 'resume' | 'new';
	/** The first user prompt, if available at start time. */
	initialPrompt?: string;
}

/**
 * Output returned by the session-start hook.
 * Return `void` to pass through without modification.
 *
 * @since 0.2.1
 */
export interface SessionStartOutput {
	/** Extra context injected at the start of the session. */
	additionalContext?: string;
	/** Partial session config overrides applied after start. */
	modifiedConfig?: Record<string, unknown>;
}

/**
 * Handler function type for the session-start hook.
 *
 * @since 0.2.1
 */
export type SessionStartHandler = (
	input: SessionStartInput,
	invocation: { sessionId: string },
) => Promise<SessionStartOutput | void> | SessionStartOutput | void;

/** SDK-naming alias for {@link SessionStartInput}. @since 0.4.1 */
export type SessionStartHookInput = SessionStartInput;
/** SDK-naming alias for {@link SessionStartOutput}. @since 0.4.1 */
export type SessionStartHookOutput = SessionStartOutput;

/**
 * Input passed to the session-end hook.
 *
 * @since 0.2.1
 */
export interface SessionEndInput extends BaseHookInput {
	/** Reason the session terminated. */
	reason: 'complete' | 'error' | 'abort' | 'timeout' | 'user_exit';
	/** Last message produced before the session ended. */
	finalMessage?: string;
	/** Error description if `reason` is `'error'`. */
	error?: string;
}

/**
 * Output returned by the session-end hook.
 * Return `void` to pass through without modification.
 *
 * @since 0.2.1
 */
export interface SessionEndOutput {
	/** Suppress session-end output from the session log. */
	suppressOutput?: boolean;
	/** List of cleanup action identifiers to execute. */
	cleanupActions?: string[];
	/** Human-readable summary of what happened during the session. */
	sessionSummary?: string;
}

/**
 * Handler function type for the session-end hook.
 *
 * @since 0.2.1
 */
export type SessionEndHandler = (
	input: SessionEndInput,
	invocation: { sessionId: string },
) => Promise<SessionEndOutput | void> | SessionEndOutput | void;

/** SDK-naming alias for {@link SessionEndInput}. @since 0.4.1 */
export type SessionEndHookInput = SessionEndInput;
/** SDK-naming alias for {@link SessionEndOutput}. @since 0.4.1 */
export type SessionEndHookOutput = SessionEndOutput;

/**
 * Input passed to the error-occurred hook.
 *
 * @since 0.2.1
 */
export interface ErrorOccurredInput extends BaseHookInput {
	/** Human-readable description of the error. */
	error: string;
	/** The subsystem where the error originated. */
	errorContext: 'model_call' | 'tool_execution' | 'system' | 'user_input';
	/** Whether the session can recover from the error automatically. */
	recoverable: boolean;
}

/**
 * Output returned by the error-occurred hook.
 * Return `void` to accept the default error handling.
 *
 * @since 0.2.1
 */
export interface ErrorOccurredOutput {
	/** Suppress error output from the session log. */
	suppressOutput?: boolean;
	/** Override the default recovery strategy. */
	errorHandling?: 'retry' | 'skip' | 'abort';
	/** How many times to retry if `errorHandling` is `'retry'`. */
	retryCount?: number;
	/** Message to surface to the user about the error. */
	userNotification?: string;
}

/**
 * Handler function type for the error-occurred hook.
 *
 * @since 0.2.1
 */
export type ErrorOccurredHandler = (
	input: ErrorOccurredInput,
	invocation: { sessionId: string },
) => Promise<ErrorOccurredOutput | void> | ErrorOccurredOutput | void;

/** SDK-naming alias for {@link ErrorOccurredInput}. @since 0.4.1 */
export type ErrorOccurredHookInput = ErrorOccurredInput;
/** SDK-naming alias for {@link ErrorOccurredOutput}. @since 0.4.1 */
export type ErrorOccurredHookOutput = ErrorOccurredOutput;

/**
 * Registry of all session lifecycle hooks.
 * Every field is optional — provide only the hooks you need.
 *
 * The shape of this interface is structurally identical to `@github/copilot-sdk`'s
 * internal `SessionHooks`, so a value produced by {@link createHooks} can be
 * passed directly to `SessionConfig.hooks` without any conversion.
 *
 * @since 0.2.1
 */
export interface SessionHooks {
	/** Fires before each tool invocation. Can approve, deny, or modify args. */
	onPreToolUse?: PreToolUseHandler;
	/** Fires after each tool invocation. Can modify the result. */
	onPostToolUse?: PostToolUseHandler;
	/** Fires when the user submits a prompt. Can modify the prompt text. */
	onUserPromptSubmitted?: UserPromptSubmittedHandler;
	/** Fires when a session starts. Can inject initial context. */
	onSessionStart?: SessionStartHandler;
	/** Fires when a session ends. Can run cleanup. */
	onSessionEnd?: SessionEndHandler;
	/** Fires when an error occurs. Can override recovery strategy. */
	onErrorOccurred?: ErrorOccurredHandler;
}

/**
 * Partial session hooks configuration — a convenience alias for composing
 * hook configs before passing them to {@link createHooks}.
 *
 * @since 0.2.1
 */
export type HooksConfig = Partial<SessionHooks>;

/**
 * Creates a typed {@link SessionHooks} object from a partial config.
 *
 * This is a typed factory that gives full type inference when building hook
 * configs incrementally. Pass the result directly to `SessionConfig.hooks`.
 * The returned object is structurally assignable to `@github/copilot-sdk`'s
 * `SessionHooks` — no conversion needed.
 *
 * @param config - A partial set of session hook handlers.
 * @returns A `SessionHooks` object containing the provided handlers.
 * @since 0.2.1
 * @example
 * ```ts
 * const hooks = createHooks({
 *   onPreToolUse: (input) => input.toolName === 'bash' ? { permissionDecision: 'deny' } : undefined,
 *   onSessionEnd: async (input) => ({ sessionSummary: input.reason }),
 * });
 * ```
 */
export function createHooks(config: HooksConfig): SessionHooks {
	return { ...config };
}

/**
 * Returns a {@link PermissionHandler} that unconditionally approves every
 * permission request — equivalent to the SDK's `approveAll` constant, but as
 * a factory function for use when a fresh instance is required (e.g. per-test
 * isolation or conditional wrapping).
 *
 * Pass the result to `SessionConfig.onPermissionRequest`.
 *
 * **Breaking change from 0.2.x:** Previously returned a `PreToolUseHandler`.
 * To approve all tool invocations via hooks, use an inline handler instead:
 * `createHooks({ onPreToolUse: () => ({ permissionDecision: 'allow' }) })`.
 *
 * @returns A `PermissionHandler` that approves every request.
 * @since 0.4.1
 * @example
 * ```ts
 * const config: SessionConfig = { onPermissionRequest: approveAllTools() };
 * ```
 */
export function approveAllTools(): PermissionHandler {
	return approveAll;
}

/**
 * Returns a {@link PreToolUseHandler} that denies a specific set of tools by
 * name and passes all others through.
 *
 * @param toolNames - The tool names to deny.
 * @param reason - Optional human-readable reason included in the decision.
 * @returns A pre-tool-use handler that denies listed tools and returns `void` for others.
 * @since 0.2.1
 * @example
 * ```ts
 * const hooks = createHooks({
 *   onPreToolUse: denyTools(['bash', 'write_file'], 'blocked by policy'),
 * });
 * ```
 */
export function denyTools(toolNames: string[], reason?: string): PreToolUseHandler {
	const blocked = new Set(toolNames);
	return (input) => {
		if (!blocked.has(input.toolName)) return;
		const out: PreToolUseOutput = { permissionDecision: 'deny' };
		if (reason !== undefined) out.permissionDecisionReason = reason;
		return out;
	};
}
