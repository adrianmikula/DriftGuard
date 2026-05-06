"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleConfigSchema = exports.RuleEngine = void 0;
const zod_1 = require("zod");
class RuleEngine {
    rules = new Map();
    ruleConfigs;
    constructor(ruleConfigs) {
        this.ruleConfigs = ruleConfigs || {};
    }
    registerRule(rule) {
        this.rules.set(rule.id, rule);
    }
    unregisterRule(ruleId) {
        this.rules.delete(ruleId);
    }
    getRule(ruleId) {
        return this.rules.get(ruleId);
    }
    getAllRules() {
        return Array.from(this.rules.values());
    }
    async executeRule(ruleId, context) {
        const rule = this.rules.get(ruleId);
        if (!rule) {
            throw new Error(`Rule not found: ${ruleId}`);
        }
        return await rule.check(context);
    }
    async executeAllRules(context) {
        const results = [];
        for (const rule of this.rules.values()) {
            const config = this.ruleConfigs[rule.id];
            // Skip disabled rules
            if (config?.enabled === false) {
                continue;
            }
            const result = await rule.check(context);
            // Apply severity override if configured
            if (config && config.severity) {
                for (const violation of result.violations) {
                    violation.severity = config.severity;
                }
            }
            results.push(result);
        }
        return results;
    }
}
exports.RuleEngine = RuleEngine;
// Configuration schema for rules
exports.RuleConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean(),
    severity: zod_1.z.enum(['error', 'warning', 'info']),
    options: zod_1.z.record(zod_1.z.any()).optional(),
});
