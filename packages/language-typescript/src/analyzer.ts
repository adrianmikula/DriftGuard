import { LanguageAnalyzer, ScanContext, GraphModel } from '@driftguard/core-engine';
import * as path from 'path';
import { ASTParser, ParsedFile } from './parser/ast-parser';
import { ImportGraphAnalyzer } from './analyzer/import-graph';
import { BoundaryChecker } from './analyzer/boundary-checker';
import { CircularDependencyRule } from './rules/circular-dependency-rule';
import { BoundaryViolationRule } from './rules/boundary-violation-rule';
import type { LayerRule } from '@driftguard/core-engine';

export interface AnalyzerConfig {
  layers: LayerRule[];
  fileExtensions?: string[];
}

export class TypeScriptAnalyzer implements LanguageAnalyzer {
  language = 'typescript';

  private parser: ASTParser;
  private importGraphAnalyzer: ImportGraphAnalyzer;
  private boundaryChecker: BoundaryChecker;
  private fileExtensions: Set<string>;

  constructor(tsConfigPath?: string, config?: AnalyzerConfig) {
    this.parser = new ASTParser(tsConfigPath);
    this.importGraphAnalyzer = new ImportGraphAnalyzer();
    this.boundaryChecker = new BoundaryChecker();

    // Set up file extensions (default to ts/tsx if not provided)
    this.fileExtensions = new Set(config?.fileExtensions ?? ['ts', 'tsx']);

    if (!config?.layers) {
      throw new Error('TypeScriptAnalyzer requires layer rules configuration');
    }
    config.layers.forEach(rule => {
      this.boundaryChecker.addRule(rule);
    });
  }

  async analyze(context: ScanContext, graph: GraphModel): Promise<void> {
    // Parse all TypeScript files
    const parsedFiles: ParsedFile[] = [];
    for (const filePath of context.files) {
      const ext = path.extname(filePath).slice(1);
      if (!this.fileExtensions.has(ext)) {
        continue;
      }

      try {
        const parsed = this.parser.parseFile(filePath);
        parsedFiles.push(parsed);

        // Create file node in graph
        await graph.createFile({
          id: filePath,
          path: filePath,
          language: 'typescript',
          lastModified: Date.now(), // TODO: Use actual file stats when fs is available
        });

        // Create class nodes
        for (const cls of parsed.classes) {
          await graph.createClass({
            id: `${filePath}:${cls.name}`,
            name: cls.name,
            file: filePath,
            isExported: cls.isExported,
          });
        }

        // Create function nodes
        for (const func of parsed.functions) {
          await graph.createFunction({
            id: `${filePath}:${func.name}`,
            name: func.name,
            file: filePath,
            isExported: func.isExported,
            isAsync: func.isAsync,
          });
        }
      } catch (error) {
        // TODO: Add proper logging when console is available
        // console.error(`Error parsing file ${filePath}:`, error);
      }
    }

    // Build import graph
    const importEdges = this.importGraphAnalyzer.buildGraph(parsedFiles);

    // Create import edges in graph
    for (const edge of importEdges) {
      try {
        await graph.createImport(edge);
      } catch (error) {
        // Skip if target file doesn't exist in graph
      }
    }
  }

  getImportGraphAnalyzer(): ImportGraphAnalyzer {
    return this.importGraphAnalyzer;
  }

  getBoundaryChecker(): BoundaryChecker {
    return this.boundaryChecker;
  }

  getCircularDependencyRule(): CircularDependencyRule {
    return new CircularDependencyRule(this.importGraphAnalyzer);
  }

  getBoundaryViolationRule(): BoundaryViolationRule {
    return new BoundaryViolationRule(this.boundaryChecker);
  }
}
