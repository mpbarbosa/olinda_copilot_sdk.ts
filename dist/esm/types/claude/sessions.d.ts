/**
 * Claude session administration helpers.
 * @module claude/sessions
 * @since 0.10.0
 */
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
/**
 * List Claude sessions using library-owned session summary values.
 * @param options - Optional session list query.
 * @returns Claude session summaries.
 * @since 0.10.0
 */
export declare function listClaudeSessions(options?: ClaudeSessionQuery): Promise<ClaudeSessionSummary[]>;
/**
 * Read one Claude session summary by ID.
 * @param sessionId - Claude session ID.
 * @param options - Optional lookup scope.
 * @returns Claude session summary, or `undefined` when not found.
 * @since 0.10.0
 */
export declare function getClaudeSessionInfo(sessionId: string, options?: ClaudeSessionLookup): Promise<ClaudeSessionSummary | undefined>;
/**
 * Delete a Claude session by ID.
 * @param sessionId - Claude session ID.
 * @param options - Optional lookup scope.
 * @since 0.10.0
 */
export declare function deleteClaudeSession(sessionId: string, options?: ClaudeSessionLookup): Promise<void>;
/**
 * Rename a Claude session by ID.
 * @param sessionId - Claude session ID.
 * @param title - New session title.
 * @param options - Optional lookup scope.
 * @since 0.10.0
 */
export declare function renameClaudeSession(sessionId: string, title: string, options?: ClaudeSessionLookup): Promise<void>;
/**
 * Read Claude session transcript messages using library-owned message values.
 * @param sessionId - Claude session ID.
 * @param options - Optional transcript query.
 * @returns Claude transcript messages.
 * @since 0.10.0
 */
export declare function getClaudeSessionMessages(sessionId: string, options?: ClaudeSessionMessagesQuery): Promise<ClaudeSessionMessage[]>;
