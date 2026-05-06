// Stub TypeScriptAnalyzer for testing HTTP server functionality
// TODO: Replace with actual @driftguard/language-typescript when dependency issues are resolved

export interface LanguageAnalyzer {
  language: string;
  analyze(context: any, graph: any): Promise<void>;
}

export interface ScanContext {
  workspacePath: string;
  language: string;
  files: string[];
}

export interface LayerRule {
  name: string;
  pattern: string;
  canImport: string[];
  cannotImport: string[];
}

export interface AnalyzerConfig {
  layers: LayerRule[];
  fileExtensions?: string[];
}

export interface DependsOnEdge {
  from: string;
  to: string;
  strength: number;
}

export class TypeScriptAnalyzer implements LanguageAnalyzer {
  language = 'typescript';

  constructor(tsConfigPath?: string, config?: AnalyzerConfig) {
    // Stub implementation
  }

  async analyze(context: ScanContext, graph: any): Promise<void> {
    // Stub implementation - create basic file nodes
    for (const filePath of context.files) {
      await graph.createFile({
        id: filePath,
        path: filePath,
        language: 'typescript',
        lastModified: Date.now(),
      });
    }
  }

  getBoundaryViolationRule(): any {
    return {
      id: 'boundary-violation',
      name: 'Boundary Violation',
      description: 'Checks for architectural boundary violations',
      check: () => Promise.resolve({ passed: true, violations: [] }),
    };
  }

  getCircularDependencyRule(): any {
    return {
      id: 'circular-dependency',
      name: 'Circular Dependency',
      description: 'Detects circular dependencies',
      check: () => Promise.resolve({ passed: true, violations: [] }),
    };
  }
}