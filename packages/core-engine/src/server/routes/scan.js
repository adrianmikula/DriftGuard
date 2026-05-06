"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = scanRouter;
const express_1 = require("express");
function scanRouter(orchestrator, graph) {
    const router = (0, express_1.Router)();
    router.post('/', async (req, res) => {
        try {
            const { workspacePath, language, files } = req.body;
            if (!workspacePath || !language || !Array.isArray(files)) {
                return res.status(400).json({
                    error: 'Invalid request body. Required: workspacePath, language, files[]',
                });
            }
            // Reset metrics before scan
            graph.resetMetrics();
            const context = { workspacePath, language, files };
            const result = await orchestrator.scan(context);
            // Get final metrics from graph
            const graphMetrics = graph.getMetrics();
            res.json({
                ...result,
                metrics: {
                    ...result.metrics,
                    nodesCreated: graphMetrics.nodesCreated,
                    edgesCreated: graphMetrics.edgesCreated,
                },
            });
        }
        catch (error) {
            console.error('Scan error:', error);
            res.status(500).json({ error: 'Scan failed', details: error.message });
        }
    });
    return router;
}
