"use strict";
/**
 * Logger re-export
 * @module core/logger
 * @description Re-exports the Logger class and default logger instance from
 * olinda_utils.js (installed from GitHub: mpbarbosa/olinda_utils.js#v0.3.16).
 * @since 0.1.3
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripAnsi = exports.LogLevel = exports.logger = exports.Logger = void 0;
var olinda_utils_js_1 = require("olinda_utils.js");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return olinda_utils_js_1.Logger; } });
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return olinda_utils_js_1.logger; } });
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return olinda_utils_js_1.LogLevel; } });
Object.defineProperty(exports, "stripAnsi", { enumerable: true, get: function () { return olinda_utils_js_1.stripAnsi; } });
