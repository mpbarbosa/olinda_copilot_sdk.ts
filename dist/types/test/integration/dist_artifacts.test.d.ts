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
export {};
