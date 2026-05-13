import type { Options } from '@anthropic-ai/claude-agent-sdk';
import type { ClaudeExecutionOptions } from '../sdk_wrapper.js';
/**
 * Convert library-owned Claude execution options into SDK query options.
 * @param sources - Ordered option sources; later values override earlier ones.
 * @returns Claude SDK options object.
 * @since 0.10.0
 */
export declare function buildClaudeSdkOptions(...sources: Array<ClaudeExecutionOptions | undefined>): Options;
