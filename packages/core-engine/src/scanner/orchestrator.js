"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScannerOrchestrator = void 0;
class ScannerOrchestrator {
    graph;
    ruleEngine;
    analyzers = new Map();
    constructor(graph, ruleEngine) {
        this.graph = graph;
        this.ruleEngine = ruleEngine;
    }
    registerAnalyzer(analyzer) {
        this.analyzers.set(analyzer.language, analyzer);
    }
    unregisterAnalyzer(language) {
        this.analyzers.delete(language);
    }
    async scan(context) {
        const startTime = Date.now();
        try {
            const analyzer = this.analyzers.get(context.language);
            if (!analyzer) {
                throw new Error(`No analyzer found for language: ${context.language}`);
            }
            // Reset graph metrics before scan
            this.graph.resetMetrics();
            // Run language-specific analysis
            await analyzer.analyze(context, this.graph);
            // Execute all rules and filter to only violations (failed rules)
            const allResults = await this.ruleEngine.executeAllRules(context);
            const violations = allResults.filter(r => !r.passed);
            const duration = Date.now() - startTime;
            const graphMetrics = this.graph.getMetrics();
            return {
                success: true,
                violations,
                metrics: {
                    filesScanned: context.files.length,
                    nodesCreated: graphMetrics.nodesCreated,
                    edgesCreated: graphMetrics.edgesCreated,
                    duration,
                },
            };
        }
        catch (error) {
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
exports.ScannerOrchestrator = ScannerOrchestrator;
