// src/core/session_types.test.ts

import * as sessionTypes from './session_types';

describe('core/session_types type exports', () => {
  it('should export all expected types', () => {
    // List of expected type keys
    const expectedTypes = [
      // Connection
      'ConnectionState',
      'CopilotClientOptions',

      // Session lifecycle management
      'SessionContext',
      'SessionListFilter',
      'SessionMetadata',
      'ForegroundSessionInfo',
      'SessionLifecycleEventType',
      'SessionLifecycleEvent',
      'SessionLifecycleHandler',
      'TypedSessionLifecycleHandler',

      // Session events
      'SessionEvent',
      'SessionEventType',
      'SessionEventPayload',
      'SessionEventHandler',
      'TypedSessionEventHandler',

      // Model introspection
      'ModelInfo',
      'ModelCapabilities',
      'ModelBilling',
      'ModelPolicy',

      // Status
      'GetStatusResponse',
      'GetAuthStatusResponse',

      // Message options
      'MessageOptions',

      // Assistant message event
      'AssistantMessageEvent',
    ];

    expectedTypes.forEach((typeName) => {
      expect(typeName in sessionTypes).toBe(true);
    });
  });

  it('should not export unexpected types', () => {
    // Only the expected types should be exported
    const exportedKeys = Object.keys(sessionTypes);
    const allowed = new Set([
      'ConnectionState',
      'CopilotClientOptions',
      'SessionContext',
      'SessionListFilter',
      'SessionMetadata',
      'ForegroundSessionInfo',
      'SessionLifecycleEventType',
      'SessionLifecycleEvent',
      'SessionLifecycleHandler',
      'TypedSessionLifecycleHandler',
      'SessionEvent',
      'SessionEventType',
      'SessionEventPayload',
      'SessionEventHandler',
      'TypedSessionEventHandler',
      'ModelInfo',
      'ModelCapabilities',
      'ModelBilling',
      'ModelPolicy',
      'GetStatusResponse',
      'GetAuthStatusResponse',
      'MessageOptions',
      'AssistantMessageEvent',
      '__esModule', // Allow for transpiled modules
    ]);
    exportedKeys.forEach((key) => {
      expect(allowed.has(key)).toBe(true);
    });
  });

  it('should allow type usage in TypeScript type assertions (smoke test)', () => {
    // These are smoke tests to ensure the types are usable in TS
    type T1 = sessionTypes.SessionContext | null;
    type T2 = sessionTypes.ModelInfo | undefined;
    type T3 = sessionTypes.GetStatusResponse | {};
    // No runtime assertion needed; this is to ensure type accessibility
    expect(true).toBe(true);
  });

  it('should not throw when importing types', () => {
    // Importing types should not throw at runtime
    expect(() => {
      // Access each type (should be undefined at runtime, but not throw)
      void sessionTypes.ConnectionState;
      void sessionTypes.SessionContext;
      void sessionTypes.ModelInfo;
      void sessionTypes.AssistantMessageEvent;
    }).not.toThrow();
  });
});
