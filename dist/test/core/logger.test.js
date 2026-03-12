"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../src/core/logger");
describe('Logger re-exports', () => {
    it('should export Logger class', () => {
        const log = new logger_1.Logger({ level: 'info' });
        expect(log).toBeInstanceOf(logger_1.Logger);
    });
    it('should export default logger instance', () => {
        expect(logger_1.logger).toBeInstanceOf(logger_1.Logger);
    });
    it('should log messages at different levels', () => {
        const log = new logger_1.Logger({ level: 'debug' });
        const spy = jest.spyOn(log, 'log');
        log.debug('debug message');
        log.info('info message');
        log.warn('warn message');
        log.error('error message');
        expect(spy).toHaveBeenCalledWith('debug', 'debug message');
        expect(spy).toHaveBeenCalledWith('info', 'info message');
        expect(spy).toHaveBeenCalledWith('warn', 'warn message');
        expect(spy).toHaveBeenCalledWith('error', 'error message');
        spy.mockRestore();
    });
    it('should handle invalid log level gracefully', () => {
        const log = new logger_1.Logger({ level: 'info' });
        expect(() => log.log('invalid', 'test')).not.toThrow();
    });
    it('should export LogLevel enum', () => {
        expect(logger_1.LogLevel).toBeDefined();
        expect(Object.keys(logger_1.LogLevel)).toContain('debug');
        expect(Object.keys(logger_1.LogLevel)).toContain('info');
        expect(Object.keys(logger_1.LogLevel)).toContain('warn');
        expect(Object.keys(logger_1.LogLevel)).toContain('error');
    });
    it('should strip ANSI codes from string', () => {
        const ansiString = '\u001b[31mRed Text\u001b[0m';
        const stripped = (0, logger_1.stripAnsi)(ansiString);
        expect(stripped).toBe('Red Text');
    });
    it('should handle empty string in stripAnsi', () => {
        expect((0, logger_1.stripAnsi)('')).toBe('');
    });
    it('should handle string without ANSI codes in stripAnsi', () => {
        expect((0, logger_1.stripAnsi)('plain text')).toBe('plain text');
    });
});
