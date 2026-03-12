/**
 * Authentication types and utilities for the GitHub Copilot SDK.
 * @module core/auth
 * @description Typed authentication strategy abstractions that mirror the
 * `@github/copilot-sdk` priority order. Supports GitHub tokens, HMAC keys,
 * environment-variable chains, and Bring Your Own Key (BYOK) providers.
 * @since 0.2.1
 */

// ── BYOK providers ────────────────────────────────────────────────────────────

/**
 * Azure AI Foundry BYOK provider.
 * @since 0.2.1
 * @example
 * const provider: AzureProvider = {
 *   type: 'azure',
 *   endpoint: 'https://my-hub.openai.azure.com',
 *   apiKey: 'az-key',
 *   deploymentId: 'gpt-4o',
 * };
 */
export interface AzureProvider {
	/** Discriminant tag. */
	type: 'azure';
	/** Azure AI Foundry endpoint URL. */
	endpoint: string;
	/** Azure API key. */
	apiKey: string;
	/** Deployment / model ID. */
	deploymentId: string;
}

/**
 * OpenAI BYOK provider.
 * @since 0.2.1
 * @example
 * const provider: OpenAIProvider = {
 *   type: 'openai',
 *   apiKey: 'sk-...',
 *   model: 'gpt-4o',
 * };
 */
export interface OpenAIProvider {
	/** Discriminant tag. */
	type: 'openai';
	/** OpenAI API key. */
	apiKey: string;
	/** Model identifier (e.g. `'gpt-4o'`). */
	model: string;
}

/**
 * Anthropic BYOK provider.
 * @since 0.2.1
 * @example
 * const provider: AnthropicProvider = {
 *   type: 'anthropic',
 *   apiKey: 'sk-ant-...',
 *   model: 'claude-sonnet-4',
 * };
 */
export interface AnthropicProvider {
	/** Discriminant tag. */
	type: 'anthropic';
	/** Anthropic API key. */
	apiKey: string;
	/** Model identifier (e.g. `'claude-sonnet-4'`). */
	model: string;
}

/**
 * Generic OpenAI-compatible endpoint BYOK provider.
 * @since 0.2.1
 * @example
 * const provider: OpenAICompatibleProvider = {
 *   type: 'openai-compatible',
 *   url: 'https://my-llm-proxy.example.com/v1',
 *   apiKey: 'my-key',
 * };
 */
export interface OpenAICompatibleProvider {
	/** Discriminant tag. */
	type: 'openai-compatible';
	/** Full base URL of the OpenAI-compatible endpoint. */
	url: string;
	/** API key for the endpoint. */
	apiKey: string;
	/** Optional model override. */
	model?: string;
}

/**
 * Union of all supported Bring Your Own Key providers.
 * @since 0.2.1
 */
export type BYOKProvider =
	| AzureProvider
	| OpenAIProvider
	| AnthropicProvider
	| OpenAICompatibleProvider;

// ── Auth option types ─────────────────────────────────────────────────────────

/**
 * HMAC key pair for enterprise/backend authentication.
 * @since 0.2.1
 */
export interface HmacKeyConfig {
	/** HMAC key identifier. */
	keyId: string;
	/** HMAC shared secret. */
	secret: string;
}

/**
 * Auth configuration options passed to the SDK client or session.
 * Not all fields need to be set — `resolveAuthPriority` determines which
 * method is chosen based on priority order.
 * @since 0.2.1
 * @example
 * // Use an explicit GitHub token
 * const opts: AuthOptions = { githubToken: 'gho_...' };
 *
 * // Use BYOK with Anthropic
 * const opts: AuthOptions = {
 *   provider: { type: 'anthropic', apiKey: 'sk-ant-...', model: 'claude-sonnet-4' },
 * };
 */
export interface AuthOptions {
	/**
	 * Explicit GitHub OAuth or PAT token.
	 * Accepted prefixes: `gho_`, `ghu_`, `github_pat_`.
	 * Takes highest priority in resolution.
	 */
	githubToken?: string;
	/**
	 * HMAC key pair for enterprise/backend authentication.
	 * Takes priority over env-var token chains.
	 */
	hmacKey?: HmacKeyConfig;
	/**
	 * When `false`, prevents falling back to stored OAuth credentials
	 * or GitHub CLI credentials. Default: `true`.
	 */
	useLoggedInUser?: boolean;
	/**
	 * Bring Your Own Key provider to route completions through
	 * a third-party model instead of GitHub Copilot.
	 */
	provider?: BYOKProvider;
}

// ── Resolved auth ─────────────────────────────────────────────────────────────

/**
 * The authentication method chosen by `resolveAuthPriority`.
 *
 * | Method | Token present | Notes |
 * |---|---|---|
 * | `'github-token'` | ✅ | From `AuthOptions.githubToken` |
 * | `'hmac-key'` | ❌ | `hmacKey` field populated instead |
 * | `'direct-api-token'` | ✅ | From `COPILOT_TOKEN` env var |
 * | `'env-token'` | ✅ | From env var chain |
 * | `'stored-oauth'` | ❌ | Caller must fetch token via async I/O |
 *
 * @since 0.2.1
 */
export type AuthMethod =
	| 'github-token'
	| 'hmac-key'
	| 'direct-api-token'
	| 'env-token'
	| 'stored-oauth';

