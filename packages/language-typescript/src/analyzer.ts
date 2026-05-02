import { LanguageAnalyzer, ScanContext } from '@driftguard/core-engine';
import { GraphModel } from '@driftguard/core-engine';
import { ASTParser, ParsedFile } from './parser/ast-parser';
import { ImportGraphAnalyzer } from './analyzer/import-graph';
import { BoundaryChecker } from './analyzer/boundary-checker';
import { CircularDependencyRule } from './rules/circular-dependency-rule';
import { BoundaryViolationRule } from './rules/boundary-violation-rule';
import * as fs from 'fs';
import * as path from 'path';

export class TypeScriptAnalyzer implements LanguageAnalyzer {
  language = 'typescript';

  private parser: ASTParser;
  private importGraphAnalyzer: ImportGraphAnalyzer;
  private boundaryChecker: BoundaryChecker;

  constructor(tsConfigPath?: string) {
    this.parser = new ASTParser(tsConfigPath);
    this.importGraphAnalyzer = new ImportGraphAnalyzer();
    this.boundaryChecker = new BoundaryChecker();

    // Add default layer rules (can be configured later)
    this.boundaryChecker.addRule({
      name: 'ui',
      pattern: '.*src/components/.*',
      canImport: ['ui', 'shared'],
      cannotImport: ['data', 'api'],
    });
    this.boundaryChecker.addRule({
      name: 'data',
      pattern: '.*src/data/.*',
      canImport: ['data', 'shared'],
      cannotImport: ['ui'],
    });
    this.boundaryChecker.addRule({
      name: 'api',
      pattern: '.*src/api/.*',
      canImport: ['api', 'data', 'shared'],
      cannotImport: ['ui'],
    });
    this.boundaryChecker.addRule({
      name: 'shared',
      pattern: '.*src/shared/.*',
      canImport: ['shared'],
      cannotImport: [],
    });
  }

  async analyze(context: ScanContext, graph: GraphModel): Promise<void> {
    // Parse all TypeScript files
    const parsedFiles: ParsedFile[] = [];
    for (const filePath of context.files) {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        try {
          const parsed = this.parser.parseFile(filePath);
          parsedFiles.push(parsed);

          // Create file node in graph
          await graph.createFile({
            id: filePath,
            path: filePath,
            language: 'typescript',
            lastModified: fs.statSync(filePath).mtimeMs,
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
          console.error(`Error parsing file ${filePath}:`, error);
        }
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
