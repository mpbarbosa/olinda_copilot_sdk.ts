import { buildClaudeSdkOptions } from '../../../src/claude/internal/sdk_options';

describe('buildClaudeSdkOptions', () => {
	it('returns an empty object when no sources are provided', () => {
		expect(buildClaudeSdkOptions()).toEqual({});
	});

	it('returns an empty object when all sources are undefined', () => {
		expect(buildClaudeSdkOptions(undefined, undefined)).toEqual({});
	});

	it('copies all defined properties from a single source', () => {
		const source = {
			model: 'claude-3',
			cwd: '/tmp',
			permissionMode: 'default' as const,
			maxTurns: 5,
			systemPrompt: 'You are Claude.',
		};
		expect(buildClaudeSdkOptions(source)).toEqual(source);
	});

	it('ignores undefined properties in a single source', () => {
		const source = {
			model: 'claude-3',
			cwd: undefined,
			permissionMode: undefined,
			maxTurns: 2,
			systemPrompt: undefined,
		};
		expect(buildClaudeSdkOptions(source)).toEqual({
			model: 'claude-3',
			maxTurns: 2,
		});
	});

	it('merges multiple sources, later sources override earlier ones', () => {
		const base = {
			model: 'claude-2',
			cwd: '/base',
			permissionMode: 'acceptEdits' as const,
			maxTurns: 1,
			systemPrompt: 'Base prompt',
		};
		const override = {
			model: 'claude-3',
			cwd: '/override',
			maxTurns: 10,
		};
		const result = buildClaudeSdkOptions(base, override);
		expect(result).toEqual({
			model: 'claude-3',
			cwd: '/override',
			permissionMode: 'acceptEdits',
			maxTurns: 10,
			systemPrompt: 'Base prompt',
		});
	});

	it('skips undefined sources in the merge', () => {
		const a = { model: 'a' };
		const b = undefined;
		const c = { cwd: '/c' };
		expect(buildClaudeSdkOptions(a, b, c)).toEqual({
			model: 'a',
			cwd: '/c',
		});
	});

	it('handles sources with only one property', () => {
		expect(buildClaudeSdkOptions({ model: 'x' })).toEqual({ model: 'x' });
		expect(buildClaudeSdkOptions({ cwd: '/foo' })).toEqual({ cwd: '/foo' });
		expect(buildClaudeSdkOptions({ permissionMode: 'bypassPermissions' })).toEqual({ permissionMode: 'bypassPermissions' });
		expect(buildClaudeSdkOptions({ maxTurns: 3 })).toEqual({ maxTurns: 3 });
		expect(buildClaudeSdkOptions({ systemPrompt: 'Prompt' })).toEqual({ systemPrompt: 'Prompt' });
	});

	it('later sources can unset properties by omitting them (but not by setting undefined)', () => {
		const a = { model: 'a', cwd: '/a' };
		const b = { model: 'b' }; // cwd omitted, so stays as /a
		expect(buildClaudeSdkOptions(a, b)).toEqual({ model: 'b', cwd: '/a' });
	});

	it('does not include properties set to undefined in later sources', () => {
		const a = { model: 'a', cwd: '/a' };
		const b = { model: undefined };
		expect(buildClaudeSdkOptions(a, b)).toEqual({ model: 'a', cwd: '/a' });
	});
});
