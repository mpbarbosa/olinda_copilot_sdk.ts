type SdkCompatModule = typeof import('../../../src/claude/internal/sdk_compat.js');
/**
 * Load a fresh sdk_compat module instance backed by a controlled SDK stub.
 * Uses jest.doMock + jest.resetModules to bypass the module-level import cache
 * in sdk_compat.ts, ensuring each test starts with sdkCompatCache = undefined.
 */
declare function loadFreshModule(sdkStub: Record<string, unknown>): SdkCompatModule;
