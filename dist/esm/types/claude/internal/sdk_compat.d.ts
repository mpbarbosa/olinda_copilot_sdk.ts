import type { Options, Query, SessionMutationOptions } from '@anthropic-ai/claude-agent-sdk';
export interface ClaudeWarmQueryHandle {
    query(prompt: string): Query;
    close?(): void | Promise<void>;
}
type StartupFn = (params: {
    options?: Options;
    initializeTimeoutMs?: number;
}) => Promise<ClaudeWarmQueryHandle>;
type DeleteSessionFn = (sessionId: string, options?: SessionMutationOptions) => Promise<void>;
/**
 * Load the optional Claude SDK `startup()` helper used for warmup.
 * @returns The runtime startup function.
 * @throws {ClaudeSDKError} When the installed SDK version does not expose `startup()`.
 * @since 0.10.0
 */
export declare function getClaudeStartup(): Promise<StartupFn>;
/**
 * Load the optional Claude SDK `deleteSession()` helper for session administration.
 * @returns The runtime deleteSession function.
 * @throws {ClaudeSDKError} When the installed SDK version does not expose `deleteSession()`.
 * @since 0.10.0
 */
export declare function getClaudeDeleteSession(): Promise<DeleteSessionFn>;
export {};
