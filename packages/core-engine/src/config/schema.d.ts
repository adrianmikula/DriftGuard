import { z } from 'zod';
export interface LayerRule {
    name: string;
    pattern: string;
    canImport: string[];
    cannotImport: string[];
}
export interface AnalyzerConfig {
    fileExtensions: string[];
}
export interface FileDiscoveryConfig {
    includePatterns: string[];
    excludePatterns: string[];
}
export interface RuleSettings {
    enabled: boolean;
    severity: 'error' | 'warning' | 'info';
}
export interface DatabaseConfig {
    uri: string;
}
export interface EngineConfig {
    url: string;
    timeoutMs?: number;
}
export interface Config {
    layers: LayerRule[];
    analyzer: AnalyzerConfig;
    fileDiscovery: FileDiscoveryConfig;
    rules: Record<string, RuleSettings>;
    database: DatabaseConfig;
    engine: EngineConfig;
}
export declare const LayerRuleSchema: z.ZodObject<{
    name: z.ZodString;
    pattern: z.ZodString;
    canImport: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    cannotImport: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    pattern: string;
    canImport: string[];
    cannotImport: string[];
}, {
    name: string;
    pattern: string;
    canImport?: string[] | undefined;
    cannotImport?: string[] | undefined;
}>;
export declare const AnalyzerConfigSchema: z.ZodObject<{
    fileExtensions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    fileExtensions: string[];
}, {
    fileExtensions?: string[] | undefined;
}>;
export declare const FileDiscoveryConfigSchema: z.ZodObject<{
    includePatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    excludePatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    includePatterns: string[];
    excludePatterns: string[];
}, {
    includePatterns?: string[] | undefined;
    excludePatterns?: string[] | undefined;
}>;
export declare const RuleConfigZodSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    severity: z.ZodDefault<z.ZodEnum<["error", "warning", "info"]>>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    severity: "error" | "warning" | "info";
}, {
    enabled?: boolean | undefined;
    severity?: "error" | "warning" | "info" | undefined;
}>;
export declare const DatabaseConfigSchema: z.ZodObject<{
    uri: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    uri: string;
}, {
    uri?: string | undefined;
}>;
export declare const EngineConfigSchema: z.ZodObject<{
    url: z.ZodDefault<z.ZodString>;
    timeoutMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    url: string;
    timeoutMs?: number | undefined;
}, {
    url?: string | undefined;
    timeoutMs?: number | undefined;
}>;
export declare const ConfigSchema: z.ZodObject<{
    layers: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        pattern: z.ZodString;
        canImport: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        cannotImport: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        pattern: string;
        canImport: string[];
        cannotImport: string[];
    }, {
        name: string;
        pattern: string;
        canImport?: string[] | undefined;
        cannotImport?: string[] | undefined;
    }>, "many">;
    analyzer: z.ZodObject<{
        fileExtensions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        fileExtensions: string[];
    }, {
        fileExtensions?: string[] | undefined;
    }>;
    fileDiscovery: z.ZodObject<{
        includePatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        excludePatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        includePatterns: string[];
        excludePatterns: string[];
    }, {
        includePatterns?: string[] | undefined;
        excludePatterns?: string[] | undefined;
    }>;
    rules: z.ZodRecord<z.ZodString, z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        severity: z.ZodDefault<z.ZodEnum<["error", "warning", "info"]>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        severity: "error" | "warning" | "info";
    }, {
        enabled?: boolean | undefined;
        severity?: "error" | "warning" | "info" | undefined;
    }>>;
    database: z.ZodObject<{
        uri: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        uri: string;
    }, {
        uri?: string | undefined;
    }>;
    engine: z.ZodObject<{
        url: z.ZodDefault<z.ZodString>;
        timeoutMs: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        timeoutMs?: number | undefined;
    }, {
        url?: string | undefined;
        timeoutMs?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    layers: {
        name: string;
        pattern: string;
        canImport: string[];
        cannotImport: string[];
    }[];
    analyzer: {
        fileExtensions: string[];
    };
    fileDiscovery: {
        includePatterns: string[];
        excludePatterns: string[];
    };
    rules: Record<string, {
        enabled: boolean;
        severity: "error" | "warning" | "info";
    }>;
    database: {
        uri: string;
    };
    engine: {
        url: string;
        timeoutMs?: number | undefined;
    };
}, {
    layers: {
        name: string;
        pattern: string;
        canImport?: string[] | undefined;
        cannotImport?: string[] | undefined;
    }[];
    analyzer: {
        fileExtensions?: string[] | undefined;
    };
    fileDiscovery: {
        includePatterns?: string[] | undefined;
        excludePatterns?: string[] | undefined;
    };
    rules: Record<string, {
        enabled?: boolean | undefined;
        severity?: "error" | "warning" | "info" | undefined;
    }>;
    database: {
        uri?: string | undefined;
    };
    engine: {
        url?: string | undefined;
        timeoutMs?: number | undefined;
    };
}>;
