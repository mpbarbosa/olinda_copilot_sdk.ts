/**
 * CJS integration smoke test — imports from compiled dist/src/index.js
 * @module test/integration/cjs
 * @description Verifies that the CJS build is consumable via require() and
 * that representative functions from each domain behave correctly.
 * @since 0.1.3
 */
declare const lib: typeof import("../../src/index");