/**
 * The result of `resolveAuthPriority`.
 * @since 0.2.1
 */
export interface ResolvedAuth {
	/** The chosen authentication method. */
	method: AuthMethod;
	/**
	 * The resolved token string.
	 * Present for `'github-token'`, `'direct-api-token'`, and `'env-token'` methods.
	 * Absent for `'hmac-key'` and `'stored-oauth'` methods.
	 */
	token?: string;
	/**
	 * The resolved HMAC key pair.
	 * Present only when `method === 'hmac-key'`.
	 */
	hmacKey?: HmacKeyConfig;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

/** Known GitHub token prefixes, in recognition-order. */
const GITHUB_TOKEN_PREFIXES = ['gho_', 'ghu_', 'github_pat_'] as const;

/**
 * Env var names checked for a direct Copilot API token (step 3 in priority order).
 * @internal
 */
const DIRECT_TOKEN_VARS = ['COPILOT_TOKEN', 'GITHUB_COPILOT_TOKEN'] as const;

/**
 * Env var names checked in the standard GitHub token chain (step 4).
 * @internal
 */
const ENV_TOKEN_CHAIN = ['COPILOT_GITHUB_TOKEN', 'GH_TOKEN', 'GITHUB_TOKEN'] as const;

/**
 * Returns `true` if the token has a recognised GitHub OAuth or PAT prefix.
 * @param token - The token string to check.
 * @returns `true` when the token starts with `gho_`, `ghu_`, or `github_pat_`.
 * @since 0.2.1
 * @example
 * isGitHubToken('gho_abc');        // true
 * isGitHubToken('github_pat_xyz'); // true
 * isGitHubToken('sk-...');         // false
 */
export function isGitHubToken(token: string): boolean {
	return GITHUB_TOKEN_PREFIXES.some((prefix) => token.startsWith(prefix));
}

/**
 * Reads an HMAC key pair from the environment.
 * Expects both `COPILOT_HMAC_KEY_ID` and `COPILOT_HMAC_KEY_SECRET` to be set.
 * @param env - The environment object to read from.
 * @returns A `HmacKeyConfig` when both vars are present, otherwise `null`.
 * @since 0.2.1
 */
export function resolveHmacFromEnv(env: Record<string, string | undefined>): HmacKeyConfig | null {
	const keyId = env['COPILOT_HMAC_KEY_ID'];
	const secret = env['COPILOT_HMAC_KEY_SECRET'];
	if (keyId && secret) return { keyId, secret };
	return null;
}

/**
 * Resolves which authentication method to use, following the SDK's priority order:
 *
 * 1. Explicit `githubToken` in `options`
 * 2. HMAC key — from `options.hmacKey`, or `COPILOT_HMAC_KEY_ID` + `COPILOT_HMAC_KEY_SECRET` env vars
 * 3. Direct API token — `COPILOT_TOKEN` or `GITHUB_COPILOT_TOKEN` env var
 * 4. Env-var chain — `COPILOT_GITHUB_TOKEN` → `GH_TOKEN` → `GITHUB_TOKEN`
 * 5. Stored OAuth / GitHub CLI credentials — signalled as `stored-oauth` when
 *    `useLoggedInUser` is not `false`; caller must perform async I/O to retrieve the token.
 *
 * When `useLoggedInUser` is `false`, step 5 is skipped and `null` is returned.
 *
 * @param options - Auth configuration.
 * @param env - Environment variable map. Defaults to `process.env`. Pass a plain
 *   object in tests to avoid reading from the real environment.
 * @returns A `ResolvedAuth` describing the chosen method, or `null` if no auth
 *   can be resolved.
 * @since 0.2.1
 * @example
 * // Explicit token — highest priority
 * resolveAuthPriority({ githubToken: 'gho_abc' });
 * // → { method: 'github-token', token: 'gho_abc' }
 *
 * // Env-var chain
 * resolveAuthPriority({}, { GITHUB_TOKEN: 'ghs_xyz' });
 * // → { method: 'env-token', token: 'ghs_xyz' }
 *
 * // Nothing matches and useLoggedInUser is false
 * resolveAuthPriority({ useLoggedInUser: false }, {});
 * // → null
 */
export function resolveAuthPriority(
	options: AuthOptions,
	env: Record<string, string | undefined> = process.env,
): ResolvedAuth | null {
	// 1. Explicit GitHub token in options
	if (options.githubToken) {
		return { method: 'github-token', token: options.githubToken };
	}

	// 2. HMAC key — from options first, then from env
	const hmacKey = options.hmacKey ?? resolveHmacFromEnv(env);
	if (hmacKey) {
		return { method: 'hmac-key', hmacKey };
	}

	// 3. Direct Copilot API token from env
	for (const varName of DIRECT_TOKEN_VARS) {
		const token = env[varName];
		if (token) return { method: 'direct-api-token', token };
	}

	// 4. Standard GitHub env-var chain
	for (const varName of ENV_TOKEN_CHAIN) {
		const token = env[varName];
		if (token) return { method: 'env-token', token };
	}

	// 5 & 6. Stored OAuth / GitHub CLI — require async I/O from the caller.
	// Signal availability when useLoggedInUser is not explicitly false.
	if (options.useLoggedInUser !== false) {
		return { method: 'stored-oauth' };
	}

	return null;
}
