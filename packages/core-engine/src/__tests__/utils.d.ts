import { z } from 'zod';
import type { GraphClientConfig } from '../graph/client';
import type { RuleResult } from '../rules/engine';
export declare function createGraphClientConfig(overrides?: Partial<GraphClientConfig>): GraphClientConfig;
export declare function createRuleViolation(overrides?: Partial<z.infer<typeof RuleViolationSchema>>): z.infer<typeof RuleViolationSchema>;
export declare function createRuleResult(overrides?: Partial<RuleResult>): RuleResult;
export declare function createMockRecord(data: Record<string, any>): {
    keys: string[];
    get: (key: string) => any;
    toJSON: () => Record<string, any>;
};
export declare function createMockResult(records: Record<string, any>[]): {
    records: {
        keys: string[];
        get: (key: string) => any;
        toJSON: () => Record<string, any>;
    }[];
    sum: () => number;
    consume: () => {
        stats: {
            counters: {};
        };
    };
};
export declare const RuleViolationSchema: z.ZodObject<{
    ruleId: z.ZodString;
    severity: z.ZodEnum<["error", "warning", "info"]>;
    message: z.ZodString;
    location: z.ZodObject<{
        file: z.ZodString;
        line: z.ZodOptional<z.ZodNumber>;
        column: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        file: string;
        line?: number | undefined;
        column?: number | undefined;
    }, {
        file: string;
        line?: number | undefined;
        column?: number | undefined;
    }>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    severity: "error" | "warning" | "info";
    message: string;
    ruleId: string;
    location: {
        file: string;
        line?: number | undefined;
        column?: number | undefined;
    };
    metadata?: Record<string, any> | undefined;
}, {
    severity: "error" | "warning" | "info";
    message: string;
    ruleId: string;
    location: {
        file: string;
        line?: number | undefined;
        column?: number | undefined;
    };
    metadata?: Record<string, any> | undefined;
}>;
