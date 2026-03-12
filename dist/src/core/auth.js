"use strict";
/**
 * Authentication types and utilities for the GitHub Copilot SDK.
 * @module core/auth
 * @description Typed authentication strategy abstractions that mirror the
 * `@github/copilot-sdk` priority order. Supports GitHub tokens, HMAC keys,
 * environment-variable chains, and Bring Your Own Key (BYOK) providers.
 * @since 0.2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGitHubToken = isGitHubToken;
exports.resolveHmacFromEnv = resolveHmacFromEnv;
exports.resolveAuthPriority = resolveAuthPriority;
// ── Utilities ─────────────────────────────────────────────────────────────────
/** Known GitHub token prefixes, in recognition-order. */
const GITHUB_TOKEN_PREFIXES = ['gho_', 'ghu_', 'github_pat_'];
/**
 * Env var names checked for a direct Copilot API token (step 3 in priority order).
 * @internal
 */
const DIRECT_TOKEN_VARS = ['COPILOT_TOKEN', 'GITHUB_COPILOT_TOKEN'];
/**
 * Env var names checked in the standard GitHub token chain (step 4).
 * @internal
 */
const ENV_TOKEN_CHAIN = ['COPILOT_GITHUB_TOKEN', 'GH_TOKEN', 'GITHUB_TOKEN'];
/**
 * Returns `true` if the token has a recognised GitHub OAuth or PAT prefix.
 * @param token - The token string to check.
 * @returns `true` when the token starts with `gho_`, `ghu_`, or `github_pat_`.
 * @since 0.2.0
 * @example
 * isGitHubToken('gho_abc');        // true
 * isGitHubToken('github_pat_xyz'); // true
 * isGitHubToken('sk-...');         // false
 */
function isGitHubToken(token) {
    return GITHUB_TOKEN_PREFIXES.some((prefix) => token.startsWith(prefix));
}
/**
 * Reads an HMAC key pair from the environment.
 * Expects both `COPILOT_HMAC_KEY_ID` and `COPILOT_HMAC_KEY_SECRET` to be set.
 * @param env - The environment object to read from.
 * @returns A `HmacKeyConfig` when both vars are present, otherwise `null`.
 * @since 0.2.0
 */
function resolveHmacFromEnv(env) {
    const keyId = env['COPILOT_HMAC_KEY_ID'];
    const secret = env['COPILOT_HMAC_KEY_SECRET'];
    if (keyId && secret)
        return { keyId, secret };
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
 * @since 0.2.0
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
function resolveAuthPriority(options, env = process.env) {
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
        if (token)
            return { method: 'direct-api-token', token };
    }
    // 4. Standard GitHub env-var chain
    for (const varName of ENV_TOKEN_CHAIN) {
        const token = env[varName];
        if (token)
            return { method: 'env-token', token };
    }
    // 5 & 6. Stored OAuth / GitHub CLI — require async I/O from the caller.
    // Signal availability when useLoggedInUser is not explicitly false.
    if (options.useLoggedInUser !== false) {
        return { method: 'stored-oauth' };
    }
    return null;
}
