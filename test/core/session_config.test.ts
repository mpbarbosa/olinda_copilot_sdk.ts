import type { ReasoningEffort, SessionConfig } from '../../src/core/session_config';
import type { SystemMessageConfig, Tool, CustomAgentConfig, InfiniteSessionConfig } from '../../src/core/tools';
import { defineTool } from '../../src/core/tools';
import type { SessionHooks } from '../../src/core/hooks';
import { createLocalMCPServer } from '../../src/core/mcp';

describe('session_config types', () => {
	it('ReasoningEffort accepts all four literal values including xhigh', () => {
		const values: ReasoningEffort[] = ['low', 'medium', 'high', 'xhigh'];
		expect(values).toHaveLength(4);
		expect(values).toContain('low');
		expect(values).toContain('medium');
		expect(values).toContain('high');
		expect(values).toContain('xhigh');
	});

	it('SessionConfig accepts a fully populated v0.2.x object', () => {
		const config: SessionConfig = {
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
		const config: SessionConfig = {};
		expect(config.sessionId).toBeUndefined();
		expect(config.model).toBeUndefined();
	});

	it('SessionConfig accepts systemMessage as SystemMessageConfig (append mode)', () => {
		const sysMsg: SystemMessageConfig = { mode: 'append', content: 'You are a TypeScript expert.' };
		const config: SessionConfig = { systemMessage: sysMsg };
		expect(config.systemMessage).toEqual(sysMsg);
	});

	it('SessionConfig accepts systemMessage as SystemMessageConfig (replace mode)', () => {
		const sysMsg: SystemMessageConfig = { mode: 'replace', content: 'Custom full prompt.' };
		const config: SessionConfig = { systemMessage: sysMsg };
		expect((config.systemMessage as { mode: string }).mode).toBe('replace');
	});

	it('SessionConfig accepts v0.3.0 fields: clientName, configDir, availableTools, excludedTools', () => {
		const config: SessionConfig = {
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
		const echoTool: Tool = defineTool('echo', {
			description: 'Echoes input.',
			handler: async (args: unknown) => args,
		});
		const config: SessionConfig = { tools: [echoTool] };
		expect(config.tools).toHaveLength(1);
		expect(config.tools?.[0]).toBe(echoTool);
	});

	it('SessionConfig accepts hooks as SessionHooks', () => {
		const hooks: SessionHooks = {
			onPreToolUse: async () => ({ permissionDecision: 'allow' }),
		};
		const config: SessionConfig = { hooks };
		expect(config.hooks).toBe(hooks);
	});

	it('SessionConfig accepts mcpServers as MCPServerMap', () => {
		const config: SessionConfig = {
			mcpServers: {
				myServer: createLocalMCPServer({ command: 'node', args: ['server.js'] }),
			},
		};
		expect(config.mcpServers).toHaveProperty('myServer');
	});

	it('SessionConfig accepts customAgents', () => {
		const agent: CustomAgentConfig = {
			name: 'test-agent',
			prompt: 'You are a test agent.',
		};
		const config: SessionConfig = { customAgents: [agent] };
		expect(config.customAgents).toHaveLength(1);
	});

	it('SessionConfig accepts skillDirectories and disabledSkills', () => {
		const config: SessionConfig = {
			skillDirectories: ['/usr/local/skills'],
			disabledSkills: ['deprecated-skill'],
		};
		expect(config.skillDirectories).toEqual(['/usr/local/skills']);
		expect(config.disabledSkills).toEqual(['deprecated-skill']);
	});

	it('SessionConfig accepts infiniteSessions config', () => {
		const infinite: InfiniteSessionConfig = { enabled: false };
		const config: SessionConfig = { infiniteSessions: infinite };
		expect(config.infiniteSessions).toEqual({ enabled: false });
	});
});
