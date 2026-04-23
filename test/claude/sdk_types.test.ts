// test/claude/sdk_types.test.ts

import type {
	Options,
	PermissionMode,
	Query,
	WarmQuery,
	SDKMessage,
	SDKAssistantMessage,
	SDKUserMessage,
	SDKResultMessage,
	SDKResultSuccess,
	SDKResultError,
	SDKSystemMessage,
	SDKSessionInfo,
	SessionMessage,
	ListSessionsOptions,
	GetSessionInfoOptions,
	GetSessionMessagesOptions,
	SessionMutationOptions,
	HookEvent,
	HookCallbackMatcher,
	HookCallback,
	AgentDefinition,
	CanUseTool,
	EffortLevel,
} from '../../src/claude/sdk_types';

describe('claude/sdk_types type re-exports', () => {
	it('allows PermissionMode values in type positions', () => {
		const modes: PermissionMode[] = [
			'default', 'acceptEdits', 'bypassPermissions', 'plan', 'dontAsk', 'auto',
		];
		expect(modes).toHaveLength(6);
		modes.forEach(m => expect(typeof m).toBe('string'));
	});

	it('allows EffortLevel values in type positions', () => {
		const levels: EffortLevel[] = ['low', 'medium', 'high', 'xhigh', 'max'];
		expect(levels).toHaveLength(5);
		levels.forEach(l => expect(typeof l).toBe('string'));
	});

	it('allows HookEvent values in type positions', () => {
		const events: HookEvent[] = ['PreToolUse', 'PostToolUse', 'SessionStart', 'SessionEnd', 'Stop'];
		expect(events).toHaveLength(5);
		events.forEach(e => expect(typeof e).toBe('string'));
	});

	it('allows all complex types to be used in type positions', () => {
		// TypeScript erases types at runtime; this tuple asserts each type
		// compiles correctly when used as a type annotation.
		const typeMarkers = [] as unknown as [
			Options,
			Query,
			WarmQuery,
			SDKMessage,
			SDKAssistantMessage,
			SDKUserMessage,
			SDKResultMessage,
			SDKResultSuccess,
			SDKResultError,
			SDKSystemMessage,
			SDKSessionInfo,
			SessionMessage,
			HookCallbackMatcher,
			HookCallback,
			AgentDefinition,
			CanUseTool,
		];
		expect(typeMarkers).toHaveLength(0);
	});

	it('allows session option types to be used in type positions', () => {
		const listOpts: ListSessionsOptions = {};
		const infoOpts: GetSessionInfoOptions = {};
		const msgsOpts: GetSessionMessagesOptions = {};
		const mutateOpts: SessionMutationOptions = {};
		expect(listOpts).toBeDefined();
		expect(infoOpts).toBeDefined();
		expect(msgsOpts).toBeDefined();
		expect(mutateOpts).toBeDefined();
	});
});
