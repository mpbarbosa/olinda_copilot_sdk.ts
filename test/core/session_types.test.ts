import type {
	AssistantMessageEvent,
	ConnectionState,
	CopilotClientOptions,
	ForegroundSessionInfo,
	GetAuthStatusResponse,
	GetStatusResponse,
	MessageOptions,
	ModelBilling,
	ModelCapabilities,
	ModelInfo,
	ModelPolicy,
	SessionContext,
	SessionEvent,
	SessionEventHandler,
	SessionEventPayload,
	SessionEventType,
	SessionLifecycleEvent,
	SessionLifecycleEventType,
	SessionLifecycleHandler,
	SessionListFilter,
	SessionMetadata,
	TypedSessionEventHandler,
	TypedSessionLifecycleHandler,
} from '../../src/core/session_types';

describe('session_types type re-exports', () => {
	it('are usable in type positions', () => {
		const typeMarkers = [] as unknown as [
			ConnectionState,
			CopilotClientOptions,
			SessionContext,
			SessionListFilter,
			SessionMetadata,
			ForegroundSessionInfo,
			SessionLifecycleEventType,
			SessionLifecycleEvent,
			SessionLifecycleHandler,
			TypedSessionLifecycleHandler<'session.created'>,
			SessionEvent,
			SessionEventType,
			SessionEventPayload<'assistant.message'>,
			SessionEventHandler,
			TypedSessionEventHandler<'assistant.message'>,
			ModelInfo,
			ModelCapabilities,
			ModelBilling,
			ModelPolicy,
			GetStatusResponse,
			GetAuthStatusResponse,
			MessageOptions,
			AssistantMessageEvent,
		];

		expect(typeMarkers).toHaveLength(0);
	});

	it('allows strongly typed event handlers', () => {
		const lifecycleHandler: TypedSessionLifecycleHandler<'session.created'> = event => {
			expect(event.type).toBe('session.created');
		};
		const eventHandler: SessionEventHandler = (event: SessionEvent) => {
			const eventType: SessionEventType = event.type;
			expect(typeof eventType).toBe('string');
		};

		lifecycleHandler({
			type: 'session.created',
			sessionId: 'session-1',
		} as SessionLifecycleEvent & { type: 'session.created' });

		eventHandler({
			id: 'evt-1',
			timestamp: '2026-04-23T00:00:00.000Z',
			parentId: null,
			type: 'assistant.message',
			data: {
				content: 'Hello',
			},
		} as AssistantMessageEvent);
	});

	it('allows MessageOptions to be extended', () => {
		interface ExtendedMessageOptions extends MessageOptions {
			customField?: string;
		}

		const opts: ExtendedMessageOptions = {
			prompt: 'Hello',
			customField: 'foo',
		};

		expect(opts.customField).toBe('foo');
	});

	it('allows model info to be consumed structurally', () => {
		const info: ModelInfo = {
			id: 'model-1',
			name: 'Test Model',
			capabilities: {
				supports: {
					vision: false,
					reasoningEffort: false,
				},
				limits: {
					max_context_window_tokens: 200000,
				},
			},
		};

		expect(info.id).toBe('model-1');
	});
});
