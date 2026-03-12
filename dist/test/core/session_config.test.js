"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('session_config types', () => {
    it('ReasoningEffort accepts all three literal values', () => {
        const values = ['low', 'medium', 'high'];
        expect(values).toHaveLength(3);
        expect(values).toContain('low');
        expect(values).toContain('medium');
        expect(values).toContain('high');
    });
    it('SessionConfig accepts a fully populated object', () => {
        const config = {
            sessionId: 'session-abc',
            model: 'gpt-4o',
            systemMessage: 'You are a helpful assistant.',
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
});
