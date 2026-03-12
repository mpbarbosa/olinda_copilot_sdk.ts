"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../../src/utils/messages");
const fixtures_1 = require("../helpers/fixtures");
// ─── createUserMessage ────────────────────────────────────────────────────────
describe('createUserMessage', () => {
    it('returns a message with role user', () => {
        expect((0, messages_1.createUserMessage)('hi').role).toBe('user');
    });
    it('returns the given content', () => {
        expect((0, messages_1.createUserMessage)('hello').content).toBe('hello');
    });
    it('returns a new object each call', () => {
        expect((0, messages_1.createUserMessage)('x')).not.toBe((0, messages_1.createUserMessage)('x'));
    });
    it('matches the USER_MESSAGE fixture', () => {
        expect((0, messages_1.createUserMessage)(fixtures_1.USER_MESSAGE.content)).toEqual(fixtures_1.USER_MESSAGE);
    });
});
// ─── createSystemMessage ──────────────────────────────────────────────────────
describe('createSystemMessage', () => {
    it('returns a message with role system', () => {
        expect((0, messages_1.createSystemMessage)('prompt').role).toBe('system');
    });
    it('matches the SYSTEM_MESSAGE fixture', () => {
        expect((0, messages_1.createSystemMessage)(fixtures_1.SYSTEM_MESSAGE.content)).toEqual(fixtures_1.SYSTEM_MESSAGE);
    });
});
// ─── createAssistantMessage ───────────────────────────────────────────────────
describe('createAssistantMessage', () => {
    it('returns a message with role assistant', () => {
        expect((0, messages_1.createAssistantMessage)('reply').role).toBe('assistant');
    });
    it('matches the ASSISTANT_MESSAGE fixture', () => {
        expect((0, messages_1.createAssistantMessage)(fixtures_1.ASSISTANT_MESSAGE.content)).toEqual(fixtures_1.ASSISTANT_MESSAGE);
    });
});
// ─── createFunctionMessage ────────────────────────────────────────────────────
describe('createFunctionMessage', () => {
    it('returns a message with role function', () => {
        expect((0, messages_1.createFunctionMessage)('fn', '{}').role).toBe('function');
    });
    it('includes the function name', () => {
        expect((0, messages_1.createFunctionMessage)('getWeather', '{}').name).toBe('getWeather');
    });
    it('includes the content', () => {
        expect((0, messages_1.createFunctionMessage)('fn', '{"a":1}').content).toBe('{"a":1}');
    });
});
// ─── extractContent ───────────────────────────────────────────────────────────
describe('extractContent', () => {
    it('returns the content of a user message', () => {
        expect((0, messages_1.extractContent)(fixtures_1.USER_MESSAGE)).toBe('Hello!');
    });
    it('returns the content of a system message', () => {
        expect((0, messages_1.extractContent)(fixtures_1.SYSTEM_MESSAGE)).toBe('You are a helpful assistant.');
    });
});
// ─── hasRole ──────────────────────────────────────────────────────────────────
describe('hasRole', () => {
    it('returns true when message role matches', () => {
        expect((0, messages_1.hasRole)(fixtures_1.USER_MESSAGE, 'user')).toBe(true);
    });
    it('returns false when message role does not match', () => {
        expect((0, messages_1.hasRole)(fixtures_1.USER_MESSAGE, 'system')).toBe(false);
    });
    it('works for assistant role', () => {
        expect((0, messages_1.hasRole)(fixtures_1.ASSISTANT_MESSAGE, 'assistant')).toBe(true);
    });
});
// ─── filterByRole ─────────────────────────────────────────────────────────────
describe('filterByRole', () => {
    it('returns only user messages', () => {
        const result = (0, messages_1.filterByRole)(fixtures_1.CONVERSATION, 'user');
        expect(result).toHaveLength(1);
        expect(result[0].role).toBe('user');
    });
    it('returns only system messages', () => {
        const result = (0, messages_1.filterByRole)(fixtures_1.CONVERSATION, 'system');
        expect(result).toHaveLength(1);
        expect(result[0].role).toBe('system');
    });
    it('returns empty array when no messages match', () => {
        expect((0, messages_1.filterByRole)(fixtures_1.CONVERSATION, 'function')).toEqual([]);
    });
    it('does not mutate the original array', () => {
        const original = [...fixtures_1.CONVERSATION];
        (0, messages_1.filterByRole)(fixtures_1.CONVERSATION, 'user');
        expect(fixtures_1.CONVERSATION).toEqual(original);
    });
});
