"use strict";
/**
 * Message Utility Functions
 * @module utils/messages
 * @description Pure factory functions for constructing Copilot chat {@link Message} objects.
 * All functions are referentially transparent — no side effects, deterministic output.
 * @since 0.1.3
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserMessage = createUserMessage;
exports.createSystemMessage = createSystemMessage;
exports.createAssistantMessage = createAssistantMessage;
exports.createFunctionMessage = createFunctionMessage;
exports.extractContent = extractContent;
exports.hasRole = hasRole;
exports.filterByRole = filterByRole;
/**
 * Create a user message.
 * @param content - Text content of the message.
 * @returns A {@link Message} with `role: 'user'`.
 * @since 0.1.3
 * @example createUserMessage('Hello!') // { role: 'user', content: 'Hello!' }
 */
function createUserMessage(content) {
    return { role: 'user', content };
}
/**
 * Create a system message.
 * @param content - Text content of the message.
 * @returns A {@link Message} with `role: 'system'`.
 * @since 0.1.3
 * @example createSystemMessage('You are a helpful assistant.')
 */
function createSystemMessage(content) {
    return { role: 'system', content };
}
/**
 * Create an assistant message.
 * @param content - Text content of the message.
 * @returns A {@link Message} with `role: 'assistant'`.
 * @since 0.1.3
 * @example createAssistantMessage('How can I help you?')
 */
function createAssistantMessage(content) {
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
function createFunctionMessage(name, content) {
    return { role: 'function', name, content };
}
/**
 * Extract the text content from a {@link Message}.
 * @param message - The message to extract from.
 * @returns The `content` string of the message.
 * @since 0.1.3
 * @example extractContent({ role: 'user', content: 'Hello!' }) // 'Hello!'
 */
function extractContent(message) {
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
function hasRole(message, role) {
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
function filterByRole(messages, role) {
    return messages.filter((m) => m.role === role);
}
