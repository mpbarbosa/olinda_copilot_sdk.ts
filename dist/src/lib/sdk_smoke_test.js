"use strict";
/**
 * SDK Smoke Test
 *
 * Sends a minimal prompt to the GitHub Copilot API to verify connectivity.
 * Useful for validating that authentication and the SDK session are working
 * before running heavier workflows.
 *
 * Architecture: referential transparency pattern (v2.0.0-style).
 *   - Pure functions handle prompt construction and response/result validation.
 *   - `runSdkSmokeTest` owns all SDK lifecycle concerns.
 *
 * @module lib/sdk_smoke_test
 * @since 0.4.2
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSmokeTestPrompt = buildSmokeTestPrompt;
exports.validateSmokeTestResponse = validateSmokeTestResponse;
exports.formatSmokeTestResult = formatSmokeTestResult;
exports.runSdkSmokeTest = runSdkSmokeTest;
const session_client_js_1 = require("../core/session_client.js");
const logger_js_1 = require("../core/logger.js");
// ---------------------------------------------------------------------------
// Pure functions — no side effects, deterministic output
// ---------------------------------------------------------------------------
/**
 * Return the minimal prompt used for the smoke test.
 *
 * @returns Smoke test prompt string.
 * @pure
 */
function buildSmokeTestPrompt() {
    return 'Reply with the single word: ok';
}
/**
 * Validate a smoke test response from the SDK.
 *
 * @param response - Value returned by `CopilotSdkWrapper.send()`, or anything else.
 * @returns `true` if the response is a `SendResult` with non-empty string `content`.
 * @pure
 */
function validateSmokeTestResponse(response) {
    if (!response || typeof response !== 'object')
        return false;
    const { content } = response;
    return typeof content === 'string' && content.trim().length > 0;
}
/**
 * Format a smoke test outcome into a result object.
 *
 * @param success - Whether the test passed.
 * @param details - Human-readable detail string (coerced to string if not already).
 * @returns `{ status, details }` ready to spread into a {@link SdkSmokeTestResult}.
 * @pure
 */
function formatSmokeTestResult(success, details) {
    return {
        status: success ? 'passed' : 'failed',
        details: String(details),
    };
}
// ---------------------------------------------------------------------------
// Impure wrapper — SDK lifecycle and logging
// ---------------------------------------------------------------------------
/**
 * Run the SDK smoke test against the GitHub Copilot API.
 *
 * Creates a fresh `CopilotSdkWrapper` (or uses an injected one), initialises
 * it, sends a minimal prompt, and validates the response. The wrapper is
 * always cleaned up before returning.
 *
 * @param options - Optional logger, wrapper injection, or wrapper construction options.
 * @returns Resolved `SdkSmokeTestResult` describing the outcome.
 *
 * @example
 * const result = await runSdkSmokeTest();
 * if (!result.success) console.error('SDK not reachable:', result.details);
 *
 * @since 0.4.2
 */
async function runSdkSmokeTest(options = {}) {
    const log = options.logger ?? logger_js_1.logger;
    const wrapper = options.wrapper ?? new session_client_js_1.CopilotSdkWrapper(options.wrapperOptions ?? {});
    log.info('[SDK Smoke Test] Initialising Copilot SDK...');
    try {
        await wrapper.initialize();
        if (!wrapper.authenticated) {
            const result = formatSmokeTestResult(false, 'Copilot SDK not available or not authenticated');
            log.warn(`[SDK Smoke Test] ${result.details}`);
            return { success: false, ...result };
        }
        const prompt = buildSmokeTestPrompt();
        log.info(`[SDK Smoke Test] Sending probe prompt: "${prompt}"`);
        const response = await wrapper.send(prompt);
        if (!validateSmokeTestResponse(response)) {
            const result = formatSmokeTestResult(false, 'Received empty or invalid response from Copilot API');
            log.warn(`[SDK Smoke Test] ${result.details}`);
            return { success: false, ...result, response };
        }
        const result = formatSmokeTestResult(true, `Copilot API responded successfully (${response.content.trim().length} chars)`);
        log.success(`[SDK Smoke Test] ✓ ${result.details}`);
        return { success: true, ...result, response };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        const result = formatSmokeTestResult(false, `SDK error: ${msg}`);
        log.error(`[SDK Smoke Test] ${result.details}`);
        return { success: false, ...result };
    }
    finally {
        try {
            await wrapper.cleanup();
        }
        catch {
            // cleanup errors are non-fatal
        }
    }
}
