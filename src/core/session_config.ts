/**
 * Session configuration types for `@github/copilot-sdk` sessions.
 * @module core/session_config
 * @description Typed `SessionConfig` surface that maps to the full set of
 * options accepted by the SDK when creating or resuming a Copilot session.
 * @since 0.1.0
 */

import type { BYOKProvider } from './auth.js';

/**
 * Controls how much reasoning effort the model expends before responding.
 * Only honoured by models that support reasoning (e.g. `o3-mini`).
 * @since 0.1.0
 */
export type ReasoningEffort = 'low' | 'medium' | 'high';

/**
 * Full configuration for a Copilot SDK session.
 *
 * All fields are optional — omitted fields fall back to SDK defaults.
 *
 * @since 0.1.0
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
	 * `'low'` is fastest; `'high'` produces the most thorough responses.
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
}
