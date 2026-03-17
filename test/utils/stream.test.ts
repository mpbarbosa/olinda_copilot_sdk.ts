import {
	parseSSELine,
	parseSSEChunk,
	parseSSEStream,
	extractDeltaContent,
	isStreamDone,
} from '../../src/utils/stream';
import type { StreamChunk } from '../../src/core/types';
import {
	STREAM_CHUNK,
	STREAM_CHUNK_DONE,
	SSE_DATA_LINE,
	SSE_DONE_LINE,
	SSE_COMMENT_LINE,
} from '../helpers/fixtures';

// ─── parseSSELine ─────────────────────────────────────────────────────────────

describe('parseSSELine', () => {
	it('returns data payload for a valid data line', () => {
		const result = parseSSELine(SSE_DATA_LINE);
		expect(result).toBe(SSE_DATA_LINE.slice(6));
	});

	it('returns null for [DONE] sentinel', () => {
		expect(parseSSELine(SSE_DONE_LINE)).toBeNull();
	});

	it('returns null for a comment line', () => {
		expect(parseSSELine(SSE_COMMENT_LINE)).toBeNull();
	});

	it('returns null for an empty string', () => {
		expect(parseSSELine('')).toBeNull();
	});

	it('returns null for a plain text line', () => {
		expect(parseSSELine('not a data line')).toBeNull();
	});
});

// ─── parseSSEChunk ────────────────────────────────────────────────────────────

describe('parseSSEChunk', () => {
	it('parses a valid SSE data line into a StreamChunk', () => {
		const result = parseSSEChunk(SSE_DATA_LINE);
		expect(result).toEqual(STREAM_CHUNK);
	});

	it('returns null for [DONE] sentinel', () => {
		expect(parseSSEChunk(SSE_DONE_LINE)).toBeNull();
	});

	it('returns null for malformed JSON', () => {
		expect(parseSSEChunk('data: {not valid json}')).toBeNull();
	});

	it('returns null for a non-data line', () => {
		expect(parseSSEChunk(SSE_COMMENT_LINE)).toBeNull();
	});

	it('trims leading/trailing whitespace before parsing', () => {
		const result = parseSSEChunk(`  ${SSE_DATA_LINE}  `);
		expect(result).toEqual(STREAM_CHUNK);
	});
});

// ─── extractDeltaContent ─────────────────────────────────────────────────────

describe('extractDeltaContent', () => {
	it('returns the delta content from a mid-stream chunk', () => {
		expect(extractDeltaContent(STREAM_CHUNK)).toBe('Hello');
	});

	it('returns empty string for a done chunk with no content', () => {
		expect(extractDeltaContent(STREAM_CHUNK_DONE)).toBe('');
	});

	it('concatenates content from multiple choices', () => {
		const multiChoice = {
			...STREAM_CHUNK,
			choices: [
				{ index: 0, delta: { content: 'foo' }, finish_reason: null },
				{ index: 1, delta: { content: 'bar' }, finish_reason: null },
			],
		};
		expect(extractDeltaContent(multiChoice)).toBe('foobar');
	});

	it('treats undefined delta content as empty string', () => {
		const noContent = {
			...STREAM_CHUNK,
			choices: [{ index: 0, delta: {}, finish_reason: null }],
		};
		expect(extractDeltaContent(noContent)).toBe('');
	});
});

// ─── isStreamDone ─────────────────────────────────────────────────────────────

describe('isStreamDone', () => {
	it('returns false for a mid-stream chunk', () => {
		expect(isStreamDone(STREAM_CHUNK)).toBe(false);
	});

	it('returns true for a chunk with a finish_reason', () => {
		expect(isStreamDone(STREAM_CHUNK_DONE)).toBe(true);
	});

	it('returns true when any choice has a finish_reason', () => {
		const mixed = {
			...STREAM_CHUNK,
			choices: [
				{ index: 0, delta: { content: 'x' }, finish_reason: null },
				{ index: 1, delta: {}, finish_reason: 'stop' },
			],
		};
		expect(isStreamDone(mixed)).toBe(true);
	});

	it('returns false when all choices have null finish_reason', () => {
		const ongoing = {
			...STREAM_CHUNK,
			choices: [
				{ index: 0, delta: { content: 'a' }, finish_reason: null },
				{ index: 1, delta: { content: 'b' }, finish_reason: null },
			],
		};
		expect(isStreamDone(ongoing)).toBe(false);
	});
});

// ─── parseSSEStream ───────────────────────────────────────────────────────────

function makeSSEStream(lines: string[]): ReadableStream<Uint8Array> {
	const encoder = new TextEncoder();
	return new ReadableStream({
		start(controller) {
			for (const line of lines) {
				controller.enqueue(encoder.encode(line + '\n'));
			}
			controller.close();
		},
	});
}

describe('parseSSEStream', () => {
	it('yields parsed chunks and stops at [DONE]', async () => {
		const body = makeSSEStream([
			`data: ${JSON.stringify(STREAM_CHUNK)}`,
			'data: [DONE]',
		]);
		const chunks: StreamChunk[] = [];
		for await (const chunk of parseSSEStream(body)) {
			chunks.push(chunk);
		}
		expect(chunks).toEqual([STREAM_CHUNK]);
	});

	it('skips malformed JSON lines', async () => {
		const body = makeSSEStream([
			`data: ${JSON.stringify(STREAM_CHUNK)}`,
			'data: {not valid json}',
			'data: [DONE]',
		]);
		const chunks: StreamChunk[] = [];
		for await (const chunk of parseSSEStream(body)) {
			chunks.push(chunk);
		}
		expect(chunks).toEqual([STREAM_CHUNK]);
	});

	it('skips non-data lines (comments, blanks)', async () => {
		const body = makeSSEStream([
			': keep-alive',
			'',
			`data: ${JSON.stringify(STREAM_CHUNK)}`,
			'data: [DONE]',
		]);
		const chunks: StreamChunk[] = [];
		for await (const chunk of parseSSEStream(body)) {
			chunks.push(chunk);
		}
		expect(chunks).toEqual([STREAM_CHUNK]);
	});

	it('yields multiple chunks before [DONE]', async () => {
		const body = makeSSEStream([
			`data: ${JSON.stringify(STREAM_CHUNK)}`,
			`data: ${JSON.stringify(STREAM_CHUNK)}`,
			'data: [DONE]',
		]);
		const chunks: StreamChunk[] = [];
		for await (const chunk of parseSSEStream(body)) {
			chunks.push(chunk);
		}
		expect(chunks).toHaveLength(2);
		expect(chunks[0]).toEqual(STREAM_CHUNK);
	});

	it('yields nothing for an empty stream', async () => {
		const body = makeSSEStream([]);
		const chunks: StreamChunk[] = [];
		for await (const chunk of parseSSEStream(body)) {
			chunks.push(chunk);
		}
		expect(chunks).toEqual([]);
	});
});
