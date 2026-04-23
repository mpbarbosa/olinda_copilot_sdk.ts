/**
 * Claude Agent SDK type re-exports
 *
 * Re-exports the key public types from `@anthropic-ai/claude-agent-sdk` so consumers
 * import from this package rather than the underlying SDK directly.
 *
 * @module claude/sdk_types
 * @since 0.9.0
 */

export type {
	// Core query API
	Options,
	PermissionMode,
	Query,
	WarmQuery,

	// Message discriminated union
	SDKMessage,
	SDKAssistantMessage,
	SDKUserMessage,
	SDKResultMessage,
	SDKResultSuccess,
	SDKResultError,
	SDKSystemMessage,

	// Session management
	SDKSessionInfo,
	SessionMessage,
	ListSessionsOptions,
	GetSessionInfoOptions,
	GetSessionMessagesOptions,
	SessionMutationOptions,

	// Hooks
	HookEvent,
	HookCallbackMatcher,
	HookCallback,

	// Agents & tools
	AgentDefinition,
	CanUseTool,
	EffortLevel,
} from '@anthropic-ai/claude-agent-sdk';
