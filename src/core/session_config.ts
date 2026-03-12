/**
 * Session configuration types for `@github/copilot-sdk` sessions.
 * @module core/session_config
 * @description Typed `SessionConfig` surface that maps to the full set of
 * options accepted by the SDK when creating or resuming a Copilot session.
 * @since 0.2.1
 */

import type { BYOKProvider } from './auth.js';
import type { PermissionHandler } from '@github/copilot-sdk';

/**
 * Controls how much reasoning effort the model expends before responding.
 * Only honoured by models that support reasoning (e.g. `o3-mini`).
 * @since 0.2.1
 */
export type ReasoningEffort = 'low' | 'medium' | 'high' | 'xhigh';

// ---------------------------------------------------------------------------
// UserInput types — compatible with @github/copilot-sdk's internal types
// (not exported from the SDK's public index; defined here for consumer use)
// ---------------------------------------------------------------------------

/**
 * A question sent by the agent to the user via the `ask_user` tool.
 * @since 0.2.1
 */
export interface UserInputRequest {
	/** The question the agent is asking. */
	question: string;
	/** Optional list of predefined answer choices. */
	choices?: string[];
	/**
	 * When `true`, the user may answer with free-form text in addition to choices.
	 * @default true
	 */
	allowFreeform?: boolean;
}

/**
 * The user's answer to a {@link UserInputRequest}.
 * @since 0.2.1
 */
export interface UserInputResponse {
	/** The user's answer text. */
	answer: string;
	/** `true` if the user typed a free-form answer instead of choosing from the list. */
	wasFreeform: boolean;
}

/**
 * Handler called when the agent invokes the `ask_user` tool.
 * The return value is forwarded back to the model as the user's response.
 *
 * @since 0.2.1
 * @example
 * const handler: UserInputHandler = async (req) => ({
 *   answer: req.choices?.[0] ?? 'yes',
 *   wasFreeform: false,
 * });
 */
export type UserInputHandler = (
	request: UserInputRequest,
	invocation: { sessionId: string },
) => Promise<UserInputResponse> | UserInputResponse;

/**
 * Full configuration for a Copilot SDK session.
 *
 * All fields are optional — omitted fields fall back to SDK defaults.
 * When used with {@link CopilotSdkWrapper}, `onPermissionRequest` defaults
 * to `approveAll` if not supplied.
 *
 * @since 0.2.1
 * @example
 * const config: SessionConfig = {
 *   model: 'gpt-4o',
 *   systemMessage: 'You are a TypeScript expert.',
 *   streaming: true,
 * };
 *
 * @example
 * // Resumable session with BYOK
 * const config: SessionConfig = {
 *   sessionId: 'session-user42-2026-03-12',
 *   provider: { type: 'anthropic', apiKey: 'sk-ant-...', model: 'claude-sonnet-4' },
 * };
 */
export interface SessionConfig {
	/**
	 * Opaque session identifier for resuming a previous session.
	 * When omitted, the SDK creates a new ephemeral session.
	 */
	sessionId?: string;
	/**
	 * Model identifier to use for this session.
	 * Examples: `'gpt-4o'`, `'claude-sonnet-4'`, `'o3-mini'`.
	 * Defaults to the SDK's configured default model.
	 */
	model?: string;
	/**
	 * System prompt injected at the start of the conversation.
	 * Overrides the default Copilot system message.
	 */
	systemMessage?: string;
	/**
	 * Working directory forwarded to the Copilot CLI process.
	 * Tools that access the file system will resolve paths relative to this dir.
	 */
	workingDirectory?: string;
	/**
	 * Controls reasoning effort for models that support it.
	 * `'low'` is fastest; `'xhigh'` produces the most thorough responses.
	 */
	reasoningEffort?: ReasoningEffort;
	/**
	 * When `true`, the SDK emits real-time streaming events instead of
	 * waiting for a complete response. Default: `false`.
	 */
	streaming?: boolean;
	/**
	 * Bring Your Own Key provider to route completions through a
	 * third-party model instead of GitHub Copilot.
	 * When set, the session uses the specified provider's endpoint and key.
	 */
	provider?: BYOKProvider;
	/**
	 * Handler called whenever the SDK requests permission for an operation
	 * (shell execution, file write, MCP tool call, etc.).
	 * When omitted, {@link CopilotSdkWrapper} uses `approveAll` by default.
	 *
	 * @example
	 * import { approveAll } from 'olinda_copilot_sdk.ts';
	 * const config: SessionConfig = { onPermissionRequest: approveAll };
	 */
	onPermissionRequest?: PermissionHandler;
	/**
	 * Handler called when the agent invokes the `ask_user` tool.
	 * Enables interactive Q&A flows where the model can ask the user questions.
	 * When omitted, the `ask_user` tool is not available in the session.
	 *
	 * @example
	 * const config: SessionConfig = {
	 *   onUserInputRequest: async (req) => ({ answer: 'yes', wasFreeform: false }),
	 * };
	 */
	onUserInputRequest?: UserInputHandler;
}


