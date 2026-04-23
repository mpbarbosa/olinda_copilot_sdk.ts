'use strict';
// Minimal CJS stub for @anthropic-ai/claude-agent-sdk (pure-ESM package).
// Each test that needs this module provides a full jest.mock() factory.
// This file exists solely so Jest's CJS resolver can locate the module name.
async function* query(_params) {}
async function startup(_params) { return undefined; }
async function listSessions(_options) { return []; }
async function getSessionInfo(_id, _options) { return undefined; }
async function deleteSession(_id, _options) {}
async function renameSession(_id, _title, _options) {}
async function getSessionMessages(_id, _options) { return []; }
module.exports = { query, startup, listSessions, getSessionInfo, deleteSession, renameSession, getSessionMessages };
