"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClaudeStartup = getClaudeStartup;
exports.getClaudeDeleteSession = getClaudeDeleteSession;
const errors_js_1 = require("../errors.js");
let sdkCompatCache;
async function getSdkCompat() {
    if (!sdkCompatCache) {
        sdkCompatCache = await Promise.resolve().then(() => __importStar(require('@anthropic-ai/claude-agent-sdk')));
    }
    return sdkCompatCache;
}
/**
 * Load the optional Claude SDK `startup()` helper used for warmup.
 * @returns The runtime startup function.
 * @throws {ClaudeSDKError} When the installed SDK version does not expose `startup()`.
 * @since 0.10.0
 */
async function getClaudeStartup() {
    const compat = await getSdkCompat();
    const startup = compat['startup'];
    if (!startup) {
        throw new errors_js_1.ClaudeSDKError('startup() is not available in this version of @anthropic-ai/claude-agent-sdk');
    }
    return startup;
}
/**
 * Load the optional Claude SDK `deleteSession()` helper for session administration.
 * @returns The runtime deleteSession function.
 * @throws {ClaudeSDKError} When the installed SDK version does not expose `deleteSession()`.
 * @since 0.10.0
 */
async function getClaudeDeleteSession() {
    const compat = await getSdkCompat();
    const deleteSession = compat['deleteSession'];
    if (!deleteSession) {
        throw new errors_js_1.ClaudeSDKError('deleteSession() is not available in this version of @anthropic-ai/claude-agent-sdk');
    }
    return deleteSession;
}
