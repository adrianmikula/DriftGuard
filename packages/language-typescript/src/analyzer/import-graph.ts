import { ParsedFile, ImportStatement } from '../parser/ast-parser';
import { posix } from 'path';

export interface ImportEdge {
  from: string;
  to: string;
  isTypeOnly: boolean;
  line: number;
}

export class ImportGraphAnalyzer {
  private edges: Map<string, ImportEdge[]> = new Map();
  private files: Set<string> = new Set();

  buildGraph(parsedFiles: ParsedFile[]): ImportEdge[] {
    this.edges.clear();
    this.files.clear();

    // Collect all files
    parsedFiles.forEach(file => this.files.add(file.path));

    // Build import edges
    parsedFiles.forEach(file => {
      file.imports.forEach(imp => {
        const edge: ImportEdge = {
          from: file.path,
          to: this.resolveImportPath(file.path, imp.module),
          isTypeOnly: imp.isTypeOnly,
          line: imp.line,
        };

        if (!this.edges.has(file.path)) {
          this.edges.set(file.path, []);
        }
        this.edges.get(file.path)!.push(edge);
      });
    });

    return Array.from(this.edges.values()).flat();
  }

  detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string, path: string[]): void => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = this.edges.get(node) || [];
      for (const edge of neighbors) {
        if (!visited.has(edge.to)) {
          dfs(edge.to, [...path]);
        } else if (recursionStack.has(edge.to)) {
          // Found a cycle
          const cycleStart = path.indexOf(edge.to);
          cycles.push([...path.slice(cycleStart), edge.to]);
        }
      }

      recursionStack.delete(node);
    };

    for (const file of this.files) {
      if (!visited.has(file)) {
        dfs(file, []);
      }
    }

    return cycles;
  }

  getDependencies(file: string): ImportEdge[] {
    return this.edges.get(file) || [];
  }

  getDependents(file: string): ImportEdge[] {
    const dependents: ImportEdge[] = [];
    for (const [from, edges] of this.edges.entries()) {
      for (const edge of edges) {
        if (edge.to === file) {
          dependents.push(edge);
        }
      }
    }
    return dependents;
  }

  private resolveImportPath(fromFile: string, importModule: string): string {
    // Simplified path resolution - normalize to absolute, canonical paths
    if (!importModule.startsWith('.')) {
      return importModule;
    }
    // Use POSIX paths to maintain forward-slash consistency
    const fromDir = posix.dirname(fromFile);
    let combined = posix.join(fromDir, importModule) + '.ts';
    combined = posix.normalize(combined);
    // Ensure leading slash for absolute paths
    if (!combined.startsWith('/')) {
      combined = '/' + combined;
    }
    return combined;
  }
}
