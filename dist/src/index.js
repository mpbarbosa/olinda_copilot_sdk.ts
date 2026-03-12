"use strict";
/**
 * olinda_copilot_sdk.ts — public API
 * @module index
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSkillDirectories = exports.createRemoteMCPServer = exports.createLocalMCPServer = exports.isStreamDone = exports.extractDeltaContent = exports.parseSSEChunk = exports.parseSSELine = exports.filterByRole = exports.hasRole = exports.extractContent = exports.createFunctionMessage = exports.createAssistantMessage = exports.createSystemMessage = exports.createUserMessage = exports.denyTools = exports.approveAllTools = exports.createHooks = exports.resolveAuthPriority = exports.resolveHmacFromEnv = exports.isGitHubToken = exports.SystemError = exports.APIError = exports.AuthenticationError = exports.CopilotSDKError = exports.CopilotClient = void 0;
var completions_client_js_1 = require("./core/completions_client.js");
Object.defineProperty(exports, "CopilotClient", { enumerable: true, get: function () { return completions_client_js_1.CopilotClient; } });
var errors_js_1 = require("./core/errors.js");
Object.defineProperty(exports, "CopilotSDKError", { enumerable: true, get: function () { return errors_js_1.CopilotSDKError; } });
Object.defineProperty(exports, "AuthenticationError", { enumerable: true, get: function () { return errors_js_1.AuthenticationError; } });
Object.defineProperty(exports, "APIError", { enumerable: true, get: function () { return errors_js_1.APIError; } });
Object.defineProperty(exports, "SystemError", { enumerable: true, get: function () { return errors_js_1.SystemError; } });
var auth_js_1 = require("./core/auth.js");
Object.defineProperty(exports, "isGitHubToken", { enumerable: true, get: function () { return auth_js_1.isGitHubToken; } });
Object.defineProperty(exports, "resolveHmacFromEnv", { enumerable: true, get: function () { return auth_js_1.resolveHmacFromEnv; } });
Object.defineProperty(exports, "resolveAuthPriority", { enumerable: true, get: function () { return auth_js_1.resolveAuthPriority; } });
var hooks_js_1 = require("./core/hooks.js");
Object.defineProperty(exports, "createHooks", { enumerable: true, get: function () { return hooks_js_1.createHooks; } });
Object.defineProperty(exports, "approveAllTools", { enumerable: true, get: function () { return hooks_js_1.approveAllTools; } });
Object.defineProperty(exports, "denyTools", { enumerable: true, get: function () { return hooks_js_1.denyTools; } });
var messages_js_1 = require("./utils/messages.js");
Object.defineProperty(exports, "createUserMessage", { enumerable: true, get: function () { return messages_js_1.createUserMessage; } });
Object.defineProperty(exports, "createSystemMessage", { enumerable: true, get: function () { return messages_js_1.createSystemMessage; } });
Object.defineProperty(exports, "createAssistantMessage", { enumerable: true, get: function () { return messages_js_1.createAssistantMessage; } });
Object.defineProperty(exports, "createFunctionMessage", { enumerable: true, get: function () { return messages_js_1.createFunctionMessage; } });
Object.defineProperty(exports, "extractContent", { enumerable: true, get: function () { return messages_js_1.extractContent; } });
Object.defineProperty(exports, "hasRole", { enumerable: true, get: function () { return messages_js_1.hasRole; } });
Object.defineProperty(exports, "filterByRole", { enumerable: true, get: function () { return messages_js_1.filterByRole; } });
var stream_js_1 = require("./utils/stream.js");
Object.defineProperty(exports, "parseSSELine", { enumerable: true, get: function () { return stream_js_1.parseSSELine; } });
Object.defineProperty(exports, "parseSSEChunk", { enumerable: true, get: function () { return stream_js_1.parseSSEChunk; } });
Object.defineProperty(exports, "extractDeltaContent", { enumerable: true, get: function () { return stream_js_1.extractDeltaContent; } });
Object.defineProperty(exports, "isStreamDone", { enumerable: true, get: function () { return stream_js_1.isStreamDone; } });
var mcp_js_1 = require("./core/mcp.js");
Object.defineProperty(exports, "createLocalMCPServer", { enumerable: true, get: function () { return mcp_js_1.createLocalMCPServer; } });
Object.defineProperty(exports, "createRemoteMCPServer", { enumerable: true, get: function () { return mcp_js_1.createRemoteMCPServer; } });
var skills_js_1 = require("./core/skills.js");
Object.defineProperty(exports, "loadSkillDirectories", { enumerable: true, get: function () { return skills_js_1.loadSkillDirectories; } });
