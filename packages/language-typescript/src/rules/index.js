"use strict";
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircularDependencyRule = exports.BoundaryViolationRule = void 0;
var boundary_violation_rule_1 = require("./boundary-violation-rule");
Object.defineProperty(exports, "BoundaryViolationRule", { enumerable: true, get: function () { return boundary_violation_rule_1.BoundaryViolationRule; } });
var circular_dependency_rule_1 = require("./circular-dependency-rule");
Object.defineProperty(exports, "CircularDependencyRule", { enumerable: true, get: function () { return circular_dependency_rule_1.CircularDependencyRule; } });
__exportStar(require("./types"), exports);
