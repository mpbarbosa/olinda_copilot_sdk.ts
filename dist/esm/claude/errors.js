/**
 * Custom Error Classes for Claude Agent SDK
 * @module claude/errors
 * @description Typed error hierarchy for Claude SDK failures.
 * All error constructors set the prototype chain correctly so that
 * `instanceof` checks work after transpilation.
 * @since 0.7.0
 */
/**
 * Base error class for all Claude SDK-level errors.
 * @since 0.7.0
 * @example
 * throw new ClaudeSDKError('something went wrong');
 */
export class ClaudeSDKError extends Error {
    constructor(message) {
        super(`ClaudeSDKError: ${message}`);
        this.name = 'ClaudeSDKError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
/**
 * Thrown when the API key is missing or authentication fails (HTTP 401).
 * @since 0.7.0
 * @example
 * throw new ClaudeAuthError('apiKey is required');
 */
export class ClaudeAuthError extends ClaudeSDKError {
    constructor(message) {
        super(message);
        this.name = 'ClaudeAuthError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
/**
 * Thrown when the Anthropic API returns a non-successful HTTP status.
 * @since 0.7.0
 * @example
 * throw new ClaudeAPIError('Bad Request', 400);
 */
export class ClaudeAPIError extends ClaudeSDKError {
    constructor(message, statusCode) {
        super(message);
        this.name = 'ClaudeAPIError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
