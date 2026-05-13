import type {
	Options,
	Query,
	SessionMutationOptions,
} from '@anthropic-ai/claude-agent-sdk';
import { ClaudeSDKError } from '../errors.js';

export interface ClaudeWarmQueryHandle {
	query(prompt: string): Query;
	close?(): void | Promise<void>;
}

type StartupFn = (params: {
	options?: Options;
	initializeTimeoutMs?: number;
}) => Promise<ClaudeWarmQueryHandle>;

type DeleteSessionFn = (
	sessionId: string,
	options?: SessionMutationOptions,
) => Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SDKCompat = Record<string, (...args: any[]) => unknown>;

let sdkCompatCache: SDKCompat | undefined;

async function getSdkCompat(): Promise<SDKCompat> {
	if (!sdkCompatCache) {
		sdkCompatCache = (await import('@anthropic-ai/claude-agent-sdk') as unknown) as SDKCompat;
	}

	return sdkCompatCache;
}

/**
 * Load the optional Claude SDK `startup()` helper used for warmup.
 * @returns The runtime startup function.
 * @throws {ClaudeSDKError} When the installed SDK version does not expose `startup()`.
 * @since 0.10.0
 */
export async function getClaudeStartup(): Promise<StartupFn> {
	const compat = await getSdkCompat();
	const startup = compat['startup'] as StartupFn | undefined;

	if (!startup) {
		throw new ClaudeSDKError(
			'startup() is not available in this version of @anthropic-ai/claude-agent-sdk',
		);
	}

	return startup;
}

/**
 * Load the optional Claude SDK `deleteSession()` helper for session administration.
 * @returns The runtime deleteSession function.
 * @throws {ClaudeSDKError} When the installed SDK version does not expose `deleteSession()`.
 * @since 0.10.0
 */
export async function getClaudeDeleteSession(): Promise<DeleteSessionFn> {
	const compat = await getSdkCompat();
	const deleteSession = compat['deleteSession'] as DeleteSessionFn | undefined;

	if (!deleteSession) {
		throw new ClaudeSDKError(
			'deleteSession() is not available in this version of @anthropic-ai/claude-agent-sdk',
		);
	}

	return deleteSession;
}
