import {
	createHooks,
	approveAllTools,
	denyTools,
	type PreToolUseInput,
	type SessionHooks,
	type HooksConfig,
} from '../../src/core/hooks.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const baseInput = {
	timestamp: Date.now(),
	cwd: '/workspace',
};

function makePreInput(toolName: string, toolArgs: unknown = {}): PreToolUseInput {
	return { ...baseInput, toolName, toolArgs };
}

const invocation = { sessionId: 'sess-001' };

// ---------------------------------------------------------------------------
// createHooks
// ---------------------------------------------------------------------------

describe('createHooks', () => {
	it('returns an empty SessionHooks when given an empty config', () => {
		const hooks = createHooks({});
		expect(hooks).toEqual({});
	});

	it('preserves a single handler', () => {
		const handler = jest.fn();
		const hooks = createHooks({ onPreToolUse: handler });
		expect(hooks.onPreToolUse).toBe(handler);
	});

	it('preserves all six handlers when provided', () => {
		const config: HooksConfig = {
			onPreToolUse: jest.fn(),
			onPostToolUse: jest.fn(),
			onUserPromptSubmitted: jest.fn(),
			onSessionStart: jest.fn(),
			onSessionEnd: jest.fn(),
			onErrorOccurred: jest.fn(),
		};
		const hooks = createHooks(config);
		expect(hooks.onPreToolUse).toBe(config.onPreToolUse);
		expect(hooks.onPostToolUse).toBe(config.onPostToolUse);
		expect(hooks.onUserPromptSubmitted).toBe(config.onUserPromptSubmitted);
		expect(hooks.onSessionStart).toBe(config.onSessionStart);
		expect(hooks.onSessionEnd).toBe(config.onSessionEnd);
		expect(hooks.onErrorOccurred).toBe(config.onErrorOccurred);
	});

	it('does not mutate the original config object', () => {
		const config: HooksConfig = { onPreToolUse: jest.fn() };
		createHooks(config);
		expect(Object.keys(config)).toHaveLength(1);
	});

	it('result is assignable as SessionHooks', () => {
		const hooks: SessionHooks = createHooks({});
		expect(hooks).toBeDefined();
	});
});

// ---------------------------------------------------------------------------
// approveAllTools
// ---------------------------------------------------------------------------

describe('approveAllTools', () => {
	it('returns a function', () => {
		expect(typeof approveAllTools()).toBe('function');
	});

	it('always returns { permissionDecision: "allow" }', () => {
		const handler = approveAllTools();
		const result = handler(makePreInput('bash'), invocation);
		expect(result).toEqual({ permissionDecision: 'allow' });
	});

	it('allows tools with any name', () => {
		const handler = approveAllTools();
		for (const name of ['bash', 'write_file', 'read_file', 'unknown_tool']) {
			const result = handler(makePreInput(name), invocation);
			expect((result as any).permissionDecision).toBe('allow');
		}
	});

	it('returns a new handler each call', () => {
		expect(approveAllTools()).not.toBe(approveAllTools());
	});

	it('handler is synchronous (no Promise)', () => {
		const handler = approveAllTools();
		const result = handler(makePreInput('bash'), invocation);
		expect(result).not.toBeInstanceOf(Promise);
	});
});

// ---------------------------------------------------------------------------
// denyTools
// ---------------------------------------------------------------------------

describe('denyTools', () => {
	it('returns a function', () => {
		expect(typeof denyTools([])).toBe('function');
	});

	it('denies a single listed tool', () => {
		const handler = denyTools(['bash']);
		const result = handler(makePreInput('bash'), invocation);
		expect(result).toMatchObject({ permissionDecision: 'deny' });
	});

	it('denies multiple listed tools', () => {
		const handler = denyTools(['bash', 'write_file', 'python']);
		for (const name of ['bash', 'write_file', 'python']) {
			const result = handler(makePreInput(name), invocation);
			expect((result as any).permissionDecision).toBe('deny');
		}
	});

	it('returns void for unlisted tools', () => {
		const handler = denyTools(['bash']);
		const result = handler(makePreInput('read_file'), invocation);
		expect(result).toBeUndefined();
	});

	it('returns void for all tools when list is empty', () => {
		const handler = denyTools([]);
		const result = handler(makePreInput('bash'), invocation);
		expect(result).toBeUndefined();
	});

	it('includes the reason when provided', () => {
		const handler = denyTools(['bash'], 'blocked by policy');
		const result = handler(makePreInput('bash'), invocation) as any;
		expect(result.permissionDecisionReason).toBe('blocked by policy');
	});

	it('omits permissionDecisionReason when no reason is given', () => {
		const handler = denyTools(['bash']);
		const result = handler(makePreInput('bash'), invocation) as any;
		expect(result).not.toHaveProperty('permissionDecisionReason');
	});

	it('does not include reason in the output for allowed tools', () => {
		const handler = denyTools(['bash'], 'blocked');
		const result = handler(makePreInput('read_file'), invocation);
		expect(result).toBeUndefined();
	});

	it('is case-sensitive for tool names', () => {
		const handler = denyTools(['Bash']);
		const result = handler(makePreInput('bash'), invocation);
		expect(result).toBeUndefined();
	});

	it('returns a synchronous result (no Promise)', () => {
		const handler = denyTools(['bash']);
		const result = handler(makePreInput('bash'), invocation);
		expect(result).not.toBeInstanceOf(Promise);
	});

	it('creates an independent handler each call', () => {
		expect(denyTools(['bash'])).not.toBe(denyTools(['bash']));
	});

	it('handler for different deny lists works independently', () => {
		const h1 = denyTools(['bash']);
		const h2 = denyTools(['python']);
		expect((h1(makePreInput('bash'), invocation) as any)?.permissionDecision).toBe('deny');
		expect(h1(makePreInput('python'), invocation)).toBeUndefined();
		expect((h2(makePreInput('python'), invocation) as any)?.permissionDecision).toBe('deny');
		expect(h2(makePreInput('bash'), invocation)).toBeUndefined();
	});

	it('works with a large deny list', () => {
		const names = Array.from({ length: 100 }, (_, i) => `tool_${i}`);
		const handler = denyTools(names);
		for (const name of names) {
			expect((handler(makePreInput(name), invocation) as any)?.permissionDecision).toBe('deny');
		}
		expect(handler(makePreInput('unlisted'), invocation)).toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
// Handler signature compatibility
// ---------------------------------------------------------------------------

describe('handler type compatibility', () => {
	it('approveAllTools handler accepts PostToolUseInput (structural check)', () => {
		// PostToolUseInput is not a PreToolUseInput but we test shape safety
		const pre = makePreInput('read_file');
		const handler = approveAllTools();
		expect(() => handler(pre, invocation)).not.toThrow();
	});

	it('createHooks preserves handler identity after round-trip', () => {
		const myHandler = approveAllTools();
		const hooks = createHooks({ onPreToolUse: myHandler });
		const result = hooks.onPreToolUse!(makePreInput('bash'), invocation);
		expect((result as any).permissionDecision).toBe('allow');
	});

	it('denyTools handler output includes only permissionDecision when no reason', () => {
		const handler = denyTools(['bash']);
		const result = handler(makePreInput('bash'), invocation) as Record<string, unknown>;
		expect(Object.keys(result)).toEqual(['permissionDecision']);
	});
});
