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
import { CopilotSdkWrapper, type CopilotSdkWrapperOptions, type SendResult } from '../core/session_client.js';
/** Options accepted by {@link runSdkSmokeTest}. */
export interface SdkSmokeTestOptions {
    /**
     * Logger instance to use. Defaults to the module-level logger.
     * Must expose `info`, `warn`, `error`, and `success` methods.
     */
    logger?: {
        info(msg: string): void;
        warn(msg: string): void;
        error(msg: string): void;
        success(msg: string): void;
    };
    /**
     * Pre-constructed `CopilotSdkWrapper` to use instead of creating a fresh one.
     * Primarily intended for testing / dependency injection.
     */
    wrapper?: Pick<CopilotSdkWrapper, 'initialize' | 'send' | 'cleanup' | 'authenticated'>;
    /**
     * Options forwarded to `CopilotSdkWrapper` when no `wrapper` is injected.
     */
    wrapperOptions?: CopilotSdkWrapperOptions;
}
/** Result returned by {@link runSdkSmokeTest}. */
export interface SdkSmokeTestResult {
    /** Whether the smoke test succeeded. */
    success: boolean;
    /** `'passed'` or `'failed'`. */
    status: string;
    /** Human-readable description of the outcome. */
    details: string;
    /** Raw response from the SDK when the call succeeded, otherwise absent. */
    response?: SendResult;
}
/**
 * Return the minimal prompt used for the smoke test.
 *
 * @returns Smoke test prompt string.
 * @pure
 */
export declare function buildSmokeTestPrompt(): string;
/**
 * Validate a smoke test response from the SDK.
 *
 * @param response - Value returned by `CopilotSdkWrapper.send()`, or anything else.
 * @returns `true` if the response is a `SendResult` with non-empty string `content`.
 * @pure
 */
export declare function validateSmokeTestResponse(response: unknown): boolean;
/**
 * Format a smoke test outcome into a result object.
 *
 * @param success - Whether the test passed.
 * @param details - Human-readable detail string (coerced to string if not already).
 * @returns `{ status, details }` ready to spread into a {@link SdkSmokeTestResult}.
 * @pure
 */
export declare function formatSmokeTestResult(success: boolean, details: unknown): Pick<SdkSmokeTestResult, 'status' | 'details'>;
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
export declare function runSdkSmokeTest(options?: SdkSmokeTestOptions): Promise<SdkSmokeTestResult>;
