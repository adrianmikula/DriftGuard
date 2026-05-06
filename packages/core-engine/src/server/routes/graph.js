"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = graphRouter;
const express_1 = require("express");
function graphRouter(graph) {
    const router = (0, express_1.Router)();
    router.get('/imports', async (req, res) => {
        try {
            const importGraph = await graph.getImportGraph();
            res.json({ imports: importGraph });
        }
        catch (error) {
            console.error('Error fetching import graph:', error);
            res.status(500).json({ error: 'Failed to fetch import graph' });
        }
    });
    router.get('/cycles', async (req, res) => {
        try {
            const cycles = await graph.detectCycles();
            res.json({ cycles });
        }
        catch (error) {
            console.error('Error detecting cycles:', error);
            res.status(500).json({ error: 'Failed to detect cycles' });
        }
    });
    return router;
}
