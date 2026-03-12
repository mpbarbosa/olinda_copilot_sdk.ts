import { Logger, logger, LogLevel, stripAnsi } from '../../src/core/logger';

describe('Logger re-exports', () => {
	it('should export Logger class', () => {
		const log = new Logger();
		expect(log).toBeInstanceOf(Logger);
	});

	it('should accept prefix and verbose options', () => {
		const log = new Logger({ prefix: '[test]', verbose: true });
		expect(log).toBeInstanceOf(Logger);
	});

	it('should export default logger instance', () => {
		expect(logger).toBeInstanceOf(Logger);
	});

	it('should call info method', () => {
		const log = new Logger();
		const spy = jest.spyOn(log, 'info').mockImplementation(() => {});
		log.info('info message');
		expect(spy).toHaveBeenCalledWith('info message');
		spy.mockRestore();
	});

	it('should call debug method', () => {
		const log = new Logger();
		const spy = jest.spyOn(log, 'debug').mockImplementation(() => {});
		log.debug('debug message');
		expect(spy).toHaveBeenCalledWith('debug message');
		spy.mockRestore();
	});

	it('should call warn method', () => {
		const log = new Logger();
		const spy = jest.spyOn(log, 'warn').mockImplementation(() => {});
		log.warn('warn message');
		expect(spy).toHaveBeenCalledWith('warn message');
		spy.mockRestore();
	});

	it('should call error method', () => {
		const log = new Logger();
		const spy = jest.spyOn(log, 'error').mockImplementation(() => {});
		log.error('error message');
		expect(spy).toHaveBeenCalledWith('error message');
		spy.mockRestore();
	});

	it('should call success method', () => {
		const log = new Logger();
		const spy = jest.spyOn(log, 'success').mockImplementation(() => {});
		log.success('done');
		expect(spy).toHaveBeenCalledWith('done');
		spy.mockRestore();
	});

	it('should export LogLevel with uppercase keys and lowercase values', () => {
		expect(LogLevel).toBeDefined();
		expect(LogLevel.DEBUG).toBe('debug');
		expect(LogLevel.INFO).toBe('info');
		expect(LogLevel.WARN).toBe('warn');
		expect(LogLevel.ERROR).toBe('error');
		expect(LogLevel.SUCCESS).toBe('success');
	});

	it('should strip ANSI codes from string', () => {
		const ansiString = '\u001b[31mRed Text\u001b[0m';
		const stripped = stripAnsi(ansiString);
		expect(stripped).toBe('Red Text');
	});

	it('should handle empty string in stripAnsi', () => {
		expect(stripAnsi('')).toBe('');
	});

	it('should handle string without ANSI codes in stripAnsi', () => {
		expect(stripAnsi('plain text')).toBe('plain text');
	});
});
