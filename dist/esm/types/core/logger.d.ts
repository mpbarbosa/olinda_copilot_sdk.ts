/**
 * Logger re-export
 * @module core/logger
 * @description Re-exports the Logger class and default logger instance from
 * olinda_utils.js (installed from GitHub: mpbarbosa/olinda_utils.js#v0.3.25).
 * @since 0.1.3
 */
export { Logger, logger, LogLevel, stripAnsi } from 'olinda_utils.js';
export type { LoggerOptions, LogLevelValue } from 'olinda_utils.js';
