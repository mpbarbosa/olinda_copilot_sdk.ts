// test/session_types.test.ts

import * as sessionTypes from '../src/core/session_types';

describe('core/session_types type exports', () => {
  it('should export all expected types', () => {
    // Connection
    expect(sessionTypes).toHaveProperty('ConnectionState');
    expect(sessionTypes).toHaveProperty('CopilotClientOptions');

    // Session lifecycle management
    expect(sessionTypes).toHaveProperty('SessionContext');
    expect(sessionTypes).toHaveProperty('SessionListFilter');
    expect(sessionTypes).toHaveProperty('SessionMetadata');
    expect(sessionTypes).toHaveProperty('ForegroundSessionInfo');
    expect(sessionTypes).toHaveProperty('SessionLifecycleEventType');
    expect(sessionTypes).toHaveProperty('SessionLifecycleEvent');
    expect(sessionTypes).toHaveProperty('SessionLifecycleHandler');
    expect(sessionTypes).toHaveProperty('TypedSessionLifecycleHandler');

    // Session events
    expect(sessionTypes).toHaveProperty('SessionEvent');
    expect(sessionTypes).toHaveProperty('SessionEventType');
    expect(sessionTypes).toHaveProperty('SessionEventPayload');
    expect(sessionTypes).toHaveProperty('SessionEventHandler');
    expect(sessionTypes).toHaveProperty('TypedSessionEventHandler');

    // Model introspection
    expect(sessionTypes).toHaveProperty('ModelInfo');
    expect(sessionTypes).toHaveProperty('ModelCapabilities');
    expect(sessionTypes).toHaveProperty('ModelBilling');
    expect(sessionTypes).toHaveProperty('ModelPolicy');

    // Status
    expect(sessionTypes).toHaveProperty('GetStatusResponse');
    expect(sessionTypes).toHaveProperty('GetAuthStatusResponse');

    // Message options
    expect(sessionTypes).toHaveProperty('MessageOptions');

    // AssistantMessageEvent
    expect(sessionTypes).toHaveProperty('AssistantMessageEvent');
  });

  it('should not export unexpected types', () => {
    // List of known exported type keys
    const expectedKeys = [
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
      '__esModule', // Common for transpiled modules
    ];
    const exportedKeys = Object.keys(sessionTypes);
    exportedKeys.forEach((key) => {
      expect(expectedKeys).toContain(key);
    });
  });

  it('should allow importing types without runtime errors', () => {
    // Types are erased at runtime, but import should not throw
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      type T = sessionTypes.SessionContext;
    }).not.toThrow();
  });

  it('should have all exports as undefined at runtime (type-only)', () => {
    // All exports should be undefined at runtime since they are types
    Object.entries(sessionTypes).forEach(([key, value]) => {
      if (key !== '__esModule') {
        expect(value).toBeUndefined();
      }
    });
  });
});
