/**
 * Tool type re-exports from `@github/copilot-sdk`.
 * @module core/tools
 * @description Typed helpers for defining custom tools and configuring
 * system messages in Copilot SDK sessions.
 * @since 0.3.2
 */
export type { 
/**
 * A tool definition for use in {@link SessionConfig.tools}.
 * Build instances with the {@link defineTool} helper.
 * @since 0.3.2
 */
Tool, 
/**
 * Handler function invoked when the agent calls a tool.
 * @since 0.3.2
 */
ToolHandler, 
/**
 * Metadata forwarded to a tool handler describing the invocation context.
 * @since 0.3.2
 */
ToolInvocation, 
/**
 * Zod-compatible schema type used to describe a tool's argument shape.
 * @since 0.3.2
 */
ZodSchema, 
/**
 * Append-mode system message: SDK foundation + custom `content` appended.
 * @since 0.3.2
 */
SystemMessageAppendConfig, 
/**
 * Replace-mode system message: caller supplies the entire system prompt.
 * @since 0.3.2
 */
SystemMessageReplaceConfig, 
/**
 * System message configuration union.
 * Use `{ type: 'append', content: '...' }` or `{ type: 'replace', content: '...' }`.
 * @since 0.3.2
 */
SystemMessageConfig, 
/**
 * Configuration for a custom agent exposed to the session.
 * @since 0.3.2
 */
CustomAgentConfig, 
/**
 * Infinite session configuration for persistent workspaces and context compaction.
 * @since 0.3.2
 */
InfiniteSessionConfig, } from '@github/copilot-sdk';
export { 
/**
 * Factory helper that constructs a typed {@link Tool} definition.
 *
 * @param name - Tool name exposed to the model.
 * @param config - Tool descriptor: `description`, optional `parameters`, and `handler`.
 * @returns A fully-typed {@link Tool} object ready for use in {@link SessionConfig.tools}.
 * @since 0.3.2
 * @example
 * import { defineTool } from 'olinda_copilot_sdk.ts';
 * const echoTool = defineTool('echo', {
 *   description: 'Echoes the input string back.',
 *   handler: async (args: { text: string }) => args.text,
 * });
 */
defineTool, } from '@github/copilot-sdk';
