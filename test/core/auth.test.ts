import {
	resolveAuthPriority,
	isGitHubToken,
	resolveHmacFromEnv,
} from '../../src/core/auth';
import type {
	AuthOptions,
	ResolvedAuth,
	HmacKeyConfig,
} from '../../src/core/auth';

// ── isGitHubToken ─────────────────────────────────────────────────────────────

describe('isGitHubToken', () => {
	it.each([
		['gho_abc123', true],
		['ghu_xyz789', true],
		['github_pat_ABCDE', true],
		['sk-openai-key', false],
		['', false],
		['Bearer gho_abc', false],
		['ghp_legacytoken', false],
	])('isGitHubToken(%s) → %s', (token, expected) => {
		expect(isGitHubToken(token)).toBe(expected);
	});
});

// ── resolveHmacFromEnv ────────────────────────────────────────────────────────

describe('resolveHmacFromEnv', () => {
	it('returns HmacKeyConfig when both vars are present', () => {
		const env = {
			COPILOT_HMAC_KEY_ID: 'kid-001',
			COPILOT_HMAC_KEY_SECRET: 'secret-abc',
		};
		expect(resolveHmacFromEnv(env)).toEqual<HmacKeyConfig>({
			keyId: 'kid-001',
			secret: 'secret-abc',
		});
	});

	it('returns null when KEY_ID is missing', () => {
		expect(resolveHmacFromEnv({ COPILOT_HMAC_KEY_SECRET: 's' })).toBeNull();
	});

	it('returns null when KEY_SECRET is missing', () => {
		expect(resolveHmacFromEnv({ COPILOT_HMAC_KEY_ID: 'k' })).toBeNull();
	});

	it('returns null for an empty env', () => {
		expect(resolveHmacFromEnv({})).toBeNull();
	});
});

// ── resolveAuthPriority ───────────────────────────────────────────────────────

