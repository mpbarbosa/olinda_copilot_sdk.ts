"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildClaudeSdkOptions = buildClaudeSdkOptions;
/**
 * Convert library-owned Claude execution options into SDK query options.
 * @param sources - Ordered option sources; later values override earlier ones.
 * @returns Claude SDK options object.
 * @since 0.10.0
 */
function buildClaudeSdkOptions(...sources) {
    const options = {};
    for (const source of sources) {
        if (!source) {
            continue;
        }
        if (source.model !== undefined)
            options.model = source.model;
        if (source.cwd !== undefined)
            options.cwd = source.cwd;
        if (source.permissionMode !== undefined)
            options.permissionMode = source.permissionMode;
        if (source.maxTurns !== undefined)
            options.maxTurns = source.maxTurns;
        if (source.systemPrompt !== undefined)
            options.systemPrompt = source.systemPrompt;
    }
    return options;
}