/**
 * Full configuration for a Copilot SDK session.
 *
 * All fields are optional — omitted fields fall back to SDK defaults.
 * When used with {@link CopilotSdkWrapper}, `onPermissionRequest` defaults
 * to `approveAll` if not supplied.
 *
 * @since 0.2.1
 * @example
 * const config: SessionConfig = {
 *   model: 'gpt-4o',
 *   systemMessage: 'You are a TypeScript expert.',
 *   streaming: true,
 * };
 *
 * @example
 * // Resumable session with BYOK
 * const config: SessionConfig = {
 *   sessionId: 'session-user42-2026-03-12',
 *   provider: { type: 'anthropic', apiKey: 'sk-ant-...', model: 'claude-sonnet-4' },
 * };
 */
export interface SessionConfig {
	/**
	 * Opaque session identifier for resuming a previous session.
	 * When omitted, the SDK creates a new ephemeral session.
	 */
	sessionId?: string;
	/**
	 * Model identifier to use for this session.
	 * Examples: `'gpt-4o'`, `'claude-sonnet-4'`, `'o3-mini'`.
	 * Defaults to the SDK's configured default model.
	 */
	model?: string;
	/**
	 * System prompt injected at the start of the conversation.
	 * Overrides the default Copilot system message.
	 */
	systemMessage?: string;
	/**
	 * Working directory forwarded to the Copilot CLI process.
	 * Tools that access the file system will resolve paths relative to this dir.
	 */
	workingDirectory?: string;
	/**
	 * Controls reasoning effort for models that support it.
	 * `'low'` is fastest; `'xhigh'` produces the most thorough responses.
	 */
	reasoningEffort?: ReasoningEffort;
	/**
	 * When `true`, the SDK emits real-time streaming events instead of
	 * waiting for a complete response. Default: `false`.
	 */
	streaming?: boolean;
	/**
	 * Bring Your Own Key provider to route completions through a
	 * third-party model instead of GitHub Copilot.
	 * When set, the session uses the specified provider's endpoint and key.
	 */
	provider?: BYOKProvider;
	/**
	 * Handler called whenever the SDK requests permission for an operation
	 * (shell execution, file write, MCP tool call, etc.).
	 * When omitted, {@link CopilotSdkWrapper} uses `approveAll` by default.
	 *
	 * @example
	 * import { approveAll } from 'olinda_copilot_sdk.ts';
	 * const config: SessionConfig = { onPermissionRequest: approveAll };
	 */
	onPermissionRequest?: PermissionHandler;
	/**
	 * Handler called when the agent invokes the `ask_user` tool.
	 * Enables interactive Q&A flows where the model can ask the user questions.
	 * When omitted, the `ask_user` tool is not available in the session.
	 *
	 * @example
	 * const config: SessionConfig = {
	 *   onUserInputRequest: async (req) => ({ answer: 'yes', wasFreeform: false }),
	 * };
	 */
	onUserInputRequest?: UserInputHandler;
}
