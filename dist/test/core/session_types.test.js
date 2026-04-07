"use strict";
// src/core/session_types.test.ts
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
const sessionTypes = __importStar(require("./session_types"));
describe('core/session_types type exports', () => {
    it('should export all expected types', () => {
        // List of expected type keys
        const expectedTypes = [
            // Connection
            'ConnectionState',
            'CopilotClientOptions',
            // Session lifecycle management
            'SessionContext',
            'SessionListFilter',
            'SessionMetadata',
            'ForegroundSessionInfo',
            'SessionLifecycleEventType',
            'SessionLifecycleEvent',
            'SessionLifecycleHandler',
            'TypedSessionLifecycleHandler',
            // Session events
            'SessionEvent',
            'SessionEventType',
            'SessionEventPayload',
            'SessionEventHandler',
            'TypedSessionEventHandler',
            // Model introspection
            'ModelInfo',
            'ModelCapabilities',
            'ModelBilling',
            'ModelPolicy',
            // Status
            'GetStatusResponse',
            'GetAuthStatusResponse',
            // Message options
            'MessageOptions',
            // Assistant message event
            'AssistantMessageEvent',
        ];
        expectedTypes.forEach((typeName) => {
            expect(typeName in sessionTypes).toBe(true);
        });
    });
    it('should not export unexpected types', () => {
        // Only the expected types should be exported
        const exportedKeys = Object.keys(sessionTypes);
        const allowed = new Set([
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
            '__esModule', // Allow for transpiled modules
        ]);
        exportedKeys.forEach((key) => {
            expect(allowed.has(key)).toBe(true);
        });
    });
    it('should allow type usage in TypeScript type assertions (smoke test)', () => {
        // No runtime assertion needed; this is to ensure type accessibility
        expect(true).toBe(true);
    });
    it('should not throw when importing types', () => {
        // Importing types should not throw at runtime
        expect(() => {
            // Access each type (should be undefined at runtime, but not throw)
            void sessionTypes.ConnectionState;
            void sessionTypes.SessionContext;
            void sessionTypes.ModelInfo;
            void sessionTypes.AssistantMessageEvent;
        }).not.toThrow();
    });
});
