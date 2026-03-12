/**
 * Distribution-artifacts smoke test — asserts that the compiled output required
 * by consumers is present on disk.
 *
 * @module test/integration/dist_artifacts
 * @description When this package is installed from a GitHub archive tarball
 * (e.g. `npm install github:mpbarbosa/olinda_copilot_sdk.ts#v0.2.1`) npm does
 * **not** run lifecycle scripts, so the `dist/` tree must be committed and
 * present in the tarball.  This test fails loudly when a release tag is cut
 * without a prior build, catching the problem before consumers are affected.
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
};

describe('dist/ — distribution artifacts', () => {
	test.each(Object.entries(REQUIRED_ARTIFACTS))(
		'%s exists (%s)',
		(_label, relativePath) => {
			const full = join(ROOT, relativePath);
			expect(existsSync(full)).toBe(true);
		},
	);
});
