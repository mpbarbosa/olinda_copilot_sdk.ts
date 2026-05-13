import type { SDKMessage } from '@anthropic-ai/claude-agent-sdk';
import { ClaudeSDKError } from '../errors.js';
import type { ClaudeRunResult } from '../sdk_wrapper.js';

interface ClaudeTextBlock {
	type: 'text';
	text: string;
}

function isClaudeTextBlock(value: unknown): value is ClaudeTextBlock {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const candidate = value as Record<string, unknown>;
	return candidate.type === 'text' && typeof candidate.text === 'string';
}

/**
 * Extract concatenated assistant text from Claude content blocks.
 * @param content - Unknown Claude content payload.
 * @returns Concatenated text from all `text` blocks.
 * @since 0.10.0
 */
export function extractAssistantText(content: unknown): string {
	if (!Array.isArray(content)) {
		return '';
	}

	let text = '';

	for (const block of content) {
		if (isClaudeTextBlock(block)) {
			text += block.text;
		}
	}

	return text;
}

/**
 * Collect a Claude SDK message stream into the library-owned run result shape.
 * @param messages - Claude SDK message stream.
 * @returns Aggregated run result.
 * @throws {ClaudeSDKError} When the SDK reports a non-success result subtype.
 * @since 0.10.0
 */
export async function collectClaudeRunResult(
	messages: AsyncIterable<SDKMessage>,
): Promise<ClaudeRunResult> {
	let content = '';
	let sessionId: string | undefined;
	let success = false;
	let totalCostUsd: number | undefined;
	let numTurns: number | undefined;
	let durationMs: number | undefined;

	for await (const message of messages) {
		if (message.type === 'assistant') {
			sessionId = message.session_id;
			content += extractAssistantText(message.message.content);
			continue;
		}

		if (message.type !== 'result') {
			continue;
		}

		sessionId = message.session_id;

		if (message.subtype === 'success') {
			success = true;
			totalCostUsd = message.total_cost_usd;
			numTurns = message.num_turns;
			durationMs = message.duration_ms;
			continue;
		}

		const reason = Array.isArray(message.errors) && typeof message.errors[0] === 'string'
			? message.errors[0]
			: message.subtype;

		throw new ClaudeSDKError(`Run failed: ${reason}`);
	}

	return { content, sessionId, success, totalCostUsd, numTurns, durationMs };
}
