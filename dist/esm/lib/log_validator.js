/**
 * Log Validator
 *
 * Token-efficient solution for validating AI workflow log files against a
 * codebase using the Copilot SDK. Instead of forwarding raw file paths to the
 * model (which cannot access the local filesystem), this module:
 *
 *   1. Reads log files from disk (local I/O — free, no tokens consumed).
 *   2. Extracts only the actionable issues via regex (pure, deterministic).
 *   3. Samples the source files most likely related to those issues.
 *   4. Sends a compact, structured prompt to the model via CopilotSdkWrapper.
 *   5. Returns the model's fix plan as a plain string.
 *
 * Architecture: referential transparency pattern (v2.0.0-style).
 *   - Pure functions handle all parsing and prompt construction.
 *   - LogValidator class owns all I/O and SDK lifecycle concerns.
 *
 * @module lib/log_validator
 * @since 0.3.3
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
import { CopilotSdkWrapper } from '../core/session_client.js';
import { logger } from '../core/logger.js';
const ISSUE_PATTERNS = [
    { severity: 'error', re: /\[ERROR\]\s+(.+)/i },
    { severity: 'error', re: /✗\s+(.+)/ },
    { severity: 'ai_quality', re: /⚠\s+Step \d+ AI response quality low:\s*(.+)/ },
    { severity: 'dependency', re: /⚠\s+(npm .+?failed[^\n]*)/ },
    { severity: 'warning', re: /⚠\s+\[WARNING\]\s+(.+)/ },
    { severity: 'warning', re: /⚠\s+(?!\[WARNING\])(.+)/ },
];
const TIMESTAMP_RE = /^\[(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\]/;
// ---------------------------------------------------------------------------
// Pure functions — no side effects, deterministic output
// ---------------------------------------------------------------------------
/**
 * Parse all actionable issues from a single log file's text content.
 *
 * @param logContent - Raw text of the log file.
 * @param source     - Logical name / relative path for the log (used in output).
 * @returns Ordered list of {@link LogIssue} objects found in the content.
 * @pure
 */
export function parseLogIssues(logContent, source = 'unknown') {
    const issues = [];
    for (const line of logContent.split('\n')) {
        const tsMatch = line.match(TIMESTAMP_RE);
        const timestamp = tsMatch ? tsMatch[1] : null;
        for (const { severity, re } of ISSUE_PATTERNS) {
            const m = line.match(re);
            if (m) {
                issues.push({ timestamp, severity, message: m[1].trim(), source });
                break; // only first matching pattern per line
            }
        }
    }
    return issues;
}
/**
 * Build a compact, structured prompt from parsed issues and code snippets.
 *
 * @param issues       - Extracted log issues.
 * @param codeSnippets - Relevant source file snippets.
 * @returns A prompt string ready to send to the model.
 * @pure
 */
export function buildValidationPrompt(issues, codeSnippets) {
    const issueLines = issues
        .map((i, idx) => `${idx + 1}. [${i.severity.toUpperCase()}] ${i.message}` +
        (i.timestamp ? ` (at ${i.timestamp})` : '') +
        ` [source: ${i.source}]`)
        .join('\n');
    const codeSection = codeSnippets.length > 0
        ? codeSnippets
            .map((s) => `### ${s.path}\n\`\`\`\n${s.content}\n\`\`\``)
            .join('\n\n')
        : '_No source files sampled._';
    return [
        'You are a senior software engineer reviewing an AI workflow execution.',
        '',
        '## Issues Found in Logs',
        '',
        issueLines || '_No issues detected._',
        '',
        '## Relevant Source Files',
        '',
        codeSection,
        '',
        '## Task',
        '',
        'Analyse the issues above in the context of the source files provided.',
        'Then produce a prioritised, actionable fix plan. For each issue:',
        '  1. Explain the root cause.',
        '  2. Provide a concrete fix (code change, config update, or command).',
        '  3. Indicate priority: Critical / High / Medium / Low.',
        '',
        'Return the plan as a numbered list grouped by priority.',
    ].join('\n');
}
/**
 * Filter a flat list of file paths to the most likely relevant subset.
 *
 * Relevance is determined by matching the base file name or step name against
 * the issue messages. Falls back to a size-limited sample of all files when
 * no specific matches are found.
 *
 * @param allPaths - All candidate file paths.
 * @param issues   - Parsed issues used to infer relevance.
 * @param maxFiles - Maximum number of files to return.
 * @returns Subset of `allPaths` most relevant to the issues.
 * @pure
 */
