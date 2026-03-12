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

describe('core/tools module', () => {
  describe('defineTool', () => {
    it('should create a tool with a valid handler (happy path)', async () => {
      const echoTool = defineTool('echo', {
        description: 'Echoes the input string back.',
        handler: async (args: { text: string }) => args.text,
      });
      expect(echoTool.name).toBe('echo');
      expect(echoTool.description).toBe('Echoes the input string back.');
      const result = await echoTool.handler({ text: 'hello' });
      expect(result).toBe('hello');
    });

    it('should handle edge case: empty input', async () => {
      const echoTool = defineTool('echo', {
        description: 'Echoes the input string back.',
        handler: async (args: { text?: string }) => args.text ?? '',
      });
      const result = await echoTool.handler({});
      expect(result).toBe('');
    });

    it('should handle error scenario: handler throws', async () => {
      const errorTool = defineTool('fail', {
        description: 'Always throws error.',
        handler: async () => {
          throw new Error('Tool failed');
        },
      });
      await expect(errorTool.handler({})).rejects.toThrow('Tool failed');
    });

    it('should support tools with parameters', async () => {
      const sumTool = defineTool('sum', {
        description: 'Sums two numbers.',
        handler: async (args: { a: number; b: number }) => args.a + args.b,
      });
      const result = await sumTool.handler({ a: 2, b: 3 });
      expect(result).toBe(5);
    });

    it('should support async handlers', async () => {
      const asyncTool = defineTool('async', {
        description: 'Returns after delay.',
        handler: async (args: { value: string }) =>
          new Promise((resolve) => setTimeout(() => resolve(args.value), 10)),
      });
      const result = await asyncTool.handler({ value: 'delayed' });
      expect(result).toBe('delayed');
    });

    it('should create tool with undefined parameters', async () => {
      const noParamTool = defineTool('noparam', {
        description: 'No parameters.',
        handler: async () => 'ok',
      });
      const result = await noParamTool.handler({});
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
      const handler: ToolHandler = async (args: { x: number }) => args.x * 2;
      const result = await handler({ x: 4 });
      expect(result).toBe(8);
    });

    it('should allow ToolInvocation type definition', () => {
      const invocation: ToolInvocation = {
        tool: 'echo',
        args: { text: 'hi' },
        sessionId: 'sess1',
      };
      expect(invocation.tool).toBe('echo');
      expect(invocation.args.text).toBe('hi');
      expect(invocation.sessionId).toBe('sess1');
    });

    it('should allow ZodSchema type definition', () => {
      const schema: ZodSchema = {
        parse: (val: unknown) => val,
        safeParse: (val: unknown) => ({ success: true, data: val }),
      };
      expect(typeof schema.parse).toBe('function');
      expect(typeof schema.safeParse).toBe('function');
    });

    it('should allow SystemMessageAppendConfig type definition', () => {
      const config: SystemMessageAppendConfig = {
        type: 'append',
        content: 'extra info',
      };
      expect(config.type).toBe('append');
      expect(config.content).toBe('extra info');
    });

    it('should allow SystemMessageReplaceConfig type definition', () => {
      const config: SystemMessageReplaceConfig = {
        type: 'replace',
        content: 'new system prompt',
      };
      expect(config.type).toBe('replace');
      expect(config.content).toBe('new system prompt');
    });

    it('should allow SystemMessageConfig union type', () => {
      const appendConfig: SystemMessageConfig = {
        type: 'append',
        content: 'append content',
      };
      const replaceConfig: SystemMessageConfig = {
        type: 'replace',
        content: 'replace content',
      };
      expect(['append', 'replace']).toContain(appendConfig.type);
      expect(['append', 'replace']).toContain(replaceConfig.type);
    });

    it('should allow CustomAgentConfig type definition', () => {
      const agentConfig: CustomAgentConfig = {
        name: 'agent',
        description: 'desc',
        tools: [],
      };
      expect(agentConfig.name).toBe('agent');
      expect(agentConfig.description).toBe('desc');
      expect(Array.isArray(agentConfig.tools)).toBe(true);
    });

    it('should allow InfiniteSessionConfig type definition', () => {
      const sessionConfig: InfiniteSessionConfig = {
        enabled: true,
        maxContextSize: 10000,
      };
      expect(sessionConfig.enabled).toBe(true);
      expect(sessionConfig.maxContextSize).toBe(10000);
    });
  });
});
