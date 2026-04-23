"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('session_types type re-exports', () => {
    it('are usable in type positions', () => {
        const typeMarkers = [];
        expect(typeMarkers).toHaveLength(0);
    });
    it('allows strongly typed event handlers', () => {
        const lifecycleHandler = event => {
            expect(event.type).toBe('session.created');
        };
        const eventHandler = (event) => {
            const eventType = event.type;
            expect(typeof eventType).toBe('string');
        };
        lifecycleHandler({
            type: 'session.created',
            sessionId: 'session-1',
        });
        eventHandler({
            id: 'evt-1',
            timestamp: '2026-04-23T00:00:00.000Z',
            parentId: null,
            type: 'assistant.message',
            data: {
                content: 'Hello',
            },
        });
    });
    it('allows MessageOptions to be extended', () => {
        const opts = {
            prompt: 'Hello',
            customField: 'foo',
        };
        expect(opts.customField).toBe('foo');
    });
    it('allows model info to be consumed structurally', () => {
        const info = {
            id: 'model-1',
            name: 'Test Model',
            capabilities: {
                supports: {
                    vision: false,
                    reasoningEffort: false,
                },
                limits: {
                    max_context_window_tokens: 200000,
                },
            },
        };
        expect(info.id).toBe('model-1');
    });
});
