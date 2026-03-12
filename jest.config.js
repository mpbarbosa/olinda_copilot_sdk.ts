/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['<rootDir>/test/**/*.test.ts', '<rootDir>/test/**/*.benchmark.ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	randomize: true,
	cacheDirectory: '.jest-cache',
	maxWorkers: '50%',
	collectCoverageFrom: ['src/**/*.ts'],
	coverageThreshold: {
		global: { lines: 80, branches: 75, functions: 80, statements: 80 },
	},
	coverageReporters: ['text', 'lcov'],
};
