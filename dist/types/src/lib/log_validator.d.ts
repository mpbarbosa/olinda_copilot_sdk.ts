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
import { type CopilotSdkWrapperOptions } from '../core/session_client.js';
/** Severity level of a parsed log issue. */
export type IssueSeverity = 'error' | 'warning' | 'ai_quality' | 'dependency' | 'performance';
/** A single actionable issue extracted from a log file. */
export interface LogIssue {
    /** ISO timestamp from the log line, if present. */
    timestamp: string | null;
    /** Severity classification. */
    severity: IssueSeverity;
    /** Human-readable issue description. */
    message: string;
    /** Log file the issue was found in (relative path). */
    source: string;
}
/** A code snippet sampled from the codebase for context. */
export interface CodeSnippet {
    /** Path of the file relative to the codebase root. */
    path: string;
    /** File content (may be truncated for large files). */
    content: string;
}
/** Options for the {@link LogValidator} class. */
export interface LogValidatorOptions {
    /**
     * Maximum number of source files to sample as code context.
     * Defaults to `10`.
     */
    maxCodeFiles?: number;
    /**
     * Maximum number of characters to read from each source file.
     * Defaults to `3000`.
     */
    maxCharsPerFile?: number;
    /**
     * File extensions considered as source files when sampling the codebase.
     * Defaults to `['.ts', '.js', '.mjs', '.cjs', '.json', '.yaml', '.yml']`.
     */
    sourceExtensions?: string[];
    /**
     * Directory names to skip when walking the codebase.
     * Defaults to `['node_modules', 'dist', 'coverage', '.git', '.ai_workflow']`.
     */
    excludeDirs?: string[];
}
/**
 * Parse all actionable issues from a single log file's text content.
 *
 * @param logContent - Raw text of the log file.
 * @param source     - Logical name / relative path for the log (used in output).
 * @returns Ordered list of {@link LogIssue} objects found in the content.
 * @pure
 */
export declare function parseLogIssues(logContent: string, source?: string): LogIssue[];
/**
 * Build a compact, structured prompt from parsed issues and code snippets.
 *
 * @param issues       - Extracted log issues.
 * @param codeSnippets - Relevant source file snippets.
 * @returns A prompt string ready to send to the model.
 * @pure
 */
export declare function buildValidationPrompt(issues: LogIssue[], codeSnippets: CodeSnippet[]): string;
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
export declare function selectRelevantFiles(allPaths: string[], issues: LogIssue[], maxFiles: number): string[];
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
export declare class LogValidator {
    private readonly _wrapperOptions;
    private readonly _maxCodeFiles;
    private readonly _maxCharsPerFile;
    private readonly _sourceExtensions;
    private readonly _excludeDirs;
    /**
     * @param wrapperOptions   - Forwarded to {@link CopilotSdkWrapper} (model, timeout, etc.).
     * @param validatorOptions - Tuning knobs for file sampling.
     */
    constructor(wrapperOptions?: CopilotSdkWrapperOptions, validatorOptions?: LogValidatorOptions);
    /**
     * Run the full validation pipeline:
     *   read logs → parse issues → sample code → build prompt → call SDK → return plan.
     *
     * @param logDir      - Directory containing `*.log` files (searched recursively).
     * @param codebaseDir - Root of the source tree to sample for context.
     * @returns The model's fix plan as a plain string.
     * @throws If the SDK is unavailable or authentication fails.
     */
    validate(logDir: string, codebaseDir: string): Promise<string>;
    private _findLogFiles;
    private _readAllIssues;
    private _findSourceFiles;
    private _sampleCodebase;
}
