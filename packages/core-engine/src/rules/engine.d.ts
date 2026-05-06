import { z } from 'zod';
export interface RuleViolation {
    ruleId: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    location: {
        file: string;
        line?: number;
        column?: number;
    };
    metadata?: Record<string, any>;
}
export interface RuleResult {
    passed: boolean;
    violations: RuleViolation[];
}
export interface Rule {
    id: string;
    name: string;
    description: string;
    check: (context: any) => Promise<RuleResult>;
}
export declare class RuleEngine {
    private rules;
    private ruleConfigs;
    constructor(ruleConfigs?: Record<string, {
        enabled?: boolean;
        severity?: 'error' | 'warning' | 'info';
    }>);
    registerRule(rule: Rule): void;
    unregisterRule(ruleId: string): void;
    getRule(ruleId: string): Rule | undefined;
    getAllRules(): Rule[];
    executeRule(ruleId: string, context: any): Promise<RuleResult>;
    executeAllRules(context: any): Promise<RuleResult[]>;
}
export declare const RuleConfigSchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    severity: z.ZodEnum<["error", "warning", "info"]>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    severity: "error" | "warning" | "info";
    options?: Record<string, any> | undefined;
}, {
    enabled: boolean;
    severity: "error" | "warning" | "info";
    options?: Record<string, any> | undefined;
}>;
export type RuleConfig = z.infer<typeof RuleConfigSchema>;
