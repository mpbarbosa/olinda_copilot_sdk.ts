/**
 * MCP Server Types & Factories
 * @module core/mcp
 * @description Typed configuration interfaces for Model Context Protocol (MCP) servers.
 * Supports both local (stdio) servers and remote (HTTP/SSE) servers as defined by the
 * {@link https://github.com/github/copilot-sdk/blob/main/docs/features/mcp.md | Copilot SDK MCP documentation}.
 * @since 0.3.1
 */

/**
 * Shared fields for all MCP server configurations.
 *
 * @since 0.3.1
 */
interface BaseMCPServer {
	/**
	 * Tools to expose from this server.
	 * Use `["*"]` to expose all tools, `[]` to expose none,
	 * or list specific tool names.
	 */
	tools?: string[];
	/** Request timeout in milliseconds. */
	timeout?: number;
}

/**
 * Configuration for a local (stdio) MCP server that runs as a subprocess.
 *
 * @since 0.3.1
 * @example
 * ```ts
 * const server = createLocalMCPServer({
 *   command: 'npx',
 *   args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
 *   tools: ['*'],
 * });
 * ```
 */
export interface LocalMCPServer extends BaseMCPServer {
	/** Server type identifier. Defaults to `'local'` when omitted. */
	type?: 'local' | 'stdio';
	/** Executable command to launch the server process. */
	command: string;
	/** Arguments passed to the command. */
	args: string[];
	/** Environment variables injected into the server process. */
	env?: Record<string, string>;
	/** Working directory for the server process. */
	cwd?: string;
}

/**
 * Configuration for a remote (HTTP or SSE) MCP server.
 *
 * @since 0.3.1
 * @example
 * ```ts
 * const server = createRemoteMCPServer({
 *   type: 'http',
 *   url: 'https://api.githubcopilot.com/mcp/',
 *   headers: { Authorization: 'Bearer TOKEN' },
 *   tools: ['*'],
 * });
 * ```
 */
export interface RemoteMCPServer extends BaseMCPServer {
	/** Server transport type. */
	type: 'http' | 'sse';
	/** Full URL of the remote MCP server. */
	url: string;
	/** HTTP headers sent with every request (e.g. auth headers). */
	headers?: Record<string, string>;
}

/**
 * A named map of MCP servers passed to `SessionConfig.mcpServers`.
 * Each key is the server name; the value is the server configuration.
 *
 * @since 0.3.1
 * @example
 * ```ts
 * const servers: MCPServerMap = {
 *   filesystem: createLocalMCPServer({ command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'], tools: ['*'] }),
 *   github:     createRemoteMCPServer({ type: 'http', url: 'https://api.githubcopilot.com/mcp/', tools: ['*'] }),
 * };
 * ```
 */
export type MCPServerMap = Record<string, LocalMCPServer | RemoteMCPServer>;

/**
 * Creates a typed {@link LocalMCPServer} configuration.
 *
 * @param config - Local MCP server options.
 * @returns A validated `LocalMCPServer` configuration object.
 * @since 0.3.1
 * @example
 * ```ts
 * const fs = createLocalMCPServer({
 *   command: 'npx',
 *   args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
 *   tools: ['*'],
 * });
 * ```
 */
export function createLocalMCPServer(config: LocalMCPServer): LocalMCPServer {
	return { ...config };
}

/**
 * Creates a typed {@link RemoteMCPServer} configuration.
 *
 * @param config - Remote MCP server options.
 * @returns A validated `RemoteMCPServer` configuration object.
 * @since 0.3.1
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
export function createRemoteMCPServer(config: RemoteMCPServer): RemoteMCPServer {
	return { ...config };
}
