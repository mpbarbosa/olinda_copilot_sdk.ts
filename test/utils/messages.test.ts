import {
	createUserMessage,
	createSystemMessage,
	createAssistantMessage,
	createFunctionMessage,
	extractContent,
	hasRole,
	filterByRole,
} from '../../src/utils/messages';
import { USER_MESSAGE, SYSTEM_MESSAGE, ASSISTANT_MESSAGE, CONVERSATION } from '../helpers/fixtures';

// ─── createUserMessage ────────────────────────────────────────────────────────

describe('createUserMessage', () => {
	it('returns a message with role user', () => {
		expect(createUserMessage('hi').role).toBe('user');
	});

	it('returns the given content', () => {
		expect(createUserMessage('hello').content).toBe('hello');
	});

	it('returns a new object each call', () => {
		expect(createUserMessage('x')).not.toBe(createUserMessage('x'));
	});

	it('matches the USER_MESSAGE fixture', () => {
		expect(createUserMessage(USER_MESSAGE.content)).toEqual(USER_MESSAGE);
	});
});

// ─── createSystemMessage ──────────────────────────────────────────────────────

describe('createSystemMessage', () => {
	it('returns a message with role system', () => {
		expect(createSystemMessage('prompt').role).toBe('system');
	});

	it('matches the SYSTEM_MESSAGE fixture', () => {
		expect(createSystemMessage(SYSTEM_MESSAGE.content)).toEqual(SYSTEM_MESSAGE);
	});
});

// ─── createAssistantMessage ───────────────────────────────────────────────────

describe('createAssistantMessage', () => {
	it('returns a message with role assistant', () => {
		expect(createAssistantMessage('reply').role).toBe('assistant');
	});

	it('matches the ASSISTANT_MESSAGE fixture', () => {
		expect(createAssistantMessage(ASSISTANT_MESSAGE.content)).toEqual(ASSISTANT_MESSAGE);
	});
});

// ─── createFunctionMessage ────────────────────────────────────────────────────

describe('createFunctionMessage', () => {
	it('returns a message with role function', () => {
		expect(createFunctionMessage('fn', '{}').role).toBe('function');
	});

	it('includes the function name', () => {
		expect(createFunctionMessage('getWeather', '{}').name).toBe('getWeather');
	});

	it('includes the content', () => {
		expect(createFunctionMessage('fn', '{"a":1}').content).toBe('{"a":1}');
	});
});

// ─── extractContent ───────────────────────────────────────────────────────────

describe('extractContent', () => {
	it('returns the content of a user message', () => {
		expect(extractContent(USER_MESSAGE)).toBe('Hello!');
	});

	it('returns the content of a system message', () => {
		expect(extractContent(SYSTEM_MESSAGE)).toBe('You are a helpful assistant.');
	});
});

// ─── hasRole ──────────────────────────────────────────────────────────────────

describe('hasRole', () => {
	it('returns true when message role matches', () => {
		expect(hasRole(USER_MESSAGE, 'user')).toBe(true);
	});

	it('returns false when message role does not match', () => {
		expect(hasRole(USER_MESSAGE, 'system')).toBe(false);
	});

	it('works for assistant role', () => {
		expect(hasRole(ASSISTANT_MESSAGE, 'assistant')).toBe(true);
	});
});

// ─── filterByRole ─────────────────────────────────────────────────────────────

describe('filterByRole', () => {
	it('returns only user messages', () => {
		const result = filterByRole(CONVERSATION, 'user');
		expect(result).toHaveLength(1);
		expect(result[0].role).toBe('user');
	});

	it('returns only system messages', () => {
		const result = filterByRole(CONVERSATION, 'system');
		expect(result).toHaveLength(1);
		expect(result[0].role).toBe('system');
	});

	it('returns empty array when no messages match', () => {
		expect(filterByRole(CONVERSATION, 'function')).toEqual([]);
	});

	it('does not mutate the original array', () => {
		const original = [...CONVERSATION];
		filterByRole(CONVERSATION, 'user');
		expect(CONVERSATION).toEqual(original);
	});
});
