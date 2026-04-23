"use strict";
/**
 * Custom Error Classes for Claude Agent SDK
 * @module claude/errors
 * @description Typed error hierarchy for Claude SDK failures.
 * All error constructors set the prototype chain correctly so that
 * `instanceof` checks work after transpilation.
 * @since 0.9.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeAPIError = exports.ClaudeAuthError = exports.ClaudeSDKError = void 0;
/**
 * Base error class for all Claude SDK-level errors.
 * @since 0.9.0
 * @example
 * throw new ClaudeSDKError('something went wrong');
 */
class ClaudeSDKError extends Error {
    constructor(message) {
        super(`ClaudeSDKError: ${message}`);
        this.name = 'ClaudeSDKError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.ClaudeSDKError = ClaudeSDKError;
/**
 * Thrown when the API key is missing or authentication fails (HTTP 401).
 * @since 0.9.0
 * @example
 * throw new ClaudeAuthError('apiKey is required');
 */
class ClaudeAuthError extends ClaudeSDKError {
    constructor(message) {
        super(message);
        this.name = 'ClaudeAuthError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.ClaudeAuthError = ClaudeAuthError;
/**
 * Thrown when the Anthropic API returns a non-successful HTTP status.
 * @since 0.9.0
 * @example
 * throw new ClaudeAPIError('Bad Request', 400);
 */
class ClaudeAPIError extends ClaudeSDKError {
    constructor(message, statusCode) {
        super(message);
        this.name = 'ClaudeAPIError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.ClaudeAPIError = ClaudeAPIError;
