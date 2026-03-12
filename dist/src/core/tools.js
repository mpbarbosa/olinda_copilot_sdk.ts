"use strict";
/**
 * Tool type re-exports from `@github/copilot-sdk`.
 * @module core/tools
 * @description Typed helpers for defining custom tools and configuring
 * system messages in Copilot SDK sessions.
 * @since 0.3.2
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineTool = void 0;
var copilot_sdk_1 = require("@github/copilot-sdk");
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
Object.defineProperty(exports, "defineTool", { enumerable: true, get: function () { return copilot_sdk_1.defineTool; } });
