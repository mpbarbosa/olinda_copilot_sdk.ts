/**
 * Custom Error Classes for GitHub Copilot SDK
 * @module core/errors
 * @description Typed error hierarchy for SDK failures.
 * All error constructors set the prototype chain correctly so that
 * `instanceof` checks work after transpilation.
 * @since 0.1.3
 */
/**
 * Base error class for all SDK-level errors.
 * @since 0.1.3
 * @example
 * throw new CopilotSDKError('something went wrong');
 */
export declare class CopilotSDKError extends Error {
    constructor(message: string);
}
/**
 * Thrown when the provided token is missing or authentication fails.
 * @since 0.1.3
 * @example
 * throw new AuthenticationError('token is required');
 */
export declare class AuthenticationError extends CopilotSDKError {
    constructor(message: string);
}
/**
 * Thrown when a precondition required by an operation is not met
 * (e.g. calling `send()` before `initialize()`).
 * @since 0.1.3
 * @example
 * throw new SystemError('No active session. Call initialize() first.');
 */
export declare class SystemError extends CopilotSDKError {
    constructor(message: string);
}
/**
 * Thrown when the Copilot API returns a non-successful HTTP status.
 * @since 0.1.3
 * @example
 * throw new APIError('Not Found', 404);
 */
export declare class APIError extends CopilotSDKError {
    /** HTTP status code returned by the API. */
    statusCode: number;
    constructor(message: string, statusCode: number);
}
