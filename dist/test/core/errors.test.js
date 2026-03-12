"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../src/core/errors");
// ─── CopilotSDKError ──────────────────────────────────────────────────────────
describe('CopilotSDKError', () => {
    it('sets name to CopilotSDKError', () => {
        const err = new errors_1.CopilotSDKError('test');
        expect(err.name).toBe('CopilotSDKError');
    });
    it('includes message in error text', () => {
        const err = new errors_1.CopilotSDKError('something failed');
        expect(err.message).toContain('something failed');
    });
    it('is an instance of Error', () => {
        expect(new errors_1.CopilotSDKError('x')).toBeInstanceOf(Error);
    });
    it('is an instance of CopilotSDKError', () => {
        expect(new errors_1.CopilotSDKError('x')).toBeInstanceOf(errors_1.CopilotSDKError);
    });
});
// ─── AuthenticationError ──────────────────────────────────────────────────────
describe('AuthenticationError', () => {
    it('sets name to AuthenticationError', () => {
        const err = new errors_1.AuthenticationError('bad token');
        expect(err.name).toBe('AuthenticationError');
    });
    it('includes message in error text', () => {
        expect(new errors_1.AuthenticationError('bad token').message).toContain('bad token');
    });
    it('is an instance of Error', () => {
        expect(new errors_1.AuthenticationError('x')).toBeInstanceOf(Error);
    });
    it('is an instance of CopilotSDKError', () => {
        expect(new errors_1.AuthenticationError('x')).toBeInstanceOf(errors_1.CopilotSDKError);
    });
    it('is an instance of AuthenticationError', () => {
        expect(new errors_1.AuthenticationError('x')).toBeInstanceOf(errors_1.AuthenticationError);
    });
});
// ─── APIError ─────────────────────────────────────────────────────────────────
describe('APIError', () => {
    it('sets name to APIError', () => {
        const err = new errors_1.APIError('Not Found', 404);
        expect(err.name).toBe('APIError');
    });
    it('exposes the statusCode', () => {
        expect(new errors_1.APIError('Forbidden', 403).statusCode).toBe(403);
    });
    it('includes message in error text', () => {
        expect(new errors_1.APIError('Not Found', 404).message).toContain('Not Found');
    });
    it('is an instance of Error', () => {
        expect(new errors_1.APIError('x', 500)).toBeInstanceOf(Error);
    });
    it('is an instance of CopilotSDKError', () => {
        expect(new errors_1.APIError('x', 500)).toBeInstanceOf(errors_1.CopilotSDKError);
    });
    it('is an instance of APIError', () => {
        expect(new errors_1.APIError('x', 500)).toBeInstanceOf(errors_1.APIError);
    });
});
