"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("../../src/utils/stream");
const fixtures_1 = require("../helpers/fixtures");
// ─── parseSSELine ─────────────────────────────────────────────────────────────
describe('parseSSELine', () => {
    it('returns data payload for a valid data line', () => {
        const result = (0, stream_1.parseSSELine)(fixtures_1.SSE_DATA_LINE);
        expect(result).toBe(fixtures_1.SSE_DATA_LINE.slice(6));
    });
    it('returns null for [DONE] sentinel', () => {
        expect((0, stream_1.parseSSELine)(fixtures_1.SSE_DONE_LINE)).toBeNull();
    });
    it('returns null for a comment line', () => {
        expect((0, stream_1.parseSSELine)(fixtures_1.SSE_COMMENT_LINE)).toBeNull();
    });
    it('returns null for an empty string', () => {
        expect((0, stream_1.parseSSELine)('')).toBeNull();
    });
    it('returns null for a plain text line', () => {
        expect((0, stream_1.parseSSELine)('not a data line')).toBeNull();
    });
});
// ─── parseSSEChunk ────────────────────────────────────────────────────────────
describe('parseSSEChunk', () => {
    it('parses a valid SSE data line into a StreamChunk', () => {
        const result = (0, stream_1.parseSSEChunk)(fixtures_1.SSE_DATA_LINE);
        expect(result).toEqual(fixtures_1.STREAM_CHUNK);
    });
    it('returns null for [DONE] sentinel', () => {
        expect((0, stream_1.parseSSEChunk)(fixtures_1.SSE_DONE_LINE)).toBeNull();
    });
    it('returns null for malformed JSON', () => {
        expect((0, stream_1.parseSSEChunk)('data: {not valid json}')).toBeNull();
    });
    it('returns null for a non-data line', () => {
        expect((0, stream_1.parseSSEChunk)(fixtures_1.SSE_COMMENT_LINE)).toBeNull();
    });
    it('trims leading/trailing whitespace before parsing', () => {
        const result = (0, stream_1.parseSSEChunk)(`  ${fixtures_1.SSE_DATA_LINE}  `);
        expect(result).toEqual(fixtures_1.STREAM_CHUNK);
    });
});
// ─── extractDeltaContent ─────────────────────────────────────────────────────
describe('extractDeltaContent', () => {
    it('returns the delta content from a mid-stream chunk', () => {
        expect((0, stream_1.extractDeltaContent)(fixtures_1.STREAM_CHUNK)).toBe('Hello');
    });
    it('returns empty string for a done chunk with no content', () => {
        expect((0, stream_1.extractDeltaContent)(fixtures_1.STREAM_CHUNK_DONE)).toBe('');
    });
    it('concatenates content from multiple choices', () => {
        const multiChoice = {
            ...fixtures_1.STREAM_CHUNK,
            choices: [
                { index: 0, delta: { content: 'foo' }, finish_reason: null },
                { index: 1, delta: { content: 'bar' }, finish_reason: null },
            ],
        };
        expect((0, stream_1.extractDeltaContent)(multiChoice)).toBe('foobar');
    });
    it('treats undefined delta content as empty string', () => {
        const noContent = {
            ...fixtures_1.STREAM_CHUNK,
            choices: [{ index: 0, delta: {}, finish_reason: null }],
        };
        expect((0, stream_1.extractDeltaContent)(noContent)).toBe('');
    });
});
// ─── isStreamDone ─────────────────────────────────────────────────────────────
describe('isStreamDone', () => {
    it('returns false for a mid-stream chunk', () => {
        expect((0, stream_1.isStreamDone)(fixtures_1.STREAM_CHUNK)).toBe(false);
    });
    it('returns true for a chunk with a finish_reason', () => {
        expect((0, stream_1.isStreamDone)(fixtures_1.STREAM_CHUNK_DONE)).toBe(true);
    });
    it('returns true when any choice has a finish_reason', () => {
        const mixed = {
            ...fixtures_1.STREAM_CHUNK,
            choices: [
                { index: 0, delta: { content: 'x' }, finish_reason: null },
                { index: 1, delta: {}, finish_reason: 'stop' },
            ],
        };
        expect((0, stream_1.isStreamDone)(mixed)).toBe(true);
    });
    it('returns false when all choices have null finish_reason', () => {
        const ongoing = {
            ...fixtures_1.STREAM_CHUNK,
            choices: [
                { index: 0, delta: { content: 'a' }, finish_reason: null },
                { index: 1, delta: { content: 'b' }, finish_reason: null },
            ],
        };
        expect((0, stream_1.isStreamDone)(ongoing)).toBe(false);
    });
});
