"use strict";
/**
 * Claude session administration helpers.
 * @module claude/sessions
 * @since 0.10.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.listClaudeSessions = listClaudeSessions;
exports.getClaudeSessionInfo = getClaudeSessionInfo;
exports.deleteClaudeSession = deleteClaudeSession;
exports.renameClaudeSession = renameClaudeSession;
exports.getClaudeSessionMessages = getClaudeSessionMessages;
const claude_agent_sdk_1 = require("@anthropic-ai/claude-agent-sdk");
const sdk_compat_js_1 = require("./internal/sdk_compat.js");
function mapClaudeSessionSummary(session) {
    return {
        sessionId: session.sessionId,
        summary: session.summary,
        lastModified: session.lastModified,
        fileSize: session.fileSize,
        customTitle: session.customTitle,
        firstPrompt: session.firstPrompt,
        gitBranch: session.gitBranch,
        cwd: session.cwd,
        tag: session.tag,
        createdAt: session.createdAt,
    };
}
function mapClaudeSessionMessage(message) {
    return {
        type: message.type,
        id: message.uuid,
        sessionId: message.session_id,
        content: message.message,
        parentToolUseId: message.parent_tool_use_id,
    };
}
function toSdkSessionQuery(options) {
    if (!options) {
        return undefined;
    }
    return {
        dir: options.dir,
        limit: options.limit,
        offset: options.offset,
        includeWorktrees: options.includeWorktrees,
    };
}
function toSdkSessionLookup(options) {
    if (!options) {
        return undefined;
    }
    return { dir: options.dir };
}
function toSdkSessionMutation(options) {
    if (!options) {
        return undefined;
    }
    return { dir: options.dir };
}
function toSdkSessionMessagesQuery(options) {
    if (!options) {
        return undefined;
    }
    return {
        dir: options.dir,
        limit: options.limit,
        offset: options.offset,
        includeSystemMessages: options.includeSystemMessages,
    };
}
/**
 * List Claude sessions using library-owned session summary values.
 * @param options - Optional session list query.
 * @returns Claude session summaries.
 * @since 0.10.0
 */
async function listClaudeSessions(options) {
    const sessions = await (0, claude_agent_sdk_1.listSessions)(toSdkSessionQuery(options));
    return sessions.map(mapClaudeSessionSummary);
}
/**
 * Read one Claude session summary by ID.
 * @param sessionId - Claude session ID.
 * @param options - Optional lookup scope.
 * @returns Claude session summary, or `undefined` when not found.
 * @since 0.10.0
 */
async function getClaudeSessionInfo(sessionId, options) {
    const session = await (0, claude_agent_sdk_1.getSessionInfo)(sessionId, toSdkSessionLookup(options));
    return session ? mapClaudeSessionSummary(session) : undefined;
}
/**
 * Delete a Claude session by ID.
 * @param sessionId - Claude session ID.
 * @param options - Optional lookup scope.
 * @since 0.10.0
 */
async function deleteClaudeSession(sessionId, options) {
    const deleteSession = await (0, sdk_compat_js_1.getClaudeDeleteSession)();
    await deleteSession(sessionId, toSdkSessionMutation(options));
}
/**
 * Rename a Claude session by ID.
 * @param sessionId - Claude session ID.
 * @param title - New session title.
 * @param options - Optional lookup scope.
 * @since 0.10.0
 */
async function renameClaudeSession(sessionId, title, options) {
    await (0, claude_agent_sdk_1.renameSession)(sessionId, title, toSdkSessionMutation(options));
}
/**
 * Read Claude session transcript messages using library-owned message values.
 * @param sessionId - Claude session ID.
 * @param options - Optional transcript query.
 * @returns Claude transcript messages.
 * @since 0.10.0
 */
async function getClaudeSessionMessages(sessionId, options) {
    const messages = await (0, claude_agent_sdk_1.getSessionMessages)(sessionId, toSdkSessionMessagesQuery(options));
    return messages.map(mapClaudeSessionMessage);
}
