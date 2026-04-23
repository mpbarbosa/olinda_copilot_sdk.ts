/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['<rootDir>/test/**/*.test.ts', '<rootDir>/test/**/*.benchmark.ts'],
	moduleNameMapper: {
		'^@github/copilot-sdk$': '<rootDir>/test/__stubs__/copilot-sdk.cjs',
		'^@anthropic-ai/claude-agent-sdk$': '<rootDir>/test/__stubs__/claude-agent-sdk.cjs',
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
