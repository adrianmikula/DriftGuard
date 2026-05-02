// STUB: Python AST parser - to be implemented in Phase 2
// This will use Python's ast module or libcst for parsing

export interface ParsedFile {
  path: string;
  imports: ImportStatement[];
  exports: ExportStatement[];
  classes: ClassInfo[];
  functions: FunctionInfo[];
}

export interface ImportStatement {
  module: string;
  isFromImport: boolean;
  line: number;
  names?: string[];
}

export interface ExportStatement {
  name: string;
  line: number;
}

export interface ClassInfo {
  name: string;
  bases: string[];
  methods: FunctionInfo[];
  line: number;
}

export interface FunctionInfo {
  name: string;
  parameters: string[];
  isAsync: boolean;
  line: number;
}

export class ASTParser {
  parseFile(filePath: string): ParsedFile {
    throw new Error('Python AST parser not yet implemented - Phase 2');
  }

  parseFiles(filePaths: string[]): ParsedFile[] {
    throw new Error('Python AST parser not yet implemented - Phase 2');
  }
}
