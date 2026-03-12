"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../src/core/logger");
describe('Logger re-exports', () => {
    it('should export Logger class', () => {
        const log = new logger_1.Logger();
        expect(log).toBeInstanceOf(logger_1.Logger);
    });
    it('should accept prefix and verbose options', () => {
        const log = new logger_1.Logger({ prefix: '[test]', verbose: true });
        expect(log).toBeInstanceOf(logger_1.Logger);
    });
    it('should export default logger instance', () => {
        expect(logger_1.logger).toBeInstanceOf(logger_1.Logger);
    });
    it('should call info method', () => {
        const log = new logger_1.Logger();
        const spy = jest.spyOn(log, 'info').mockImplementation(() => { });
        log.info('info message');
        expect(spy).toHaveBeenCalledWith('info message');
        spy.mockRestore();
    });
    it('should call debug method', () => {
        const log = new logger_1.Logger();
        const spy = jest.spyOn(log, 'debug').mockImplementation(() => { });
        log.debug('debug message');
        expect(spy).toHaveBeenCalledWith('debug message');
        spy.mockRestore();
    });
    it('should call warn method', () => {
        const log = new logger_1.Logger();
        const spy = jest.spyOn(log, 'warn').mockImplementation(() => { });
        log.warn('warn message');
        expect(spy).toHaveBeenCalledWith('warn message');
        spy.mockRestore();
    });
    it('should call error method', () => {
        const log = new logger_1.Logger();
        const spy = jest.spyOn(log, 'error').mockImplementation(() => { });
        log.error('error message');
        expect(spy).toHaveBeenCalledWith('error message');
        spy.mockRestore();
    });
    it('should call success method', () => {
        const log = new logger_1.Logger();
        const spy = jest.spyOn(log, 'success').mockImplementation(() => { });
        log.success('done');
        expect(spy).toHaveBeenCalledWith('done');
        spy.mockRestore();
    });
    it('should export LogLevel with uppercase keys and lowercase values', () => {
        expect(logger_1.LogLevel).toBeDefined();
        expect(logger_1.LogLevel.DEBUG).toBe('debug');
        expect(logger_1.LogLevel.INFO).toBe('info');
        expect(logger_1.LogLevel.WARN).toBe('warn');
        expect(logger_1.LogLevel.ERROR).toBe('error');
        expect(logger_1.LogLevel.SUCCESS).toBe('success');
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
