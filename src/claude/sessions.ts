/**
 * Claude session administration helpers.
 * @module claude/sessions
 * @since 0.10.0
 */

import {
	getSessionInfo as sdkGetSessionInfo,
	getSessionMessages as sdkGetSessionMessages,
	listSessions as sdkListSessions,
	renameSession as sdkRenameSession,
} from '@anthropic-ai/claude-agent-sdk';
import type {
	GetSessionInfoOptions,
	GetSessionMessagesOptions,
	ListSessionsOptions,
	SDKSessionInfo,
	SessionMessage,
	SessionMutationOptions,
} from '@anthropic-ai/claude-agent-sdk';
import { getClaudeDeleteSession } from './internal/sdk_compat.js';

/**
 * Query options for listing Claude sessions.
 * @since 0.10.0
 */
export interface ClaudeSessionQuery {
	dir?: string;
	limit?: number;
	offset?: number;
	includeWorktrees?: boolean;
}

/**
 * Lookup options for a specific Claude session.
 * @since 0.10.0
 */
export interface ClaudeSessionLookup {
	dir?: string;
}

/**
 * Query options for reading Claude session transcript messages.
 * @since 0.10.0
 */
export interface ClaudeSessionMessagesQuery extends ClaudeSessionLookup {
	limit?: number;
	offset?: number;
	includeSystemMessages?: boolean;
}

/**
 * Library-owned summary of a Claude session.
 * @since 0.10.0
 */
export interface ClaudeSessionSummary {
	sessionId: string;
	summary: string;
	lastModified: number;
	fileSize?: number;
	customTitle?: string;
	firstPrompt?: string;
	gitBranch?: string;
	cwd?: string;
	tag?: string;
	createdAt?: number;
}

/**
 * Library-owned Claude transcript message shape.
 * @since 0.10.0
 */
export interface ClaudeSessionMessage {
	type: 'user' | 'assistant' | 'system';
	id: string;
	sessionId: string;
	content: unknown;
	parentToolUseId: null;
}

function mapClaudeSessionSummary(session: SDKSessionInfo): ClaudeSessionSummary {
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

function mapClaudeSessionMessage(message: SessionMessage): ClaudeSessionMessage {
	return {
		type: message.type,
		id: message.uuid,
		sessionId: message.session_id,
		content: message.message,
		parentToolUseId: message.parent_tool_use_id,
	};
}

function toSdkSessionQuery(options?: ClaudeSessionQuery): ListSessionsOptions | undefined {
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

function toSdkSessionLookup(options?: ClaudeSessionLookup): GetSessionInfoOptions | undefined {
	if (!options) {
		return undefined;
	}

	return { dir: options.dir };
}

function toSdkSessionMutation(options?: ClaudeSessionLookup): SessionMutationOptions | undefined {
	if (!options) {
		return undefined;
	}

	return { dir: options.dir };
}

function toSdkSessionMessagesQuery(
	options?: ClaudeSessionMessagesQuery,
): GetSessionMessagesOptions | undefined {
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
export async function listClaudeSessions(
	options?: ClaudeSessionQuery,
): Promise<ClaudeSessionSummary[]> {
	const sessions = await sdkListSessions(toSdkSessionQuery(options));
	return sessions.map(mapClaudeSessionSummary);
}

/**
 * Read one Claude session summary by ID.
 * @param sessionId - Claude session ID.
 * @param options - Optional lookup scope.
 * @returns Claude session summary, or `undefined` when not found.
 * @since 0.10.0
 */
export async function getClaudeSessionInfo(
	sessionId: string,
	options?: ClaudeSessionLookup,
): Promise<ClaudeSessionSummary | undefined> {
	const session = await sdkGetSessionInfo(sessionId, toSdkSessionLookup(options));
	return session ? mapClaudeSessionSummary(session) : undefined;
}

/**
 * Delete a Claude session by ID.
 * @param sessionId - Claude session ID.
 * @param options - Optional lookup scope.
 * @since 0.10.0
 */
export async function deleteClaudeSession(
	sessionId: string,
	options?: ClaudeSessionLookup,
): Promise<void> {
	const deleteSession = await getClaudeDeleteSession();
	await deleteSession(sessionId, toSdkSessionMutation(options));
}

/**
 * Rename a Claude session by ID.
 * @param sessionId - Claude session ID.
 * @param title - New session title.
 * @param options - Optional lookup scope.
 * @since 0.10.0
 */
export async function renameClaudeSession(
	sessionId: string,
	title: string,
	options?: ClaudeSessionLookup,
): Promise<void> {
	await sdkRenameSession(sessionId, title, toSdkSessionMutation(options));
}

/**
 * Read Claude session transcript messages using library-owned message values.
 * @param sessionId - Claude session ID.
 * @param options - Optional transcript query.
 * @returns Claude transcript messages.
 * @since 0.10.0
 */
export async function getClaudeSessionMessages(
	sessionId: string,
	options?: ClaudeSessionMessagesQuery,
): Promise<ClaudeSessionMessage[]> {
	const messages = await sdkGetSessionMessages(sessionId, toSdkSessionMessagesQuery(options));
	return messages.map(mapClaudeSessionMessage);
}
