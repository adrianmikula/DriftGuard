import { Project, SourceFile } from 'ts-morph';

export interface ParsedFile {
  path: string;
  imports: ImportStatement[];
  exports: ExportStatement[];
  classes: ClassInfo[];
  functions: FunctionInfo[];
  interfaces: InterfaceInfo[];
}

export interface ImportStatement {
  module: string;
  isTypeOnly: boolean;
  line: number;
  namedImports?: string[];
  defaultImport?: string;
}

export interface ExportStatement {
  name: string;
  isDefault: boolean;
  isType: boolean;
  line: number;
}

export interface ClassInfo {
  name: string;
  isExported: boolean;
  isAbstract: boolean;
  extends?: string;
  implements: string[];
  methods: FunctionInfo[];
  properties: PropertyInfo[];
  line: number;
}

export interface FunctionInfo {
  name: string;
  isExported: boolean;
  isAsync: boolean;
  isStatic: boolean;
  parameters: ParameterInfo[];
  returnType?: string;
  line: number;
}

export interface PropertyInfo {
  name: string;
  type?: string;
  isReadonly: boolean;
  isStatic: boolean;
  line: number;
}

export interface ParameterInfo {
  name: string;
  type?: string;
  isOptional: boolean;
}

export interface InterfaceInfo {
  name: string;
  isExported: boolean;
  extends: string[];
  properties: PropertyInfo[];
  methods: FunctionInfo[];
  line: number;
}

export class ASTParser {
  private project: Project;

  constructor(tsConfigPath?: string) {
    this.project = new Project({
      tsConfigFilePath: tsConfigPath,
      skipAddingFilesFromTsConfig: true,
    });
  }

  parseFile(filePath: string): ParsedFile {
    const sourceFile = this.project.addSourceFileAtPath(filePath);
    return this.extractFileInfo(sourceFile);
  }

  parseFiles(filePaths: string[]): ParsedFile[] {
    return filePaths.map(path => this.parseFile(path));
  }

  private extractFileInfo(sourceFile: SourceFile): ParsedFile {
    return {
      path: sourceFile.getFilePath(),
      imports: this.extractImports(sourceFile),
      exports: this.extractExports(sourceFile),
      classes: this.extractClasses(sourceFile),
      functions: this.extractFunctions(sourceFile),
      interfaces: this.extractInterfaces(sourceFile),
    };
  }

  private extractImports(sourceFile: SourceFile): ImportStatement[] {
    return sourceFile.getImportDeclarations().map(imp => ({
      module: imp.getModuleSpecifierValue(),
      isTypeOnly: imp.isTypeOnly(),
      line: imp.getStartLineNumber(),
      namedImports: imp.getNamedImports().map(ni => ni.getName()),
      defaultImport: imp.getDefaultImport()?.getText(),
    }));
  }

  private extractExports(sourceFile: SourceFile): ExportStatement[] {
    const exports: ExportStatement[] = [];

    // Export declarations
    sourceFile.getExportDeclarations().forEach(exp => {
      exp.getNamedExports().forEach(named => {
        exports.push({
          name: named.getName(),
          isDefault: false,
          isType: exp.isTypeOnly(),
          line: exp.getStartLineNumber(),
        });
      });
    });

    // Exported functions
    sourceFile.getFunctions().forEach(func => {
      if (func.isExported()) {
        exports.push({
          name: func.getName(),
          isDefault: func.isDefaultExport(),
          isType: false,
          line: func.getStartLineNumber(),
        });
      }
    });

    // Exported classes
    sourceFile.getClasses().forEach(cls => {
      if (cls.isExported()) {
        exports.push({
          name: cls.getName(),
          isDefault: cls.isDefaultExport(),
          isType: false,
          line: cls.getStartLineNumber(),
        });
      }
    });

    return exports;
  }

  private extractClasses(sourceFile: SourceFile): ClassInfo[] {
    return sourceFile.getClasses().map(cls => ({
      name: cls.getName(),
      isExported: cls.isExported(),
      isAbstract: cls.isAbstract(),
      extends: cls.getExtends()?.getText(),
      implements: cls.getImplements().map(i => i.getText()),
      methods: cls.getMethods().map(method => ({
        name: method.getName(),
        isExported: false,
        isAsync: method.isAsync(),
        isStatic: method.isStatic(),
        parameters: method.getParameters().map(param => ({
          name: param.getName(),
          type: param.getType()?.getText(),
          isOptional: param.isOptional(),
        })),
        returnType: method.getReturnType()?.getText(),
        line: method.getStartLineNumber(),
      })),
      properties: cls.getProperties().map(prop => ({
        name: prop.getName(),
        type: prop.getType()?.getText(),
        isReadonly: prop.isReadonly(),
        isStatic: prop.isStatic(),
        line: prop.getStartLineNumber(),
      })),
      line: cls.getStartLineNumber(),
    }));
  }

  private extractFunctions(sourceFile: SourceFile): FunctionInfo[] {
    return sourceFile.getFunctions().map(func => ({
      name: func.getName(),
      isExported: func.isExported(),
      isAsync: func.isAsync(),
      isStatic: false,
      parameters: func.getParameters().map(param => ({
        name: param.getName(),
        type: param.getType()?.getText(),
        isOptional: param.isOptional(),
      })),
      returnType: func.getReturnType()?.getText(),
      line: func.getStartLineNumber(),
    }));
  }

  private extractInterfaces(sourceFile: SourceFile): InterfaceInfo[] {
    return sourceFile.getInterfaces().map(iface => ({
      name: iface.getName(),
      isExported: iface.isExported(),
      extends: iface.getExtends().map(e => e.getText()),
      properties: iface.getProperties().map(prop => ({
        name: prop.getName(),
        type: prop.getType()?.getText(),
        isReadonly: prop.isReadonly(),
        isStatic: false,
        line: prop.getStartLineNumber(),
      })),
      methods: iface.getMethods().map(method => ({
        name: method.getName(),
        isExported: false,
        isAsync: false,
        isStatic: false,
        parameters: method.getParameters().map(param => ({
          name: param.getName(),
          type: param.getType()?.getText(),
          isOptional: param.isOptional(),
        })),
        returnType: method.getReturnType()?.getText(),
        line: method.getStartLineNumber(),
      })),
      line: iface.getStartLineNumber(),
    }));
  }
}
