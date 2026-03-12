import { Logger, logger, LogLevel, stripAnsi } from '../../src/core/logger';

describe('Logger re-exports', () => {
	it('should export Logger class', () => {
		const log = new Logger({ level: 'info' });
		expect(log).toBeInstanceOf(Logger);
	});

	it('should export default logger instance', () => {
		expect(logger).toBeInstanceOf(Logger);
	});

	it('should log messages at different levels', () => {
		const log = new Logger({ level: 'debug' });
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
		const log = new Logger({ level: 'info' });
		expect(() => log.log('invalid' as any, 'test')).not.toThrow();
	});

	it('should export LogLevel enum', () => {
		expect(LogLevel).toBeDefined();
		expect(Object.keys(LogLevel)).toContain('debug');
		expect(Object.keys(LogLevel)).toContain('info');
		expect(Object.keys(LogLevel)).toContain('warn');
		expect(Object.keys(LogLevel)).toContain('error');
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
