// src/core/session_types.test.ts
import * as sessionTypes from './session_types';

// These are type-only re-exports from '@github/copilot-sdk'.
// We can only test that the types are re-exported and usable in type contexts.
// We'll use type assertions and dummy implementations to ensure the types are available.

describe('session_types type re-exports', () => {
  test('should export all expected types', () => {
    // Connection
    type _ConnectionState = sessionTypes.ConnectionState;
    type _CopilotClientOptions = sessionTypes.CopilotClientOptions;

    // Session lifecycle management
    type _SessionContext = sessionTypes.SessionContext;
    type _SessionListFilter = sessionTypes.SessionListFilter;
    type _SessionMetadata = sessionTypes.SessionMetadata;
    type _ForegroundSessionInfo = sessionTypes.ForegroundSessionInfo;
    type _SessionLifecycleEventType = sessionTypes.SessionLifecycleEventType;
    type _SessionLifecycleEvent = sessionTypes.SessionLifecycleEvent;
    type _SessionLifecycleHandler = sessionTypes.SessionLifecycleHandler;
    type _TypedSessionLifecycleHandler = sessionTypes.TypedSessionLifecycleHandler;

    // Session events
    type _SessionEvent = sessionTypes.SessionEvent;
    type _SessionEventType = sessionTypes.SessionEventType;
    type _SessionEventPayload = sessionTypes.SessionEventPayload;
    type _SessionEventHandler = sessionTypes.SessionEventHandler;
    type _TypedSessionEventHandler = sessionTypes.TypedSessionEventHandler;

    // Model introspection
    type _ModelInfo = sessionTypes.ModelInfo;
    type _ModelCapabilities = sessionTypes.ModelCapabilities;
    type _ModelBilling = sessionTypes.ModelBilling;
    type _ModelPolicy = sessionTypes.ModelPolicy;

    // Status
    type _GetStatusResponse = sessionTypes.GetStatusResponse;
    type _GetAuthStatusResponse = sessionTypes.GetAuthStatusResponse;

    // Message options
    type _MessageOptions = sessionTypes.MessageOptions;

    // AssistantMessageEvent
    type _AssistantMessageEvent = sessionTypes.AssistantMessageEvent;

    // If the above lines compile, the types are re-exported.
    expect(true).toBe(true);
  });

  test('should allow instantiation of a SessionContext-like object', () => {
    // This test will only check that the type is assignable.
    const sessionContext: sessionTypes.SessionContext = {
      // @ts-expect-error - purposely incomplete to check type enforcement
      // Should error if required fields are missing
    };
    // The above should error at compile time if required fields are missing.
    expect(true).toBe(true);
  });

  test('should allow function types for event handlers', () => {
    // SessionEventHandler is a function type
    const handler: sessionTypes.SessionEventHandler = (event) => {
      // event should be of type SessionEvent
      const type: sessionTypes.SessionEventType = event.type;
      expect(typeof type).toBe('string');
    };
    // Call with a dummy event
    handler({ type: 'dummy' } as sessionTypes.SessionEvent);
  });

  test('should allow ModelInfo to be used in type assertions', () => {
    const info = {
      id: 'model-1',
      name: 'Test Model',
      capabilities: {},
      billing: {},
      policy: {},
    } as sessionTypes.ModelInfo;
    expect(info.id).toBe('model-1');
  });

  test('should allow MessageOptions to be extended', () => {
    interface ExtendedMessageOptions extends sessionTypes.MessageOptions {
      customField?: string;
    }
    const opts: ExtendedMessageOptions = { customField: 'foo' };
    expect(opts.customField).toBe('foo');
  });

  test('should allow AssistantMessageEvent to be used in unions', () => {
    type Event = sessionTypes.AssistantMessageEvent | { type: 'other' };
    const e: Event = { type: 'other' };
    expect(e.type).toBe('other');
  });
});
