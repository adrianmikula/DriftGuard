"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigSchema = exports.EngineConfigSchema = exports.DatabaseConfigSchema = exports.RuleConfigZodSchema = exports.FileDiscoveryConfigSchema = exports.AnalyzerConfigSchema = exports.LayerRuleSchema = void 0;
const zod_1 = require("zod");
exports.LayerRuleSchema = zod_1.z.object({
    name: zod_1.z.string(),
    pattern: zod_1.z.string(),
    canImport: zod_1.z.array(zod_1.z.string()).default([]),
    cannotImport: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.AnalyzerConfigSchema = zod_1.z.object({
    fileExtensions: zod_1.z.array(zod_1.z.string()).default(['ts', 'tsx']),
});
exports.FileDiscoveryConfigSchema = zod_1.z.object({
    includePatterns: zod_1.z.array(zod_1.z.string()).default(['**/*.{ts,tsx}']),
    excludePatterns: zod_1.z.array(zod_1.z.string()).default(['**/node_modules/**', '**/dist/**']),
});
exports.RuleConfigZodSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(true),
    severity: zod_1.z.enum(['error', 'warning', 'info']).default('error'),
});
exports.DatabaseConfigSchema = zod_1.z.object({
    uri: zod_1.z.string().default('bolt://localhost:7687'),
});
exports.EngineConfigSchema = zod_1.z.object({
    url: zod_1.z.string().default('http://localhost:3000'),
    timeoutMs: zod_1.z.number().optional(),
});
exports.ConfigSchema = zod_1.z.object({
    layers: zod_1.z.array(exports.LayerRuleSchema),
    analyzer: exports.AnalyzerConfigSchema,
    fileDiscovery: exports.FileDiscoveryConfigSchema,
    rules: zod_1.z.record(exports.RuleConfigZodSchema),
    database: exports.DatabaseConfigSchema,
    engine: exports.EngineConfigSchema,
});
