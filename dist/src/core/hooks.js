"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHooks = createHooks;
exports.approveAllTools = approveAllTools;
exports.denyTools = denyTools;
const copilot_sdk_1 = require("@github/copilot-sdk");
/**
 * Creates a typed {@link SessionHooks} object from a partial config.
 *
 * This is a typed factory that gives full type inference when building hook
 * configs incrementally. Pass the result directly to `SessionConfig.hooks`.
 * The returned object is structurally assignable to `@github/copilot-sdk`'s
 * `SessionHooks` — no conversion needed.
 *
 * @param config - A partial set of session hook handlers.
 * @returns A `SessionHooks` object containing the provided handlers.
 * @since 0.2.1
 * @example
 * ```ts
 * const hooks = createHooks({
 *   onPreToolUse: (input) => input.toolName === 'bash' ? { permissionDecision: 'deny' } : undefined,
 *   onSessionEnd: async (input) => ({ sessionSummary: input.reason }),
 * });
 * ```
 */
function createHooks(config) {
    return { ...config };
}
/**
 * Returns a {@link PermissionHandler} that unconditionally approves every
 * permission request — equivalent to the SDK's `approveAll` constant, but as
 * a factory function for use when a fresh instance is required (e.g. per-test
 * isolation or conditional wrapping).
 *
 * Pass the result to `SessionConfig.onPermissionRequest`.
 *
 * **Breaking change from 0.2.x:** Previously returned a `PreToolUseHandler`.
 * To approve all tool invocations via hooks, use an inline handler instead:
 * `createHooks({ onPreToolUse: () => ({ permissionDecision: 'allow' }) })`.
 *
 * @returns A `PermissionHandler` that approves every request.
 * @since 0.4.1
 * @example
 * ```ts
 * const config: SessionConfig = { onPermissionRequest: approveAllTools() };
 * ```
 */
function approveAllTools() {
    return copilot_sdk_1.approveAll;
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
