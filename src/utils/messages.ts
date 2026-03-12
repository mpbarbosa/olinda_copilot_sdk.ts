/**
 * Message Utility Functions
 * @module utils/messages
 * @description Pure factory functions for constructing Copilot chat {@link Message} objects.
 * All functions are referentially transparent — no side effects, deterministic output.
 * @since 0.1.3
 */

import type { Message, MessageRole } from '../core/types.js';

/**
 * Create a user message.
 * @param content - Text content of the message.
 * @returns A {@link Message} with `role: 'user'`.
 * @since 0.1.3
 * @example createUserMessage('Hello!') // { role: 'user', content: 'Hello!' }
 */
export function createUserMessage(content: string): Message {
	return { role: 'user', content };
}

/**
 * Create a system message.
 * @param content - Text content of the message.
 * @returns A {@link Message} with `role: 'system'`.
 * @since 0.1.3
 * @example createSystemMessage('You are a helpful assistant.')
 */
export function createSystemMessage(content: string): Message {
	return { role: 'system', content };
}

/**
 * Create an assistant message.
 * @param content - Text content of the message.
 * @returns A {@link Message} with `role: 'assistant'`.
 * @since 0.1.3
 * @example createAssistantMessage('How can I help you?')
 */
export function createAssistantMessage(content: string): Message {
	return { role: 'assistant', content };
}

/**
 * Create a function-result message.
 * @param name - Name of the function that produced the result.
 * @param content - Serialized function output.
 * @returns A {@link Message} with `role: 'function'`.
 * @since 0.1.3
 * @example createFunctionMessage('getWeather', '{"temp":22}')
 */
export function createFunctionMessage(name: string, content: string): Message {
	return { role: 'function', name, content };
}

/**
 * Extract the text content from a {@link Message}.
 * @param message - The message to extract from.
 * @returns The `content` string of the message.
 * @since 0.1.3
 * @example extractContent({ role: 'user', content: 'Hello!' }) // 'Hello!'
 */
export function extractContent(message: Message): string {
	return message.content;
}

/**
 * Check whether a message has the given role.
 * @param message - The message to inspect.
 * @param role - The role to check against.
 * @returns `true` when `message.role === role`.
 * @since 0.1.3
 * @example hasRole({ role: 'user', content: 'Hi' }, 'user') // true
 */
export function hasRole(message: Message, role: MessageRole): boolean {
	return message.role === role;
}

/**
 * Filter an array of messages by role.
 * @param messages - Array of messages to filter.
 * @param role - The role to filter by.
 * @returns New array containing only messages with the given role.
 * @since 0.1.3
 * @example filterByRole(messages, 'user') // only user messages
 */
export function filterByRole(messages: Message[], role: MessageRole): Message[] {
	return messages.filter((m) => m.role === role);
}
