/**
 * Distribution-artifacts smoke test — asserts that the compiled output required
 * by consumers is present on disk.
 *
 * @module test/integration/dist_artifacts
 * @description This package must be installed via the `github:` npm shorthand
 * (e.g. `npm install github:mpbarbosa/olinda_copilot_sdk.ts#v0.3.2`).
 * When npm resolves a git dependency it clones the repository, installs all
 * dependencies (including devDependencies), and runs the `prepare` lifecycle
 * script — which compiles the full TypeScript source into `dist/`.
 *
 * **Do NOT install from a raw CDN tarball** (e.g. the GitHub archive URL).
 * Tarball installs bypass `prepare` entirely; the `dist/` snapshot committed at
 * the v0.3.2 tag is incomplete (missing `tools.js` and `sendStream`), so the
 * resulting package will be broken.
 *
 * This test fails loudly when a release tag is cut without a prior build,
 * catching the problem before consumers are affected.
 * @since 0.2.2
 */

import { existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');

const REQUIRED_ARTIFACTS: Record<string, string> = {
	'CJS entry point':        'dist/src/index.js',
	'ESM entry point':        'dist/esm/index.js',
	'ESM package marker':     'dist/esm/package.json',
	'Type declarations':      'dist/types/src/index.d.ts',
	// v0.3.2 — tools.js was absent from the committed dist at the tag; the
	// github: install method rebuilds via prepare so it must be present.
	'tools module (v0.3.2)':  'dist/src/core/tools.js',
};

describe('dist/ — distribution artifacts', () => {
	test.each(Object.entries(REQUIRED_ARTIFACTS))(
		'%s exists (%s)',
		(_label, relativePath) => {
			const full = join(ROOT, relativePath);
			expect(existsSync(full)).toBe(true);
		},
	);

	// v0.3.2 regression: sendStream was missing from the committed dist snapshot
	// at the tag because it was added after the tag's dist/ was frozen.
	// The github: install triggers prepare which recompiles from source,
	// making sendStream available. This test catches any future regression.
	it('session_client.js defines sendStream (v0.3.2 regression)', () => {
		const sessionClientPath = join(ROOT, 'dist/src/core/session_client.js');
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const mod = require(sessionClientPath) as Record<string, unknown>;
		const WrapperClass = mod['CopilotSdkWrapper'] as (new (...args: unknown[]) => Record<string, unknown>) | undefined;
		expect(typeof WrapperClass).toBe('function');
		expect(typeof WrapperClass!.prototype['sendStream']).toBe('function');
	});
});
