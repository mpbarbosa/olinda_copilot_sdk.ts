/**
 * olinda_copilot_sdk.ts — public API
 * @module index
 * @since 0.1.3
 */
export { CopilotClient } from './core/completions_client.js';
export type { ClientOptions, Message, MessageRole, CompletionRequest, CompletionResponse, CompletionChoice, StreamChunk, StreamChoice, StreamDelta, } from './core/types.js';
export { CopilotSDKError, AuthenticationError, APIError, SystemError } from './core/errors.js';
export type { AzureProvider, OpenAIProvider, AnthropicProvider, OpenAICompatibleProvider, BYOKProvider, HmacKeyConfig, AuthOptions, AuthMethod, ResolvedAuth, } from './core/auth.js';
export { isGitHubToken, resolveHmacFromEnv, resolveAuthPriority } from './core/auth.js';
export type { ReasoningEffort, SessionConfig, UserInputRequest, UserInputResponse, UserInputHandler } from './core/session_config.js';
export type { ResumeSessionConfig } from './core/session_config.js';
export type { ToolResultObject, PermissionHandler, BaseHookInput, PreToolUseInput, PreToolUseOutput, PreToolUseHandler, PreToolUseHookInput, PreToolUseHookOutput, PostToolUseInput, PostToolUseOutput, PostToolUseHandler, PostToolUseHookInput, PostToolUseHookOutput, UserPromptInput, UserPromptOutput, UserPromptHandler, UserPromptSubmittedHandler, UserPromptSubmittedHookInput, UserPromptSubmittedHookOutput, SessionStartInput, SessionStartOutput, SessionStartHandler, SessionStartHookInput, SessionStartHookOutput, SessionEndInput, SessionEndOutput, SessionEndHandler, SessionEndHookInput, SessionEndHookOutput, ErrorOccurredInput, ErrorOccurredOutput, ErrorOccurredHandler, ErrorOccurredHookInput, ErrorOccurredHookOutput, SessionHooks, HooksConfig, } from './core/hooks.js';
export { createHooks, approveAllTools, denyTools } from './core/hooks.js';
export { createUserMessage, createSystemMessage, createAssistantMessage, createFunctionMessage, extractContent, hasRole, filterByRole, } from './utils/messages.js';
export { parseSSELine, parseSSEChunk, parseSSEStream, extractDeltaContent, isStreamDone } from './utils/stream.js';
export type { LocalMCPServer, RemoteMCPServer, MCPServerMap, } from './core/mcp.js';
export { createLocalMCPServer, createRemoteMCPServer } from './core/mcp.js';
export type { SkillConfig, SkillSessionConfig, } from './core/skills.js';
export { loadSkillDirectories } from './core/skills.js';
export { CopilotSdkWrapper, } from './core/session_client.js';
export type { CopilotSdkWrapperOptions, InitializeResult, SendResult, } from './core/session_client.js';
/** Re-exported from `@github/copilot-sdk` — approves all permission requests automatically. */
export { approveAll } from '@github/copilot-sdk';
export type { PermissionRequest, PermissionRequestResult, } from '@github/copilot-sdk';
export type { Tool, ToolHandler, ToolInvocation, ZodSchema, SystemMessageAppendConfig, SystemMessageReplaceConfig, SystemMessageConfig, CustomAgentConfig, InfiniteSessionConfig, } from './core/tools.js';
export { defineTool } from './core/tools.js';
export { LogValidator, parseLogIssues, buildValidationPrompt, selectRelevantFiles } from './lib/log_validator.js';
export type { LogIssue, CodeSnippet, LogValidatorOptions, IssueSeverity } from './lib/log_validator.js';
export { runSdkSmokeTest, buildSmokeTestPrompt, validateSmokeTestResponse, formatSmokeTestResult } from './lib/sdk_smoke_test.js';
export type { SdkSmokeTestOptions, SdkSmokeTestResult } from './lib/sdk_smoke_test.js';
