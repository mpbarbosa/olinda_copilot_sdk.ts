import { ClaudeSDKError } from '../errors.js';
let sdkCompatCache;
async function getSdkCompat() {
    if (!sdkCompatCache) {
        sdkCompatCache = await import('@anthropic-ai/claude-agent-sdk');
    }
    return sdkCompatCache;
}
/**
 * Load the optional Claude SDK `startup()` helper used for warmup.
 * @returns The runtime startup function.
 * @throws {ClaudeSDKError} When the installed SDK version does not expose `startup()`.
 * @since 0.10.0
 */
export async function getClaudeStartup() {
    const compat = await getSdkCompat();
    const startup = compat['startup'];
    if (!startup) {
        throw new ClaudeSDKError('startup() is not available in this version of @anthropic-ai/claude-agent-sdk');
    }
    return startup;
}
/**
 * Load the optional Claude SDK `deleteSession()` helper for session administration.
 * @returns The runtime deleteSession function.
 * @throws {ClaudeSDKError} When the installed SDK version does not expose `deleteSession()`.
 * @since 0.10.0
 */
export async function getClaudeDeleteSession() {
    const compat = await getSdkCompat();
    const deleteSession = compat['deleteSession'];
    if (!deleteSession) {
        throw new ClaudeSDKError('deleteSession() is not available in this version of @anthropic-ai/claude-agent-sdk');
    }
    return deleteSession;
}
