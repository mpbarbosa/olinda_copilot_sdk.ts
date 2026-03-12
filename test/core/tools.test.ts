import { defineTool } from '../../src/core/tools';
import type {
	Tool,
	ToolHandler,
	ToolInvocation,
	ZodSchema,
	SystemMessageAppendConfig,
	SystemMessageReplaceConfig,
	SystemMessageConfig,
	CustomAgentConfig,
	InfiniteSessionConfig,
} from '../../src/core/tools';

const mockInvocation: ToolInvocation = {
	sessionId: 'sess1',
	toolCallId: 'call1',
	toolName: 'echo',
	arguments: {},
};

describe('core/tools module', () => {
	describe('defineTool', () => {
		it('should create a tool with a valid handler (happy path)', async () => {
			const echoTool = defineTool('echo', {
				description: 'Echoes the input string back.',
				handler: async (args: { text: string }) => args.text,
			});
			expect(echoTool.name).toBe('echo');
			expect(echoTool.description).toBe('Echoes the input string back.');
			const result = await echoTool.handler({ text: 'hello' }, mockInvocation);
			expect(result).toBe('hello');
		});

		it('should handle edge case: empty input', async () => {
			const echoTool = defineTool('echo', {
				description: 'Echoes the input string back.',
				handler: async (args: { text?: string }) => args.text ?? '',
			});
			const result = await echoTool.handler({}, mockInvocation);
			expect(result).toBe('');
		});

		it('should handle error scenario: handler throws', async () => {
			const errorTool = defineTool('fail', {
				description: 'Always throws error.',
				handler: async () => {
					throw new Error('Tool failed');
				},
			});
			await expect(errorTool.handler({}, mockInvocation)).rejects.toThrow('Tool failed');
		});

		it('should support tools with parameters', async () => {
			const sumTool = defineTool('sum', {
				description: 'Sums two numbers.',
				handler: async (args: { a: number; b: number }) => args.a + args.b,
			});
			const result = await sumTool.handler({ a: 2, b: 3 }, mockInvocation);
			expect(result).toBe(5);
		});

		it('should support async handlers', async () => {
			const asyncTool = defineTool('async', {
				description: 'Returns after delay.',
				handler: async (args: { value: string }) =>
					new Promise((resolve) => setTimeout(() => resolve(args.value), 10)),
			});
			const result = await asyncTool.handler({ value: 'delayed' }, mockInvocation);
			expect(result).toBe('delayed');
		});

		it('should create tool with undefined parameters', async () => {
			const noParamTool = defineTool('noparam', {
				description: 'No parameters.',
				handler: async () => 'ok',
			});
			const result = await noParamTool.handler({}, mockInvocation);
			expect(result).toBe('ok');
		});
	});

	describe('Type exports', () => {
		it('should allow Tool type definition', () => {
			const tool: Tool = {
				name: 'test',
				description: 'desc',
				handler: async () => 'result',
			};
			expect(tool.name).toBe('test');
			expect(tool.description).toBe('desc');
		});

		it('should allow ToolHandler type definition', async () => {
			const handler: ToolHandler<{ x: number }> = async (args, _inv) => args.x * 2;
			const result = await handler({ x: 4 }, mockInvocation);
			expect(result).toBe(8);
		});

		it('should allow ToolInvocation type definition', () => {
			const invocation: ToolInvocation = {
				sessionId: 'sess1',
				toolCallId: 'call-abc',
				toolName: 'echo',
				arguments: { text: 'hi' },
			};
			expect(invocation.toolName).toBe('echo');
			expect(invocation.arguments).toEqual({ text: 'hi' });
			expect(invocation.sessionId).toBe('sess1');
			expect(invocation.toolCallId).toBe('call-abc');
		});

		it('should allow ZodSchema type definition', () => {
			const schema: ZodSchema = {
				_output: undefined,
				toJSONSchema: () => ({ type: 'object' }),
			};
			expect(typeof schema.toJSONSchema).toBe('function');
			expect(schema.toJSONSchema()).toEqual({ type: 'object' });
		});

		it('should allow SystemMessageAppendConfig type definition', () => {
			const config: SystemMessageAppendConfig = {
				mode: 'append',
				content: 'extra info',
			};
			expect(config.mode).toBe('append');
			expect(config.content).toBe('extra info');
		});

		it('should allow SystemMessageReplaceConfig type definition', () => {
			const config: SystemMessageReplaceConfig = {
				mode: 'replace',
				content: 'new system prompt',
			};
			expect(config.mode).toBe('replace');
			expect(config.content).toBe('new system prompt');
		});

		it('should allow SystemMessageConfig union type', () => {
			const appendConfig: SystemMessageConfig = {
				mode: 'append',
				content: 'append content',
			};
			const replaceConfig: SystemMessageConfig = {
				mode: 'replace',
				content: 'replace content',
			};
			expect(['append', 'replace', undefined]).toContain(appendConfig.mode);
			expect(['append', 'replace']).toContain(replaceConfig.mode);
		});

		it('should allow CustomAgentConfig type definition', () => {
			const agentConfig: CustomAgentConfig = {
				name: 'agent',
				prompt: 'You are a helpful agent.',
				tools: [],
			};
			expect(agentConfig.name).toBe('agent');
			expect(agentConfig.prompt).toBe('You are a helpful agent.');
			expect(Array.isArray(agentConfig.tools)).toBe(true);
		});

		it('should allow InfiniteSessionConfig type definition', () => {
			const sessionConfig: InfiniteSessionConfig = {
				enabled: true,
				backgroundCompactionThreshold: 0.8,
			};
			expect(sessionConfig.enabled).toBe(true);
			expect(sessionConfig.backgroundCompactionThreshold).toBe(0.8);
		});
	});
});
