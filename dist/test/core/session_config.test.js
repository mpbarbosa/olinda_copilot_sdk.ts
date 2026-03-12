"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("../../src/core/tools");
const mcp_1 = require("../../src/core/mcp");
describe('session_config types', () => {
    it('ReasoningEffort accepts all four literal values including xhigh', () => {
        const values = ['low', 'medium', 'high', 'xhigh'];
        expect(values).toHaveLength(4);
        expect(values).toContain('low');
        expect(values).toContain('medium');
        expect(values).toContain('high');
        expect(values).toContain('xhigh');
    });
    it('SessionConfig accepts a fully populated v0.2.x object', () => {
        const config = {
            sessionId: 'session-abc',
            model: 'gpt-4o',
            workingDirectory: '/tmp',
            reasoningEffort: 'high',
            streaming: true,
            provider: {
                type: 'openai',
                apiKey: 'sk-test',
                model: 'gpt-4o',
            },
        };
        expect(config.sessionId).toBe('session-abc');
        expect(config.model).toBe('gpt-4o');
        expect(config.reasoningEffort).toBe('high');
        expect(config.streaming).toBe(true);
    });
    it('SessionConfig allows all fields to be omitted', () => {
        const config = {};
        expect(config.sessionId).toBeUndefined();
        expect(config.model).toBeUndefined();
    });
    it('SessionConfig accepts systemMessage as SystemMessageConfig (append mode)', () => {
        const sysMsg = { mode: 'append', content: 'You are a TypeScript expert.' };
        const config = { systemMessage: sysMsg };
        expect(config.systemMessage).toEqual(sysMsg);
    });
    it('SessionConfig accepts systemMessage as SystemMessageConfig (replace mode)', () => {
        const sysMsg = { mode: 'replace', content: 'Custom full prompt.' };
        const config = { systemMessage: sysMsg };
        expect(config.systemMessage.mode).toBe('replace');
    });
    it('SessionConfig accepts v0.3.2 fields: clientName, configDir, availableTools, excludedTools', () => {
        const config = {
            clientName: 'my-app',
            configDir: '/home/user/.config/copilot',
            availableTools: ['shell', 'read_file'],
            excludedTools: ['write_file'],
        };
        expect(config.clientName).toBe('my-app');
        expect(config.configDir).toBe('/home/user/.config/copilot');
        expect(config.availableTools).toEqual(['shell', 'read_file']);
        expect(config.excludedTools).toEqual(['write_file']);
    });
    it('SessionConfig accepts tools array built with defineTool', () => {
        const echoTool = (0, tools_1.defineTool)('echo', {
            description: 'Echoes input.',
            handler: async (args) => args,
        });
        const config = { tools: [echoTool] };
        expect(config.tools).toHaveLength(1);
        expect(config.tools?.[0]).toBe(echoTool);
    });
    it('SessionConfig accepts hooks as SessionHooks', () => {
        const hooks = {
            onPreToolUse: async () => ({ permissionDecision: 'allow' }),
        };
        const config = { hooks };
        expect(config.hooks).toBe(hooks);
    });
    it('SessionConfig accepts mcpServers as MCPServerMap', () => {
        const config = {
            mcpServers: {
                myServer: (0, mcp_1.createLocalMCPServer)({ command: 'node', args: ['server.js'] }),
            },
        };
        expect(config.mcpServers).toHaveProperty('myServer');
    });
    it('SessionConfig accepts customAgents', () => {
        const agent = {
            name: 'test-agent',
            prompt: 'You are a test agent.',
        };
        const config = { customAgents: [agent] };
        expect(config.customAgents).toHaveLength(1);
    });
    it('SessionConfig accepts skillDirectories and disabledSkills', () => {
        const config = {
            skillDirectories: ['/usr/local/skills'],
            disabledSkills: ['deprecated-skill'],
        };
        expect(config.skillDirectories).toEqual(['/usr/local/skills']);
        expect(config.disabledSkills).toEqual(['deprecated-skill']);
    });
    it('SessionConfig accepts infiniteSessions config', () => {
        const infinite = { enabled: false };
        const config = { infiniteSessions: infinite };
        expect(config.infiniteSessions).toEqual({ enabled: false });
    });
});
