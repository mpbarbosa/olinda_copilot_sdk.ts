// test/claude/sdk_types.test.ts

import type {
	SDKMessage,
	SDKAssistantMessage,
	SDKUserMessage,
	SDKResultMessage,
	SDKResultSuccess,
	SDKResultError,
	SDKSystemMessage,
	HookEvent,
	HookCallbackMatcher,
	HookCallback,
	AgentDefinition,
	CanUseTool,
	EffortLevel,
} from '../../src/claude/sdk_types';

describe('claude/sdk_types type re-exports', () => {
	it('allows EffortLevel values in type positions', () => {
		const levels: EffortLevel[] = ['low', 'medium', 'high', 'max'];
		expect(levels).toHaveLength(4);
		levels.forEach(l => expect(typeof l).toBe('string'));
	});

	it('allows HookEvent values in type positions', () => {
		const events: HookEvent[] = ['PreToolUse', 'PostToolUse', 'SessionStart', 'SessionEnd', 'Stop'];
		expect(events).toHaveLength(5);
		events.forEach(e => expect(typeof e).toBe('string'));
	});

	it('allows all complex types to be used in compile-time type positions', () => {
		// TypeScript erases types at runtime; this tuple asserts each type
		// compiles correctly when used as a type annotation.
		const typeMarkers = [] as unknown as [
			SDKMessage,
			SDKAssistantMessage,
			SDKUserMessage,
			SDKResultMessage,
			SDKResultSuccess,
			SDKResultError,
			SDKSystemMessage,
			HookCallbackMatcher,
			HookCallback,
			AgentDefinition,
			CanUseTool,
		];
		expect(Array.isArray(typeMarkers)).toBe(true);
	});
});
