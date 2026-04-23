"use strict";
/**
 * olinda_copilot_sdk.ts — public API
 * @module index
 * @since 0.1.3
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeSdkWrapper = exports.ClaudeAPIError = exports.ClaudeAuthError = exports.ClaudeSDKError = exports.ClaudeClient = exports.formatSmokeTestResult = exports.validateSmokeTestResponse = exports.buildSmokeTestPrompt = exports.runSdkSmokeTest = exports.selectRelevantFiles = exports.buildValidationPrompt = exports.parseLogIssues = exports.LogValidator = exports.defineTool = exports.approveAll = exports.CopilotSdkWrapper = exports.loadSkillDirectories = exports.createRemoteMCPServer = exports.createLocalMCPServer = exports.isStreamDone = exports.extractDeltaContent = exports.parseSSEStream = exports.parseSSEChunk = exports.parseSSELine = exports.filterByRole = exports.hasRole = exports.extractContent = exports.createFunctionMessage = exports.createAssistantMessage = exports.createSystemMessage = exports.createUserMessage = exports.denyTools = exports.approveAllTools = exports.createHooks = exports.resolveAuthPriority = exports.resolveHmacFromEnv = exports.isGitHubToken = exports.SystemError = exports.APIError = exports.AuthenticationError = exports.CopilotSDKError = exports.CopilotClient = void 0;
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
Object.defineProperty(exports, "parseSSEStream", { enumerable: true, get: function () { return stream_js_1.parseSSEStream; } });
Object.defineProperty(exports, "extractDeltaContent", { enumerable: true, get: function () { return stream_js_1.extractDeltaContent; } });
Object.defineProperty(exports, "isStreamDone", { enumerable: true, get: function () { return stream_js_1.isStreamDone; } });
var mcp_js_1 = require("./core/mcp.js");
Object.defineProperty(exports, "createLocalMCPServer", { enumerable: true, get: function () { return mcp_js_1.createLocalMCPServer; } });
Object.defineProperty(exports, "createRemoteMCPServer", { enumerable: true, get: function () { return mcp_js_1.createRemoteMCPServer; } });
var skills_js_1 = require("./core/skills.js");
Object.defineProperty(exports, "loadSkillDirectories", { enumerable: true, get: function () { return skills_js_1.loadSkillDirectories; } });
// ---------------------------------------------------------------------------
// v0.2.1 — CopilotSdkWrapper + SDK permission/input types
// ---------------------------------------------------------------------------
var session_client_js_1 = require("./core/session_client.js");
Object.defineProperty(exports, "CopilotSdkWrapper", { enumerable: true, get: function () { return session_client_js_1.CopilotSdkWrapper; } });
/** Re-exported from `@github/copilot-sdk` — approves all permission requests automatically. */
var copilot_sdk_1 = require("@github/copilot-sdk");
Object.defineProperty(exports, "approveAll", { enumerable: true, get: function () { return copilot_sdk_1.approveAll; } });
var tools_js_1 = require("./core/tools.js");
Object.defineProperty(exports, "defineTool", { enumerable: true, get: function () { return tools_js_1.defineTool; } });
// ---------------------------------------------------------------------------
// v0.3.3 — LogValidator: token-efficient log-to-SDK validation pipeline
// ---------------------------------------------------------------------------
var log_validator_js_1 = require("./lib/log_validator.js");
Object.defineProperty(exports, "LogValidator", { enumerable: true, get: function () { return log_validator_js_1.LogValidator; } });
Object.defineProperty(exports, "parseLogIssues", { enumerable: true, get: function () { return log_validator_js_1.parseLogIssues; } });
Object.defineProperty(exports, "buildValidationPrompt", { enumerable: true, get: function () { return log_validator_js_1.buildValidationPrompt; } });
Object.defineProperty(exports, "selectRelevantFiles", { enumerable: true, get: function () { return log_validator_js_1.selectRelevantFiles; } });
// ---------------------------------------------------------------------------
// v0.4.2 — SdkSmokeTest: minimal connectivity check for the Copilot API
// ---------------------------------------------------------------------------
var sdk_smoke_test_js_1 = require("./lib/sdk_smoke_test.js");
Object.defineProperty(exports, "runSdkSmokeTest", { enumerable: true, get: function () { return sdk_smoke_test_js_1.runSdkSmokeTest; } });
Object.defineProperty(exports, "buildSmokeTestPrompt", { enumerable: true, get: function () { return sdk_smoke_test_js_1.buildSmokeTestPrompt; } });
Object.defineProperty(exports, "validateSmokeTestResponse", { enumerable: true, get: function () { return sdk_smoke_test_js_1.validateSmokeTestResponse; } });
Object.defineProperty(exports, "formatSmokeTestResult", { enumerable: true, get: function () { return sdk_smoke_test_js_1.formatSmokeTestResult; } });
// ---------------------------------------------------------------------------
// v0.7.0 — Claude Agent SDK Wrapper + Anthropic Messages API Client
// ---------------------------------------------------------------------------
var completions_client_js_2 = require("./claude/completions_client.js");
Object.defineProperty(exports, "ClaudeClient", { enumerable: true, get: function () { return completions_client_js_2.ClaudeClient; } });
var errors_js_2 = require("./claude/errors.js");
Object.defineProperty(exports, "ClaudeSDKError", { enumerable: true, get: function () { return errors_js_2.ClaudeSDKError; } });
Object.defineProperty(exports, "ClaudeAuthError", { enumerable: true, get: function () { return errors_js_2.ClaudeAuthError; } });
Object.defineProperty(exports, "ClaudeAPIError", { enumerable: true, get: function () { return errors_js_2.ClaudeAPIError; } });
var sdk_wrapper_js_1 = require("./claude/sdk_wrapper.js");
Object.defineProperty(exports, "ClaudeSdkWrapper", { enumerable: true, get: function () { return sdk_wrapper_js_1.ClaudeSdkWrapper; } });
