import type { SDKMessage } from '@anthropic-ai/claude-agent-sdk';
import type { ClaudeRunResult } from '../sdk_wrapper.js';
/**
 * Extract concatenated assistant text from Claude content blocks.
 * @param content - Unknown Claude content payload.
 * @returns Concatenated text from all `text` blocks.
 * @since 0.10.0
 */
export declare function extractAssistantText(content: unknown): string;
/**
 * Collect a Claude SDK message stream into the library-owned run result shape.
 * @param messages - Claude SDK message stream.
 * @returns Aggregated run result.
 * @throws {ClaudeSDKError} When the SDK reports a non-success result subtype.
 * @since 0.10.0
 */
export declare function collectClaudeRunResult(messages: AsyncIterable<SDKMessage>): Promise<ClaudeRunResult>;
