"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTParser = void 0;
const ts_morph_1 = require("ts-morph");
class ASTParser {
    project;
    constructor(tsConfigPath) {
        this.project = new ts_morph_1.Project({
            tsConfigFilePath: tsConfigPath,
            skipAddingFilesFromTsConfig: true,
        });
    }
    parseFile(filePath) {
        const sourceFile = this.project.addSourceFileAtPath(filePath);
        return this.extractFileInfo(sourceFile);
    }
    parseFiles(filePaths) {
        return filePaths.map(path => this.parseFile(path));
    }
    extractFileInfo(sourceFile) {
        return {
            path: sourceFile.getFilePath(),
            imports: this.extractImports(sourceFile),
            exports: this.extractExports(sourceFile),
            classes: this.extractClasses(sourceFile),
            functions: this.extractFunctions(sourceFile),
            interfaces: this.extractInterfaces(sourceFile),
        };
    }
    extractImports(sourceFile) {
        return sourceFile.getImportDeclarations().map(imp => ({
            module: imp.getModuleSpecifierValue(),
            isTypeOnly: imp.isTypeOnly(),
            line: imp.getStartLineNumber(),
            namedImports: imp.getNamedImports().map(ni => ni.getName()),
            defaultImport: imp.getDefaultImport()?.getText(),
        }));
    }
    extractExports(sourceFile) {
        const exports = [];
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
                const name = func.getName();
                if (name) {
                    exports.push({
                        name,
                        isDefault: func.isDefaultExport(),
                        isType: false,
                        line: func.getStartLineNumber(),
                    });
                }
            }
        });
        // Exported classes
        sourceFile.getClasses().forEach(cls => {
            if (cls.isExported()) {
                const name = cls.getName();
                if (name) {
                    exports.push({
                        name,
                        isDefault: cls.isDefaultExport(),
                        isType: false,
                        line: cls.getStartLineNumber(),
                    });
                }
            }
        });
        return exports;
    }
    extractClasses(sourceFile) {
        const classes = [];
        for (const cls of sourceFile.getClasses()) {
            const name = cls.getName();
            if (!name)
                continue;
            classes.push({
                name,
                isExported: cls.isExported(),
                isAbstract: cls.isAbstract(),
                extends: cls.getExtends()?.getText(),
                implements: cls.getImplements().map(i => i.getText()),
                methods: cls.getMethods().map(method => ({
                    name: method.getName() || 'unknown',
                    isExported: false,
                    isAsync: method.isAsync(),
                    isStatic: method.isStatic(),
                    parameters: method.getParameters().map(param => ({
                        name: param.getName(),
                        type: param.getType()?.getText() || 'unknown',
                        isOptional: param.isOptional(),
                    })),
                    returnType: method.getReturnType()?.getText() || 'void',
                    line: method.getStartLineNumber(),
                })),
                properties: cls.getProperties().map(prop => ({
                    name: prop.getName(),
                    type: prop.getType()?.getText() || 'unknown',
                    isReadonly: prop.isReadonly(),
                    isStatic: prop.isStatic(),
                    line: prop.getStartLineNumber(),
                })),
                line: cls.getStartLineNumber(),
            });
        }
        return classes;
    }
    extractFunctions(sourceFile) {
        const functions = [];
        for (const func of sourceFile.getFunctions()) {
            const name = func.getName();
            if (!name)
                continue;
            functions.push({
                name,
                isExported: func.isExported(),
                isAsync: func.isAsync(),
                isStatic: false,
                parameters: func.getParameters().map(param => ({
                    name: param.getName(),
                    type: param.getType()?.getText() || 'unknown',
                    isOptional: param.isOptional(),
                })),
                returnType: func.getReturnType()?.getText() || 'void',
                line: func.getStartLineNumber(),
            });
        }
        return functions;
    }
    extractInterfaces(sourceFile) {
        const interfaces = [];
        for (const iface of sourceFile.getInterfaces()) {
            const name = iface.getName();
            if (!name)
                continue;
            interfaces.push({
                name,
                isExported: iface.isExported(),
                extends: iface.getExtends().map(e => e.getText()),
                properties: iface.getProperties().map(prop => ({
                    name: prop.getName(),
                    type: prop.getType()?.getText() || 'unknown',
                    isReadonly: prop.isReadonly(),
                    isStatic: false,
                    line: prop.getStartLineNumber(),
                })),
                methods: iface.getMethods().map(method => ({
                    name: method.getName() || 'unknown',
                    isExported: false,
                    isAsync: false,
                    isStatic: false,
                    parameters: method.getParameters().map(param => ({
                        name: param.getName(),
                        type: param.getType()?.getText() || 'unknown',
                        isOptional: param.isOptional(),
                    })),
                    returnType: method.getReturnType()?.getText() || 'void',
                    line: method.getStartLineNumber(),
                })),
                line: iface.getStartLineNumber(),
            });
        }
        return interfaces;
    }
}
exports.ASTParser = ASTParser;