describe('resolveAuthPriority', () => {
	// helper: builds a clean empty env
	const emptyEnv = (): Record<string, string | undefined> => ({});

	// ── Priority 1: explicit githubToken ──────────────────────────────────────

	describe('priority 1 — explicit githubToken', () => {
		it('returns github-token method with the supplied token', () => {
			const result = resolveAuthPriority({ githubToken: 'gho_abc' }, emptyEnv());
			expect(result).toEqual<ResolvedAuth>({
				method: 'github-token',
				token: 'gho_abc',
			});
		});

		it('takes precedence over env vars', () => {
			const env = { GITHUB_TOKEN: 'env-token-xyz' };
			const result = resolveAuthPriority({ githubToken: 'gho_wins' }, env);
			expect(result?.method).toBe('github-token');
			expect(result?.token).toBe('gho_wins');
		});

		it('takes precedence over HMAC key in options', () => {
			const opts: AuthOptions = {
				githubToken: 'gho_wins',
				hmacKey: { keyId: 'k', secret: 's' },
			};
			expect(resolveAuthPriority(opts, emptyEnv())?.method).toBe('github-token');
		});
	});

	// ── Priority 2: HMAC key ──────────────────────────────────────────────────

	describe('priority 2 — HMAC key', () => {
		it('returns hmac-key when hmacKey is in options', () => {
			const opts: AuthOptions = { hmacKey: { keyId: 'k1', secret: 's1' } };
			const result = resolveAuthPriority(opts, emptyEnv());
			expect(result).toEqual<ResolvedAuth>({
				method: 'hmac-key',
				hmacKey: { keyId: 'k1', secret: 's1' },
			});
		});

		it('returns hmac-key when HMAC env vars are set', () => {
			const env = {
				COPILOT_HMAC_KEY_ID: 'env-kid',
				COPILOT_HMAC_KEY_SECRET: 'env-secret',
			};
			const result = resolveAuthPriority({}, env);
			expect(result).toEqual<ResolvedAuth>({
				method: 'hmac-key',
				hmacKey: { keyId: 'env-kid', secret: 'env-secret' },
			});
		});

		it('prefers hmacKey in options over env HMAC vars', () => {
			const opts: AuthOptions = { hmacKey: { keyId: 'opts-kid', secret: 'opts-s' } };
			const env = {
				COPILOT_HMAC_KEY_ID: 'env-kid',
				COPILOT_HMAC_KEY_SECRET: 'env-secret',
			};
			const result = resolveAuthPriority(opts, env);
			expect(result?.hmacKey?.keyId).toBe('opts-kid');
		});

		it('takes precedence over COPILOT_TOKEN env var', () => {
			const env = {
				COPILOT_HMAC_KEY_ID: 'k',
				COPILOT_HMAC_KEY_SECRET: 's',
				COPILOT_TOKEN: 'direct-token',
			};
			expect(resolveAuthPriority({}, env)?.method).toBe('hmac-key');
		});

		it('does not set token field', () => {
			const opts: AuthOptions = { hmacKey: { keyId: 'k', secret: 's' } };
			expect(resolveAuthPriority(opts, emptyEnv())?.token).toBeUndefined();
		});
	});

	// ── Priority 3: direct API token ──────────────────────────────────────────

	describe('priority 3 — direct API token env var', () => {
		it('returns direct-api-token for COPILOT_TOKEN', () => {
			const result = resolveAuthPriority({}, { COPILOT_TOKEN: 'ct-token' });
			expect(result).toEqual<ResolvedAuth>({
				method: 'direct-api-token',
				token: 'ct-token',
			});
		});

		it('returns direct-api-token for GITHUB_COPILOT_TOKEN', () => {
			const result = resolveAuthPriority(
				{},
				{ GITHUB_COPILOT_TOKEN: 'gct-token' },
			);
			expect(result).toEqual<ResolvedAuth>({
				method: 'direct-api-token',
				token: 'gct-token',
			});
		});

		it('takes precedence over GITHUB_TOKEN', () => {
			const env = { COPILOT_TOKEN: 'wins', GITHUB_TOKEN: 'loses' };
			expect(resolveAuthPriority({}, env)?.method).toBe('direct-api-token');
		});
	});

	// ── Priority 4: env-var chain ─────────────────────────────────────────────

	describe('priority 4 — env-var chain', () => {
		it('returns env-token for COPILOT_GITHUB_TOKEN', () => {
			const result = resolveAuthPriority(
				{},
				{ COPILOT_GITHUB_TOKEN: 'cgt-value' },
			);
			expect(result).toEqual<ResolvedAuth>({
				method: 'env-token',
				token: 'cgt-value',
			});
		});

		it('returns env-token for GH_TOKEN', () => {
			const result = resolveAuthPriority({}, { GH_TOKEN: 'gh-value' });
			expect(result).toEqual<ResolvedAuth>({
				method: 'env-token',
				token: 'gh-value',
			});
		});

		it('returns env-token for GITHUB_TOKEN', () => {
			const result = resolveAuthPriority({}, { GITHUB_TOKEN: 'ghs-value' });
			expect(result).toEqual<ResolvedAuth>({
				method: 'env-token',
				token: 'ghs-value',
			});
		});

		it('COPILOT_GITHUB_TOKEN takes precedence over GH_TOKEN', () => {
			const env = {
				COPILOT_GITHUB_TOKEN: 'first',
				GH_TOKEN: 'second',
				GITHUB_TOKEN: 'third',
			};
			const result = resolveAuthPriority({}, env);
			expect(result?.token).toBe('first');
		});

		it('GH_TOKEN takes precedence over GITHUB_TOKEN', () => {
			const env = { GH_TOKEN: 'second', GITHUB_TOKEN: 'third' };
			expect(resolveAuthPriority({}, env)?.token).toBe('second');
		});
	});

	// ── Priority 5: stored OAuth ──────────────────────────────────────────────

	describe('priority 5 — stored OAuth credentials', () => {
		it('returns stored-oauth when nothing else matches and useLoggedInUser is unset', () => {
			expect(resolveAuthPriority({}, emptyEnv())).toEqual<ResolvedAuth>({
				method: 'stored-oauth',
			});
		});

		it('returns stored-oauth when useLoggedInUser is true', () => {
			const result = resolveAuthPriority(
				{ useLoggedInUser: true },
				emptyEnv(),
			);
			expect(result?.method).toBe('stored-oauth');
		});

		it('does not set token or hmacKey fields', () => {
			const result = resolveAuthPriority({}, emptyEnv());
			expect(result?.token).toBeUndefined();
			expect(result?.hmacKey).toBeUndefined();
		});
	});

	// ── Priority 6 / null: useLoggedInUser: false ─────────────────────────────

	describe('no auth resolved — useLoggedInUser: false', () => {
		it('returns null when all env vars are absent and useLoggedInUser is false', () => {
			const result = resolveAuthPriority({ useLoggedInUser: false }, emptyEnv());
			expect(result).toBeNull();
		});

		it('still resolves env tokens even when useLoggedInUser is false', () => {
			const env = { GITHUB_TOKEN: 'ghs-token' };
			const result = resolveAuthPriority({ useLoggedInUser: false }, env);
			expect(result?.method).toBe('env-token');
		});
	});

	// ── Type narrowing helpers ────────────────────────────────────────────────

	describe('ResolvedAuth shape invariants', () => {
		it('github-token result has no hmacKey', () => {
			const result = resolveAuthPriority({ githubToken: 'gho_x' }, emptyEnv());
			expect(result?.hmacKey).toBeUndefined();
		});

		it('hmac-key result has no token', () => {
			const result = resolveAuthPriority(
				{ hmacKey: { keyId: 'k', secret: 's' } },
				emptyEnv(),
			);
			expect(result?.token).toBeUndefined();
		});
	});
});
