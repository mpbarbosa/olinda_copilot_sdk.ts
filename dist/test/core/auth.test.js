"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../src/core/auth");
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
        expect((0, auth_1.isGitHubToken)(token)).toBe(expected);
    });
});
// ── resolveHmacFromEnv ────────────────────────────────────────────────────────
describe('resolveHmacFromEnv', () => {
    it('returns HmacKeyConfig when both vars are present', () => {
        const env = {
            COPILOT_HMAC_KEY_ID: 'kid-001',
            COPILOT_HMAC_KEY_SECRET: 'secret-abc',
        };
        expect((0, auth_1.resolveHmacFromEnv)(env)).toEqual({
            keyId: 'kid-001',
            secret: 'secret-abc',
        });
    });
    it.each([
        { desc: 'KEY_ID missing', env: { COPILOT_HMAC_KEY_SECRET: 's' } },
        { desc: 'KEY_SECRET missing', env: { COPILOT_HMAC_KEY_ID: 'k' } },
        { desc: 'empty env', env: {} },
    ])('returns null ($desc)', ({ env }) => {
        expect((0, auth_1.resolveHmacFromEnv)(env)).toBeNull();
    });
});
// ── resolveAuthPriority ───────────────────────────────────────────────────────
describe('resolveAuthPriority', () => {
    // helper: builds a clean empty env
    const emptyEnv = () => ({});
    // ── Priority 1: explicit githubToken ──────────────────────────────────────
    describe('priority 1 — explicit githubToken', () => {
        it('returns github-token method with the supplied token', () => {
            const result = (0, auth_1.resolveAuthPriority)({ githubToken: 'gho_abc' }, emptyEnv());
            expect(result).toEqual({
                method: 'github-token',
                token: 'gho_abc',
            });
        });
        it('takes precedence over env vars', () => {
            const env = { GITHUB_TOKEN: 'env-token-xyz' };
            const result = (0, auth_1.resolveAuthPriority)({ githubToken: 'gho_wins' }, env);
            expect(result?.method).toBe('github-token');
            expect(result?.token).toBe('gho_wins');
        });
        it('takes precedence over HMAC key in options', () => {
            const opts = {
                githubToken: 'gho_wins',
                hmacKey: { keyId: 'k', secret: 's' },
            };
            expect((0, auth_1.resolveAuthPriority)(opts, emptyEnv())?.method).toBe('github-token');
        });
    });
    // ── Priority 2: HMAC key ──────────────────────────────────────────────────
    describe('priority 2 — HMAC key', () => {
        it('returns hmac-key when hmacKey is in options', () => {
            const opts = { hmacKey: { keyId: 'k1', secret: 's1' } };
            const result = (0, auth_1.resolveAuthPriority)(opts, emptyEnv());
            expect(result).toEqual({
                method: 'hmac-key',
                hmacKey: { keyId: 'k1', secret: 's1' },
            });
        });
        it('returns hmac-key when HMAC env vars are set', () => {
            const env = {
                COPILOT_HMAC_KEY_ID: 'env-kid',
                COPILOT_HMAC_KEY_SECRET: 'env-secret',
            };
            const result = (0, auth_1.resolveAuthPriority)({}, env);
            expect(result).toEqual({
                method: 'hmac-key',
                hmacKey: { keyId: 'env-kid', secret: 'env-secret' },
            });
        });
        it('prefers hmacKey in options over env HMAC vars', () => {
            const opts = { hmacKey: { keyId: 'opts-kid', secret: 'opts-s' } };
            const env = {
                COPILOT_HMAC_KEY_ID: 'env-kid',
                COPILOT_HMAC_KEY_SECRET: 'env-secret',
            };
            const result = (0, auth_1.resolveAuthPriority)(opts, env);
            expect(result?.hmacKey?.keyId).toBe('opts-kid');
        });
        it('takes precedence over COPILOT_TOKEN env var', () => {
            const env = {
                COPILOT_HMAC_KEY_ID: 'k',
                COPILOT_HMAC_KEY_SECRET: 's',
                COPILOT_TOKEN: 'direct-token',
            };
            expect((0, auth_1.resolveAuthPriority)({}, env)?.method).toBe('hmac-key');
        });
        it('does not set token field', () => {
            const opts = { hmacKey: { keyId: 'k', secret: 's' } };
            expect((0, auth_1.resolveAuthPriority)(opts, emptyEnv())?.token).toBeUndefined();
        });
    });
    // ── Priority 3: direct API token ──────────────────────────────────────────
    describe('priority 3 — direct API token env var', () => {
        it('returns direct-api-token for COPILOT_TOKEN', () => {
            const result = (0, auth_1.resolveAuthPriority)({}, { COPILOT_TOKEN: 'ct-token' });
            expect(result).toEqual({
                method: 'direct-api-token',
                token: 'ct-token',
            });
        });
        it('returns direct-api-token for GITHUB_COPILOT_TOKEN', () => {
            const result = (0, auth_1.resolveAuthPriority)({}, { GITHUB_COPILOT_TOKEN: 'gct-token' });
            expect(result).toEqual({
                method: 'direct-api-token',
                token: 'gct-token',
            });
        });
        it('takes precedence over GITHUB_TOKEN', () => {
            const env = { COPILOT_TOKEN: 'wins', GITHUB_TOKEN: 'loses' };
            expect((0, auth_1.resolveAuthPriority)({}, env)?.method).toBe('direct-api-token');
        });
    });
    // ── Priority 4: env-var chain ─────────────────────────────────────────────
    describe('priority 4 — env-var chain', () => {
        it('returns env-token for COPILOT_GITHUB_TOKEN', () => {
            const result = (0, auth_1.resolveAuthPriority)({}, { COPILOT_GITHUB_TOKEN: 'cgt-value' });
            expect(result).toEqual({
                method: 'env-token',
                token: 'cgt-value',
            });
        });
        it('returns env-token for GH_TOKEN', () => {
            const result = (0, auth_1.resolveAuthPriority)({}, { GH_TOKEN: 'gh-value' });
            expect(result).toEqual({
                method: 'env-token',
                token: 'gh-value',
            });
        });
        it('returns env-token for GITHUB_TOKEN', () => {
            const result = (0, auth_1.resolveAuthPriority)({}, { GITHUB_TOKEN: 'ghs-value' });
            expect(result).toEqual({
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
            const result = (0, auth_1.resolveAuthPriority)({}, env);
            expect(result?.token).toBe('first');
        });
        it('GH_TOKEN takes precedence over GITHUB_TOKEN', () => {
            const env = { GH_TOKEN: 'second', GITHUB_TOKEN: 'third' };
            expect((0, auth_1.resolveAuthPriority)({}, env)?.token).toBe('second');
        });
    });
    // ── Priority 5: stored OAuth ──────────────────────────────────────────────
    describe('priority 5 — stored OAuth credentials', () => {
        it('returns stored-oauth when nothing else matches and useLoggedInUser is unset', () => {
            expect((0, auth_1.resolveAuthPriority)({}, emptyEnv())).toEqual({
                method: 'stored-oauth',
            });
        });
        it('returns stored-oauth when useLoggedInUser is true', () => {
            const result = (0, auth_1.resolveAuthPriority)({ useLoggedInUser: true }, emptyEnv());
            expect(result?.method).toBe('stored-oauth');
        });
        it('does not set token or hmacKey fields', () => {
            const result = (0, auth_1.resolveAuthPriority)({}, emptyEnv());
            expect(result?.token).toBeUndefined();
            expect(result?.hmacKey).toBeUndefined();
        });
    });
    // ── Priority 6 / null: useLoggedInUser: false ─────────────────────────────
    describe('no auth resolved — useLoggedInUser: false', () => {
        it('returns null when all env vars are absent and useLoggedInUser is false', () => {
            const result = (0, auth_1.resolveAuthPriority)({ useLoggedInUser: false }, emptyEnv());
            expect(result).toBeNull();
        });
        it('still resolves env tokens even when useLoggedInUser is false', () => {
            const env = { GITHUB_TOKEN: 'ghs-token' };
            const result = (0, auth_1.resolveAuthPriority)({ useLoggedInUser: false }, env);
            expect(result?.method).toBe('env-token');
        });
    });
    // ── Type narrowing helpers ────────────────────────────────────────────────
    describe('ResolvedAuth shape invariants', () => {
        it('github-token result has no hmacKey', () => {
            const result = (0, auth_1.resolveAuthPriority)({ githubToken: 'gho_x' }, emptyEnv());
            expect(result?.hmacKey).toBeUndefined();
        });
        it('hmac-key result has no token', () => {
            const result = (0, auth_1.resolveAuthPriority)({ hmacKey: { keyId: 'k', secret: 's' } }, emptyEnv());
            expect(result?.token).toBeUndefined();
        });
    });
});
