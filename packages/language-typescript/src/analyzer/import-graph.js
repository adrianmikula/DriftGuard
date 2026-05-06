"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportGraphAnalyzer = void 0;
const path_1 = require("path");
class ImportGraphAnalyzer {
    edges = new Map();
    files = new Set();
    buildGraph(parsedFiles) {
        this.edges.clear();
        this.files.clear();
        // Collect all files
        parsedFiles.forEach(file => this.files.add(file.path));
        // Build import edges
        parsedFiles.forEach(file => {
            file.imports.forEach(imp => {
                const edge = {
                    from: file.path,
                    to: this.resolveImportPath(file.path, imp.module),
                    isTypeOnly: imp.isTypeOnly,
                    line: imp.line,
                };
                if (!this.edges.has(file.path)) {
                    this.edges.set(file.path, []);
                }
                this.edges.get(file.path).push(edge);
            });
        });
        return Array.from(this.edges.values()).flat();
    }
    detectCycles() {
        const cycles = [];
        const visited = new Set();
        const recursionStack = new Set();
        const dfs = (node, path) => {
            visited.add(node);
            recursionStack.add(node);
            path.push(node);
            const neighbors = this.edges.get(node) || [];
            for (const edge of neighbors) {
                if (!visited.has(edge.to)) {
                    dfs(edge.to, [...path]);
                }
                else if (recursionStack.has(edge.to)) {
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
    getDependencies(file) {
        return this.edges.get(file) || [];
    }
    getDependents(file) {
        const dependents = [];
        for (const [from, edges] of this.edges.entries()) {
            for (const edge of edges) {
                if (edge.to === file) {
                    dependents.push(edge);
                }
            }
        }
        return dependents;
    }
    resolveImportPath(fromFile, importModule) {
        // Simplified path resolution - normalize to absolute, canonical paths
        if (!importModule.startsWith('.')) {
            return importModule;
        }
        // Use POSIX paths to maintain forward-slash consistency
        const fromDir = path_1.posix.dirname(fromFile);
        let combined = path_1.posix.join(fromDir, importModule) + '.ts';
        combined = path_1.posix.normalize(combined);
        // Ensure leading slash for absolute paths
        if (!combined.startsWith('/')) {
            combined = '/' + combined;
        }
        return combined;
    }
}
exports.ImportGraphAnalyzer = ImportGraphAnalyzer;
