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

export interface RuleConfig {
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
  rules: Record<string, RuleConfig>;
  database: DatabaseConfig;
  engine: EngineConfig;
}

export const LayerRuleSchema = z.object({
  name: z.string(),
  pattern: z.string(),
  canImport: z.array(z.string()).default([]),
  cannotImport: z.array(z.string()).default([]),
});

export const AnalyzerConfigSchema = z.object({
  fileExtensions: z.array(z.string()).default(['ts', 'tsx']),
});

export const FileDiscoveryConfigSchema = z.object({
  includePatterns: z.array(z.string()).default(['**/*.{ts,tsx}']),
  excludePatterns: z.array(z.string()).default(['**/node_modules/**', '**/dist/**']),
});

export const RuleConfigSchema = z.object({
  enabled: z.boolean().default(true),
  severity: z.enum(['error', 'warning', 'info']).default('error'),
});

export const DatabaseConfigSchema = z.object({
  uri: z.string().default('bolt://localhost:7687'),
});

export const EngineConfigSchema = z.object({
  url: z.string().default('http://localhost:3000'),
  timeoutMs: z.number().optional(),
});

export const ConfigSchema = z.object({
  layers: z.array(LayerRuleSchema),
  analyzer: AnalyzerConfigSchema,
  fileDiscovery: FileDiscoveryConfigSchema,
  rules: z.record(RuleConfigSchema),
  database: DatabaseConfigSchema,
  engine: EngineConfigSchema,
});

export type { LayerRule, AnalyzerConfig, FileDiscoveryConfig, RuleConfig, DatabaseConfig, EngineConfig, Config };
