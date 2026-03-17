/**
 * Session management and model introspection types — re-exported from `@github/copilot-sdk`.
 *
 * These types form the v0.5.2 public surface for session lifecycle management
 * and model query APIs. Consumers should import them from the olinda entry point
 * rather than from `@github/copilot-sdk` directly.
 *
 * @module core/session_types
 * @since 0.5.2
 */

export type {
	// Connection
	ConnectionState,
	CopilotClientOptions,

	// Session lifecycle management
	SessionContext,
	SessionListFilter,
	SessionMetadata,
	ForegroundSessionInfo,
	SessionLifecycleEventType,
	SessionLifecycleEvent,
	SessionLifecycleHandler,
	TypedSessionLifecycleHandler,

	// Session events
	SessionEvent,
	SessionEventType,
	SessionEventPayload,
	SessionEventHandler,
	TypedSessionEventHandler,

	// Model introspection
	ModelInfo,
	ModelCapabilities,
	ModelBilling,
	ModelPolicy,

	// Status
	GetStatusResponse,
	GetAuthStatusResponse,

	// Message options
	MessageOptions,
} from '@github/copilot-sdk';

export type { AssistantMessageEvent } from '@github/copilot-sdk';
