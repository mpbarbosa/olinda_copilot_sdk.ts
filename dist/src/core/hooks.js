"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHooks = createHooks;
exports.approveAllTools = approveAllTools;
exports.denyTools = denyTools;
/**
 * Creates a typed {@link SessionHooks} object from a partial config.
 *
 * This is a typed factory that gives full type inference when building hook
 * configs incrementally. Pass the result directly to `SessionConfig.hooks`.
 *
 * @param config - A partial set of session hook handlers.
 * @returns A `SessionHooks` object containing the provided handlers.
 * @since 0.2.1
 * @example
 * ```ts
 * const hooks = createHooks({
 *   onPreToolUse: approveAllTools(),
 *   onSessionEnd: async (input) => ({ sessionSummary: input.reason }),
 * });
 * ```
 */
function createHooks(config) {
    return { ...config };
}
/**
 * Returns a {@link PreToolUseHandler} that unconditionally approves every
 * tool invocation.
 *
 * Useful as a starting point when building a whitelist-based permission model
 * or during development/testing.
 *
 * @returns A pre-tool-use handler that always returns `{ permissionDecision: 'allow' }`.
 * @since 0.2.1
 * @example
 * ```ts
 * const hooks = createHooks({ onPreToolUse: approveAllTools() });
 * ```
 */
function approveAllTools() {
    return () => ({ permissionDecision: 'allow' });
}
/**
 * Returns a {@link PreToolUseHandler} that denies a specific set of tools by
 * name and passes all others through.
 *
 * @param toolNames - The tool names to deny.
 * @param reason - Optional human-readable reason included in the decision.
 * @returns A pre-tool-use handler that denies listed tools and returns `void` for others.
 * @since 0.2.1
 * @example
 * ```ts
 * const hooks = createHooks({
 *   onPreToolUse: denyTools(['bash', 'write_file'], 'blocked by policy'),
 * });
 * ```
 */
function denyTools(toolNames, reason) {
    const blocked = new Set(toolNames);
    return (input) => {
        if (!blocked.has(input.toolName))
            return;
        const out = { permissionDecision: 'deny' };
        if (reason !== undefined)
            out.permissionDecisionReason = reason;
        return out;
    };
}
