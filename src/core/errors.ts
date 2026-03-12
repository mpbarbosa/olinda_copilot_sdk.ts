/**
 * Custom Error Classes for GitHub Copilot SDK
 * @module core/errors
 * @description Typed error hierarchy for SDK failures.
 * All error constructors set the prototype chain correctly so that
 * `instanceof` checks work after transpilation.
 * @since 0.1.0
 */

/**
 * Base error class for all SDK-level errors.
 * @since 0.1.0
 * @example
 * throw new CopilotSDKError('something went wrong');
 */
export class CopilotSDKError extends Error {
	constructor(message: string) {
		super(`CopilotSDKError: ${message}`);
		this.name = 'CopilotSDKError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/**
 * Thrown when the provided token is missing or authentication fails.
 * @since 0.1.0
 * @example
 * throw new AuthenticationError('token is required');
 */
export class AuthenticationError extends CopilotSDKError {
	constructor(message: string) {
		super(message);
		this.name = 'AuthenticationError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/**
 * Thrown when a precondition required by an operation is not met
 * (e.g. calling `send()` before `initialize()`).
 * @since 0.1.0
 * @example
 * throw new SystemError('No active session. Call initialize() first.');
 */
export class SystemError extends CopilotSDKError {
	constructor(message: string) {
		super(message);
		this.name = 'SystemError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/**
 * Thrown when the Copilot API returns a non-successful HTTP status.
 * @since 0.1.0
 * @example
 * throw new APIError('Not Found', 404);
 */
export class APIError extends CopilotSDKError {
	/** HTTP status code returned by the API. */
	statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.name = 'APIError';
		this.statusCode = statusCode;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
