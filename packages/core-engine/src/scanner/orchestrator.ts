import { GraphModel } from '../graph/model';
import { RuleEngine, RuleResult } from '../rules';

export interface ScanContext {
  workspacePath: string;
  language: string;
  files: string[];
}

export interface ScanResult {
  success: boolean;
  violations: RuleResult[];
  metrics: {
    filesScanned: number;
    nodesCreated: number;
    edgesCreated: number;
    duration: number;
  };
}

export interface LanguageAnalyzer {
  language: string;
  analyze(context: ScanContext, graph: GraphModel): Promise<void>;
}

export class ScannerOrchestrator {
  private analyzers: Map<string, LanguageAnalyzer> = new Map();

  constructor(
    private graph: GraphModel,
    private ruleEngine: RuleEngine
  ) {}

  registerAnalyzer(analyzer: LanguageAnalyzer): void {
    this.analyzers.set(analyzer.language, analyzer);
  }

  unregisterAnalyzer(language: string): void {
    this.analyzers.delete(language);
  }

  async scan(context: ScanContext): Promise<ScanResult> {
    const startTime = Date.now();
    try {
      const analyzer = this.analyzers.get(context.language);
      if (!analyzer) {
        throw new Error(`No analyzer found for language: ${context.language}`);
      }

      // Run language-specific analysis
      await analyzer.analyze(context, this.graph);

      // Execute all rules and filter to only violations (failed rules)
      const allResults = await this.ruleEngine.executeAllRules(context);
      const violations = allResults.filter(r => !r.passed);

      const duration = Date.now() - startTime;

      return {
        success: true,
        violations,
        metrics: {
          filesScanned: context.files.length,
          nodesCreated: 0, // TODO: Track from graph operations
          edgesCreated: 0, // TODO: Track from graph operations
          duration,
        },
      };
    } catch (error) {
      return {
        success: false,
        violations: [],
        metrics: {
          filesScanned: 0,
          nodesCreated: 0,
          edgesCreated: 0,
          duration: Date.now() - startTime,
        },
      };
    }
  }
}
