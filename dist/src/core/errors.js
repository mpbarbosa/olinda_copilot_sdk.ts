"use strict";
/**
 * Custom Error Classes for GitHub Copilot SDK
 * @module core/errors
 * @description Typed error hierarchy for SDK failures.
 * All error constructors set the prototype chain correctly so that
 * `instanceof` checks work after transpilation.
 * @since 0.1.3
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIError = exports.SystemError = exports.AuthenticationError = exports.CopilotSDKError = void 0;
/**
 * Base error class for all SDK-level errors.
 * @since 0.1.3
 * @example
 * throw new CopilotSDKError('something went wrong');
 */
class CopilotSDKError extends Error {
    constructor(message) {
        super(`CopilotSDKError: ${message}`);
        this.name = 'CopilotSDKError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.CopilotSDKError = CopilotSDKError;
/**
 * Thrown when the provided token is missing or authentication fails.
 * @since 0.1.3
 * @example
 * throw new AuthenticationError('token is required');
 */
class AuthenticationError extends CopilotSDKError {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Thrown when a precondition required by an operation is not met
 * (e.g. calling `send()` before `initialize()`).
 * @since 0.1.3
 * @example
 * throw new SystemError('No active session. Call initialize() first.');
 */
class SystemError extends CopilotSDKError {
    constructor(message) {
        super(message);
        this.name = 'SystemError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.SystemError = SystemError;
/**
 * Thrown when the Copilot API returns a non-successful HTTP status.
 * @since 0.1.3
 * @example
 * throw new APIError('Not Found', 404);
 */
class APIError extends CopilotSDKError {
    constructor(message, statusCode) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.APIError = APIError;
