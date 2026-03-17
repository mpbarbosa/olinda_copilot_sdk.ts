"use strict";
/**
 * Tests for src/lib/log_validator.ts
 *
 * Structure mirrors the referential transparency pattern:
 *   1. Pure function tests  — deterministic, no mocks needed.
 *   2. LogValidator tests   — file I/O and CopilotSdkWrapper are mocked.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const log_validator_1 = require("../../src/lib/log_validator");
// ---------------------------------------------------------------------------
// Mock: CopilotSdkWrapper (isolate SDK from unit tests)
// ---------------------------------------------------------------------------
const mockSend = jest.fn().mockResolvedValue({ content: 'Fix plan from model', success: true });
const mockInitialize = jest.fn().mockResolvedValue({ authenticated: true, availableModels: [] });
const mockCleanup = jest.fn().mockResolvedValue(undefined);
jest.mock('../../src/core/session_client', () => ({
    CopilotSdkWrapper: jest.fn().mockImplementation(() => ({
        initialize: mockInitialize,
        send: mockSend,
        cleanup: mockCleanup,
        get authenticated() { return true; },
    })),
}));
// Mock: fs/promises (isolate file system)
jest.mock('node:fs/promises', () => ({
    readdir: jest.fn(),
    readFile: jest.fn(),
}));
// Mock: logger (suppress output)
jest.mock('../../src/core/logger', () => ({
    logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
const promises_1 = require("node:fs/promises");
const mockReaddir = promises_1.readdir;
const mockReadFile = promises_1.readFile;
// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const SAMPLE_LOG = `
[2026-03-12T18:44:21.437Z] ⚠ Step 4 AI response quality low: AI response mentions only 3/14 files (21% < 30% threshold)
[2026-03-12T18:46:17.181Z] ⚠ npm install --dry-run failed — possible unresolvable lockfile entries
[2026-03-12T18:44:10.273Z] ⚠ [WARNING] Operation 'step_01' took 23.1s (memory: 45.22MB)
[2026-03-12T18:44:10.274Z] [ERROR] Unexpected token in config.yaml at line 12
plain line with no issue
`.trim();
const SAMPLE_ISSUES = [
    { timestamp: '2026-03-12T18:44:21.437Z', severity: 'ai_quality', message: 'AI response mentions only 3/14 files (21% < 30% threshold)', source: 'step_04.log' },
    { timestamp: '2026-03-12T18:46:17.181Z', severity: 'dependency', message: 'npm install --dry-run failed — possible unresolvable lockfile entries', source: 'step_04.log' },
    { timestamp: '2026-03-12T18:44:10.273Z', severity: 'warning', message: "Operation 'step_01' took 23.1s (memory: 45.22MB)", source: 'step_04.log' },
    { timestamp: '2026-03-12T18:44:10.274Z', severity: 'error', message: 'Unexpected token in config.yaml at line 12', source: 'step_04.log' },
];
const SAMPLE_SNIPPETS = [
    { path: 'src/lib/config.ts', content: 'export const config = {};' },
    { path: 'package.json', content: '{ "name": "test" }' },
];
// ===========================================================================
// 1. Pure function tests
// ===========================================================================
describe('parseLogIssues (pure)', () => {
    it('extracts ai_quality issues', () => {
        const line = '[2026-03-12T18:44:21.437Z] ⚠ Step 4 AI response quality low: only 3/14 files';
        const issues = (0, log_validator_1.parseLogIssues)(line, 'test.log');
        expect(issues).toHaveLength(1);
        expect(issues[0].severity).toBe('ai_quality');
        expect(issues[0].message).toBe('only 3/14 files');
        expect(issues[0].timestamp).toBe('2026-03-12T18:44:21.437Z');
        expect(issues[0].source).toBe('test.log');
    });
    it('extracts dependency issues', () => {
        const line = '[2026-03-12T18:46:17.181Z] ⚠ npm install --dry-run failed — lockfile issues';
        const issues = (0, log_validator_1.parseLogIssues)(line, 'workflow.log');
        expect(issues).toHaveLength(1);
        expect(issues[0].severity).toBe('dependency');
    });
    it('extracts [WARNING] issues', () => {
        const line = "[2026-03-12T18:44:10.273Z] ⚠ [WARNING] Operation 'step_01' took 23.1s";
        const issues = (0, log_validator_1.parseLogIssues)(line, 'w.log');
        expect(issues).toHaveLength(1);
        expect(issues[0].severity).toBe('warning');
        expect(issues[0].message).toContain("Operation 'step_01'");
    });
    it('extracts [ERROR] issues', () => {
        const line = '[2026-03-12T18:44:10.274Z] [ERROR] Unexpected token at line 12';
        const issues = (0, log_validator_1.parseLogIssues)(line, 'w.log');
        expect(issues).toHaveLength(1);
        expect(issues[0].severity).toBe('error');
        expect(issues[0].message).toBe('Unexpected token at line 12');
    });
    it('returns empty array for clean log lines', () => {
        expect((0, log_validator_1.parseLogIssues)('✓ Step completed in 100ms', 'w.log')).toHaveLength(0);
        expect((0, log_validator_1.parseLogIssues)('[2026-01-01T00:00:00.000Z] Starting workflow...', 'w.log')).toHaveLength(0);
        expect((0, log_validator_1.parseLogIssues)('', 'w.log')).toHaveLength(0);
    });
    it('parses null timestamp when not present', () => {
        const issues = (0, log_validator_1.parseLogIssues)('⚠ [WARNING] no timestamp here', 'w.log');
        expect(issues[0].timestamp).toBeNull();
    });
    it('parses only one issue per line (first matching pattern wins)', () => {
        // Line could match both [ERROR] and generic ⚠ — should produce exactly one issue
        const line = '[2026-01-01T00:00:00.000Z] [ERROR] Something went wrong';
        expect((0, log_validator_1.parseLogIssues)(line, 'w.log')).toHaveLength(1);
        expect((0, log_validator_1.parseLogIssues)(line, 'w.log')[0].severity).toBe('error');
    });
    it('is deterministic — same input always produces same output', () => {
        const a = (0, log_validator_1.parseLogIssues)(SAMPLE_LOG, 'step_04.log');
        const b = (0, log_validator_1.parseLogIssues)(SAMPLE_LOG, 'step_04.log');
        expect(a).toEqual(b);
    });
    it('uses default source when not provided', () => {
        const issues = (0, log_validator_1.parseLogIssues)('⚠ [WARNING] test');
        expect(issues[0].source).toBe('unknown');
    });
});
// ---------------------------------------------------------------------------
describe('buildValidationPrompt (pure)', () => {
    it('includes all issue messages in the prompt', () => {
        const prompt = (0, log_validator_1.buildValidationPrompt)(SAMPLE_ISSUES, []);
        for (const issue of SAMPLE_ISSUES) {
            expect(prompt).toContain(issue.message);
        }
    });
    it('includes severity labels in uppercase', () => {
        const prompt = (0, log_validator_1.buildValidationPrompt)(SAMPLE_ISSUES, []);
        expect(prompt).toContain('[AI_QUALITY]');
        expect(prompt).toContain('[DEPENDENCY]');
        expect(prompt).toContain('[WARNING]');
        expect(prompt).toContain('[ERROR]');
    });
    it('includes code snippet paths and content', () => {
        const prompt = (0, log_validator_1.buildValidationPrompt)([], SAMPLE_SNIPPETS);
        expect(prompt).toContain('src/lib/config.ts');
        expect(prompt).toContain('export const config = {};');
        expect(prompt).toContain('package.json');
    });
    it('shows fallback when no snippets provided', () => {
        const prompt = (0, log_validator_1.buildValidationPrompt)(SAMPLE_ISSUES, []);
        expect(prompt).toContain('_No source files sampled._');
    });
    it('shows fallback when no issues provided', () => {
        const prompt = (0, log_validator_1.buildValidationPrompt)([], []);
        expect(prompt).toContain('_No issues detected._');
    });
    it('includes task instructions', () => {
        const prompt = (0, log_validator_1.buildValidationPrompt)([], []);
        expect(prompt).toContain('root cause');
        expect(prompt).toContain('prioritised');
        expect(prompt).toContain('Critical / High / Medium / Low');
    });
    it('numbers issues sequentially', () => {
        const prompt = (0, log_validator_1.buildValidationPrompt)(SAMPLE_ISSUES, []);
        expect(prompt).toContain('1. [');
        expect(prompt).toContain('2. [');
        expect(prompt).toContain('3. [');
        expect(prompt).toContain('4. [');
    });
    it('is deterministic', () => {
        const a = (0, log_validator_1.buildValidationPrompt)(SAMPLE_ISSUES, SAMPLE_SNIPPETS);
        const b = (0, log_validator_1.buildValidationPrompt)(SAMPLE_ISSUES, SAMPLE_SNIPPETS);
        expect(a).toBe(b);
    });
});
// ---------------------------------------------------------------------------
describe('selectRelevantFiles (pure)', () => {
    const paths = [
        '/project/src/lib/step_04.ts',
        '/project/src/lib/config.ts',
        '/project/src/core/auth.ts',
        '/project/package.json',
    ];
    it('scores files matching issue keywords higher', () => {
        const issues = [
            { timestamp: null, severity: 'warning', message: 'step_04 failed', source: 'w.log' },
        ];
        const result = (0, log_validator_1.selectRelevantFiles)(paths, issues, 4);
        expect(result[0]).toContain('step_04');
    });
    it('respects maxFiles limit', () => {
        const issues = [
            { timestamp: null, severity: 'warning', message: 'some issue', source: 'w.log' },
        ];
        expect((0, log_validator_1.selectRelevantFiles)(paths, issues, 2)).toHaveLength(2);
    });
    it('returns empty array when allPaths is empty', () => {
        expect((0, log_validator_1.selectRelevantFiles)([], SAMPLE_ISSUES, 10)).toHaveLength(0);
    });
    it('returns up to maxFiles even with no keyword matches', () => {
        const result = (0, log_validator_1.selectRelevantFiles)(paths, [], 2);
        expect(result).toHaveLength(2);
    });
    it('is deterministic given same inputs', () => {
        const issues = [
            { timestamp: null, severity: 'error', message: 'config parse error', source: 'w.log' },
        ];
        expect((0, log_validator_1.selectRelevantFiles)(paths, issues, 3)).toEqual((0, log_validator_1.selectRelevantFiles)(paths, issues, 3));
    });
});
// ===========================================================================
// 2. LogValidator integration tests (mocked I/O + SDK)
// ===========================================================================
describe('LogValidator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default: single log file + single source file
        mockReaddir.mockImplementation((dir, _opts) => {
            if (String(dir).includes('logs')) {
                return Promise.resolve([
                    { name: 'workflow.log', isFile: () => true, isDirectory: () => false },
                ]);
            }
            return Promise.resolve([
                { name: 'config.ts', isFile: () => true, isDirectory: () => false },
            ]);
        });
        mockReadFile.mockImplementation((filePath) => {
            if (String(filePath).endsWith('.log')) {
                return Promise.resolve(SAMPLE_LOG);
            }
            return Promise.resolve('export const config = {};');
        });
    });
    it('returns the model response as a string', async () => {
        const validator = new log_validator_1.LogValidator({ model: 'claude-haiku-4.5' });
        const plan = await validator.validate('/logs', '/src');
        expect(plan).toBe('Fix plan from model');
    });
    it('calls CopilotSdkWrapper.initialize() before send()', async () => {
        const validator = new log_validator_1.LogValidator();
        await validator.validate('/logs', '/src');
        expect(mockInitialize).toHaveBeenCalledTimes(1);
        expect(mockSend).toHaveBeenCalledTimes(1);
    });
    it('always calls cleanup() even if send() throws', async () => {
        mockSend.mockRejectedValueOnce(new Error('SDK timeout'));
        const validator = new log_validator_1.LogValidator();
        await expect(validator.validate('/logs', '/src')).rejects.toThrow('SDK timeout');
        expect(mockCleanup).toHaveBeenCalledTimes(1);
    });
    it('throws when authentication fails', async () => {
        const { CopilotSdkWrapper: MockWrapper } = require('../../src/core/session_client');
        MockWrapper.mockImplementationOnce(() => ({
            initialize: jest.fn().mockResolvedValue({}),
            cleanup: mockCleanup,
            get authenticated() { return false; },
        }));
        const validator = new log_validator_1.LogValidator();
        await expect(validator.validate('/logs', '/src')).rejects.toThrow('authentication failed');
    });
    it('sends a non-empty prompt to the model', async () => {
        const validator = new log_validator_1.LogValidator();
        await validator.validate('/logs', '/src');
        const [promptArg] = mockSend.mock.calls[0];
        expect(typeof promptArg).toBe('string');
        expect(promptArg.length).toBeGreaterThan(50);
    });
    it('respects maxCodeFiles option', async () => {
        // Provide 5 source files; maxCodeFiles = 2 should limit snippets
        mockReaddir.mockImplementation((dir, _opts) => {
            if (String(dir).includes('logs')) {
                return Promise.resolve([
                    { name: 'workflow.log', isFile: () => true, isDirectory: () => false },
                ]);
            }
            return Promise.resolve(['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'].map((n) => ({
                name: n, isFile: () => true, isDirectory: () => false,
            })));
        });
        const validator = new log_validator_1.LogValidator({}, { maxCodeFiles: 2 });
        await validator.validate('/logs', '/src');
        const [prompt] = mockSend.mock.calls[0];
        // At most 2 snippet headers (### filename) should appear
        const headers = (prompt.match(/^### /gm) ?? []).length;
        expect(headers).toBeLessThanOrEqual(2);
    });
    it('truncates files exceeding maxCharsPerFile', async () => {
        const longContent = 'x'.repeat(5000);
        mockReadFile.mockImplementation((filePath) => {
            if (String(filePath).endsWith('.log'))
                return Promise.resolve('⚠ [WARNING] test issue');
            return Promise.resolve(longContent);
        });
        const validator = new log_validator_1.LogValidator({}, { maxCharsPerFile: 100 });
        await validator.validate('/logs', '/src');
        const [prompt] = mockSend.mock.calls[0];
        expect(prompt).toContain('… (truncated)');
    });
});
