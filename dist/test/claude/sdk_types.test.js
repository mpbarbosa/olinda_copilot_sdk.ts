"use strict";
// test/claude/sdk_types.test.ts
Object.defineProperty(exports, "__esModule", { value: true });
describe('claude/sdk_types type re-exports', () => {
    it('allows PermissionMode values in type positions', () => {
        const modes = [
            'default', 'acceptEdits', 'bypassPermissions', 'plan', 'dontAsk', 'auto',
        ];
        expect(modes).toHaveLength(6);
        modes.forEach(m => expect(typeof m).toBe('string'));
    });
    it('allows EffortLevel values in type positions', () => {
        const levels = ['low', 'medium', 'high', 'xhigh', 'max'];
        expect(levels).toHaveLength(5);
        levels.forEach(l => expect(typeof l).toBe('string'));
    });
    it('allows HookEvent values in type positions', () => {
        const events = ['PreToolUse', 'PostToolUse', 'SessionStart', 'SessionEnd', 'Stop'];
        expect(events).toHaveLength(5);
        events.forEach(e => expect(typeof e).toBe('string'));
    });
    it('allows all complex types to be used in type positions', () => {
        // TypeScript erases types at runtime; this tuple asserts each type
        // compiles correctly when used as a type annotation.
        const typeMarkers = [];
        expect(typeMarkers).toHaveLength(0);
    });
    it('allows session option types to be used in type positions', () => {
        const listOpts = {};
        const infoOpts = {};
        const msgsOpts = {};
        const mutateOpts = {};
        expect(listOpts).toBeDefined();
        expect(infoOpts).toBeDefined();
        expect(msgsOpts).toBeDefined();
        expect(mutateOpts).toBeDefined();
    });
});
