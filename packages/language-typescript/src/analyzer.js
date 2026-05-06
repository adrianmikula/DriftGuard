"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptAnalyzer = void 0;
const path = __importStar(require("path"));
const ast_parser_1 = require("./parser/ast-parser");
const import_graph_1 = require("./analyzer/import-graph");
const boundary_checker_1 = require("./analyzer/boundary-checker");
const circular_dependency_rule_1 = require("./rules/circular-dependency-rule");
const boundary_violation_rule_1 = require("./rules/boundary-violation-rule");
class TypeScriptAnalyzer {
    language = 'typescript';
    parser;
    importGraphAnalyzer;
    boundaryChecker;
    fileExtensions;
    constructor(tsConfigPath, config) {
        this.parser = new ast_parser_1.ASTParser(tsConfigPath);
        this.importGraphAnalyzer = new import_graph_1.ImportGraphAnalyzer();
        this.boundaryChecker = new boundary_checker_1.BoundaryChecker();
        // Set up file extensions (default to ts/tsx if not provided)
        this.fileExtensions = new Set(config?.fileExtensions ?? ['ts', 'tsx']);
        if (!config?.layers) {
            throw new Error('TypeScriptAnalyzer requires layer rules configuration');
        }
        config.layers.forEach(rule => {
            this.boundaryChecker.addRule(rule);
        });
    }
    async analyze(context, graph) {
        // Parse all TypeScript files
        const parsedFiles = [];
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
            }
            catch (error) {
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
            }
            catch (error) {
                // Skip if target file doesn't exist in graph
            }
        }
        // Create DEPENDS_ON edges based on file imports (simplified dependency)
        for (const edge of importEdges) {
            try {
                await graph.createDependsOn({
                    from: edge.from,
                    to: edge.to,
                    strength: 1.0,
                });
            }
            catch (error) {
                // Skip if target nodes don't exist
            }
        }
    }
    getImportGraphAnalyzer() {
        return this.importGraphAnalyzer;
    }
    getBoundaryChecker() {
        return this.boundaryChecker;
    }
    getCircularDependencyRule() {
        return new circular_dependency_rule_1.CircularDependencyRule(this.importGraphAnalyzer);
    }
    getBoundaryViolationRule() {
        return new boundary_violation_rule_1.BoundaryViolationRule(this.boundaryChecker);
    }
}
exports.TypeScriptAnalyzer = TypeScriptAnalyzer;
