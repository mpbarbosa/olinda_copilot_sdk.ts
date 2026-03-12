"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("../../src/core/mcp.js");
// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const localConfig = {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
    tools: ['*'],
};
const remoteConfig = {
    type: 'http',
    url: 'https://api.githubcopilot.com/mcp/',
    tools: ['*'],
};
// ---------------------------------------------------------------------------
// createLocalMCPServer
// ---------------------------------------------------------------------------
describe('createLocalMCPServer', () => {
    it('returns a config equal to the input', () => {
        const result = (0, mcp_js_1.createLocalMCPServer)(localConfig);
        expect(result).toEqual(localConfig);
    });
    it('returns a shallow copy, not the same reference', () => {
        const result = (0, mcp_js_1.createLocalMCPServer)(localConfig);
        expect(result).not.toBe(localConfig);
    });
    it('preserves optional env, cwd, timeout, type fields', () => {
        const full = {
            type: 'stdio',
            command: 'node',
            args: ['./server.js'],
            env: { DEBUG: 'true' },
            cwd: './servers',
            tools: ['read_file', 'write_file'],
            timeout: 30000,
        };
        expect((0, mcp_js_1.createLocalMCPServer)(full)).toEqual(full);
    });
    it('preserves an empty args array', () => {
        const result = (0, mcp_js_1.createLocalMCPServer)({ command: 'my-cli', args: [], tools: [] });
        expect(result.args).toEqual([]);
        expect(result.tools).toEqual([]);
    });
    it('result is assignable to MCPServerMap values', () => {
        const servers = {
            fs: (0, mcp_js_1.createLocalMCPServer)(localConfig),
        };
        expect(servers['fs']).toEqual(localConfig);
    });
});
// ---------------------------------------------------------------------------
// createRemoteMCPServer
// ---------------------------------------------------------------------------
describe('createRemoteMCPServer', () => {
    it('returns a config equal to the input', () => {
        const result = (0, mcp_js_1.createRemoteMCPServer)(remoteConfig);
        expect(result).toEqual(remoteConfig);
    });
    it('returns a shallow copy, not the same reference', () => {
        const result = (0, mcp_js_1.createRemoteMCPServer)(remoteConfig);
        expect(result).not.toBe(remoteConfig);
    });
    it('preserves headers, timeout, and SSE type', () => {
        const sseConfig = {
            type: 'sse',
            url: 'https://mcp.example.com/events',
            headers: { Authorization: 'Bearer TOKEN' },
            timeout: 5000,
            tools: ['search'],
        };
        expect((0, mcp_js_1.createRemoteMCPServer)(sseConfig)).toEqual(sseConfig);
    });
    it('accepts omitted optional fields', () => {
        const minimal = {
            type: 'http',
            url: 'https://mcp.example.com/',
        };
        const result = (0, mcp_js_1.createRemoteMCPServer)(minimal);
        expect(result.headers).toBeUndefined();
        expect(result.timeout).toBeUndefined();
        expect(result.tools).toBeUndefined();
    });
    it('result is assignable to MCPServerMap values', () => {
        const servers = {
            github: (0, mcp_js_1.createRemoteMCPServer)(remoteConfig),
        };
        expect(servers['github']).toEqual(remoteConfig);
    });
});
// ---------------------------------------------------------------------------
// MCPServerMap
// ---------------------------------------------------------------------------
describe('MCPServerMap', () => {
    it('allows mixing local and remote servers', () => {
        const map = {
            local: (0, mcp_js_1.createLocalMCPServer)(localConfig),
            remote: (0, mcp_js_1.createRemoteMCPServer)(remoteConfig),
        };
        expect(Object.keys(map)).toHaveLength(2);
        expect(map['local']).toEqual(localConfig);
        expect(map['remote']).toEqual(remoteConfig);
    });
    it('allows an empty map', () => {
        const map = {};
        expect(map).toEqual({});
    });
});
