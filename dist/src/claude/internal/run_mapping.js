"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAssistantText = extractAssistantText;
exports.collectClaudeRunResult = collectClaudeRunResult;
const errors_js_1 = require("../errors.js");
function isClaudeTextBlock(value) {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const candidate = value;
    return candidate.type === 'text' && typeof candidate.text === 'string';
}
/**
 * Extract concatenated assistant text from Claude content blocks.
 * @param content - Unknown Claude content payload.
 * @returns Concatenated text from all `text` blocks.
 * @since 0.10.0
 */
function extractAssistantText(content) {
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
async function collectClaudeRunResult(messages) {
    let content = '';
    let sessionId;
    let success = false;
    let totalCostUsd;
    let numTurns;
    let durationMs;
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
        throw new errors_js_1.ClaudeSDKError(`Run failed: ${reason}`);
    }
    return { content, sessionId, success, totalCostUsd, numTurns, durationMs };
}
