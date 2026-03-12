/**
 * MCP Server Types & Factories
 * @module core/mcp
 * @description Typed configuration interfaces for Model Context Protocol (MCP) servers.
 * Supports both local (stdio) servers and remote (HTTP/SSE) servers as defined by the
 * {@link https://github.com/github/copilot-sdk/blob/main/docs/features/mcp.md | Copilot SDK MCP documentation}.
 * @since 0.3.2
 */
/**
 * Creates a typed {@link LocalMCPServer} configuration.
 *
 * @param config - Local MCP server options.
 * @returns A validated `LocalMCPServer` configuration object.
 * @since 0.3.2
 * @example
 * ```ts
 * const fs = createLocalMCPServer({
 *   command: 'npx',
 *   args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
 *   tools: ['*'],
 * });
 * ```
 */
export function createLocalMCPServer(config) {
    return { ...config };
}
/**
 * Creates a typed {@link RemoteMCPServer} configuration.
 *
 * @param config - Remote MCP server options.
 * @returns A validated `RemoteMCPServer` configuration object.
 * @since 0.3.2
 * @example
 * ```ts
 * const gh = createRemoteMCPServer({
 *   type: 'http',
 *   url: 'https://api.githubcopilot.com/mcp/',
 *   headers: { Authorization: 'Bearer TOKEN' },
 *   tools: ['*'],
 * });
 * ```
 */
export function createRemoteMCPServer(config) {
    return { ...config };
}