export function selectRelevantFiles(allPaths, issues, maxFiles) {
    const keywords = new Set();
    for (const issue of issues) {
        const matches = issue.message.matchAll(/step_\w+|[\w]{4,}/g);
        for (const m of matches)
            keywords.add(m[0].toLowerCase());
    }
    const scored = allPaths.map((p) => {
        const lower = p.toLowerCase();
        let score = 0;
        for (const kw of keywords) {
            if (lower.includes(kw))
                score++;
        }
        return { p, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxFiles).map((s) => s.p);
}
// ---------------------------------------------------------------------------
// LogValidator — impure wrapper (file I/O + SDK lifecycle)
// ---------------------------------------------------------------------------
const DEFAULT_SOURCE_EXTENSIONS = ['.ts', '.js', '.mjs', '.cjs', '.json', '.yaml', '.yml'];
const DEFAULT_EXCLUDE_DIRS = ['node_modules', 'dist', 'coverage', '.git', '.ai_workflow'];
const DEFAULT_MAX_CODE_FILES = 10;
const DEFAULT_MAX_CHARS_PER_FILE = 3000;
/**
 * Validates AI workflow log files against a codebase using the Copilot SDK.
 *
 * Follows the referential transparency pattern: file I/O and SDK calls are
 * isolated in this class; all parsing and prompt logic stays in pure functions.
 *
 * @since 0.3.3
 * @example
 * const validator = new LogValidator({ model: 'claude-haiku-4.5' });
 * const plan = await validator.validate(
 *   '/path/to/.ai_workflow/logs',
 *   '/path/to/project/src',
 * );
 * console.log(plan);
 */
export class LogValidator {
    /**
     * @param wrapperOptions   - Forwarded to {@link CopilotSdkWrapper} (model, timeout, etc.).
     * @param validatorOptions - Tuning knobs for file sampling.
     */
    constructor(wrapperOptions = {}, validatorOptions = {}) {
        this._wrapperOptions = wrapperOptions;
        this._maxCodeFiles = validatorOptions.maxCodeFiles ?? DEFAULT_MAX_CODE_FILES;
        this._maxCharsPerFile = validatorOptions.maxCharsPerFile ?? DEFAULT_MAX_CHARS_PER_FILE;
        this._sourceExtensions = validatorOptions.sourceExtensions ?? DEFAULT_SOURCE_EXTENSIONS;
        this._excludeDirs = validatorOptions.excludeDirs ?? DEFAULT_EXCLUDE_DIRS;
    }
    /**
     * Run the full validation pipeline:
     *   read logs → parse issues → sample code → build prompt → call SDK → return plan.
     *
     * @param logDir      - Directory containing `*.log` files (searched recursively).
     * @param codebaseDir - Root of the source tree to sample for context.
     * @returns The model's fix plan as a plain string.
     * @throws If the SDK is unavailable or authentication fails.
     */
    async validate(logDir, codebaseDir) {
        const issues = await this._readAllIssues(logDir);
        logger.info(`[LogValidator] Parsed ${issues.length} issue(s) from logs in ${logDir}`);
        const snippets = await this._sampleCodebase(codebaseDir, issues);
        logger.info(`[LogValidator] Sampled ${snippets.length} source file(s) from ${codebaseDir}`);
        const prompt = buildValidationPrompt(issues, snippets);
        logger.debug(`[LogValidator] Prompt length: ${prompt.length} chars`);
        const wrapper = new CopilotSdkWrapper(this._wrapperOptions);
        try {
            await wrapper.initialize();
            if (!wrapper.authenticated) {
                throw new Error('Copilot SDK authentication failed. Check your GitHub token.');
            }
            const result = await wrapper.send(prompt);
            return result.content;
        }
        finally {
            await wrapper.cleanup();
        }
    }
    // --------------------------------------------------------------------------
    // Private I/O helpers
    // --------------------------------------------------------------------------
    async _findLogFiles(dir) {
        const found = [];
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const full = join(dir, entry.name);
            if (entry.isDirectory()) {
                found.push(...(await this._findLogFiles(full)));
            }
            else if (entry.isFile() && entry.name.endsWith('.log')) {
                found.push(full);
            }
        }
        return found;
    }
    async _readAllIssues(logDir) {
        const logFiles = await this._findLogFiles(logDir);
        logger.debug(`[LogValidator] Found ${logFiles.length} log file(s)`);
        const allIssues = [];
        for (const filePath of logFiles) {
            const content = await readFile(filePath, 'utf8');
            const source = relative(logDir, filePath);
            allIssues.push(...parseLogIssues(content, source));
        }
        return allIssues;
    }
    async _findSourceFiles(dir) {
        const found = [];
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (this._excludeDirs.includes(entry.name))
                continue;
            const full = join(dir, entry.name);
            if (entry.isDirectory()) {
                found.push(...(await this._findSourceFiles(full)));
            }
            else if (entry.isFile() &&
                this._sourceExtensions.includes(extname(entry.name))) {
                found.push(full);
            }
        }
        return found;
    }
    async _sampleCodebase(codebaseDir, issues) {
        const allPaths = await this._findSourceFiles(codebaseDir);
        const selected = selectRelevantFiles(allPaths, issues, this._maxCodeFiles);
        const snippets = [];
        for (const filePath of selected) {
            const raw = await readFile(filePath, 'utf8');
            const content = raw.length > this._maxCharsPerFile
                ? raw.slice(0, this._maxCharsPerFile) + '\n… (truncated)'
                : raw;
            snippets.push({ path: relative(codebaseDir, filePath), content });
        }
        return snippets;
    }
}
