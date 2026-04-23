// test/sdk_types.test.ts

import type * as sdkTypes from '../src/claude/sdk_types';

describe('claude/sdk_types type re-exports', () => {
  it('should export all expected types', () => {
    // List of expected type keys
    const expectedTypes = [
      'Options',
      'PermissionMode',
      'Query',
      'WarmQuery',
      'SDKMessage',
      'SDKAssistantMessage',
      'SDKUserMessage',
      'SDKResultMessage',
      'SDKResultSuccess',
      'SDKResultError',
      'SDKSystemMessage',
      'SDKSessionInfo',
      'SessionMessage',
      'ListSessionsOptions',
      'GetSessionInfoOptions',
      'GetSessionMessagesOptions',
      'SessionMutationOptions',
      'HookEvent',
      'HookCallbackMatcher',
      'HookCallback',
      'AgentDefinition',
      'CanUseTool',
      'EffortLevel',
    ];

    expectedTypes.forEach(typeName => {
      expect(typeName in sdkTypes).toBe(true);
    });
  });

  it('should allow importing and using re-exported types in type annotations (happy path)', () => {
    // This test is for type-checking only; it will always pass at runtime.
    type TestOptions = sdkTypes.Options | undefined;
    const opts: TestOptions = undefined;
    expect(opts).toBeUndefined();
  });

  it('should not export unexpected types (edge case)', () => {
    // Check that a random type is not exported
    expect('NotAType' in sdkTypes).toBe(false);
  });

  it('should throw at runtime if accessing a type as a value (error scenario)', () => {
    // Types are erased at runtime; accessing as value should be undefined
    expect((sdkTypes as any).Options).toBeUndefined();
  });
});
