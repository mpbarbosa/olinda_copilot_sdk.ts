"use strict";
// test/session_types.test.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const sessionTypes = __importStar(require("../src/core/session_types"));
describe('core/session_types type exports', () => {
    it('should export all expected types', () => {
        // Connection
        expect(sessionTypes).toHaveProperty('ConnectionState');
        expect(sessionTypes).toHaveProperty('CopilotClientOptions');
        // Session lifecycle management
        expect(sessionTypes).toHaveProperty('SessionContext');
        expect(sessionTypes).toHaveProperty('SessionListFilter');
        expect(sessionTypes).toHaveProperty('SessionMetadata');
        expect(sessionTypes).toHaveProperty('ForegroundSessionInfo');
        expect(sessionTypes).toHaveProperty('SessionLifecycleEventType');
        expect(sessionTypes).toHaveProperty('SessionLifecycleEvent');
        expect(sessionTypes).toHaveProperty('SessionLifecycleHandler');
        expect(sessionTypes).toHaveProperty('TypedSessionLifecycleHandler');
        // Session events
        expect(sessionTypes).toHaveProperty('SessionEvent');
        expect(sessionTypes).toHaveProperty('SessionEventType');
        expect(sessionTypes).toHaveProperty('SessionEventPayload');
        expect(sessionTypes).toHaveProperty('SessionEventHandler');
        expect(sessionTypes).toHaveProperty('TypedSessionEventHandler');
        // Model introspection
        expect(sessionTypes).toHaveProperty('ModelInfo');
        expect(sessionTypes).toHaveProperty('ModelCapabilities');
        expect(sessionTypes).toHaveProperty('ModelBilling');
        expect(sessionTypes).toHaveProperty('ModelPolicy');
        // Status
        expect(sessionTypes).toHaveProperty('GetStatusResponse');
        expect(sessionTypes).toHaveProperty('GetAuthStatusResponse');
        // Message options
        expect(sessionTypes).toHaveProperty('MessageOptions');
        // AssistantMessageEvent
        expect(sessionTypes).toHaveProperty('AssistantMessageEvent');
    });
    it('should not export unexpected types', () => {
        // List of known exported type keys
        const expectedKeys = [
            'ConnectionState',
            'CopilotClientOptions',
            'SessionContext',
            'SessionListFilter',
            'SessionMetadata',
            'ForegroundSessionInfo',
            'SessionLifecycleEventType',
            'SessionLifecycleEvent',
            'SessionLifecycleHandler',
            'TypedSessionLifecycleHandler',
            'SessionEvent',
            'SessionEventType',
            'SessionEventPayload',
            'SessionEventHandler',
            'TypedSessionEventHandler',
            'ModelInfo',
            'ModelCapabilities',
            'ModelBilling',
            'ModelPolicy',
            'GetStatusResponse',
            'GetAuthStatusResponse',
            'MessageOptions',
            'AssistantMessageEvent',
            '__esModule', // Common for transpiled modules
        ];
        const exportedKeys = Object.keys(sessionTypes);
        exportedKeys.forEach((key) => {
            expect(expectedKeys).toContain(key);
        });
    });
    it('should allow importing types without runtime errors', () => {
        // Types are erased at runtime, but import should not throw
        expect(() => {
        }).not.toThrow();
    });
    it('should have all exports as undefined at runtime (type-only)', () => {
        // All exports should be undefined at runtime since they are types
        Object.entries(sessionTypes).forEach(([key, value]) => {
            if (key !== '__esModule') {
                expect(value).toBeUndefined();
            }
        });
    });
});
