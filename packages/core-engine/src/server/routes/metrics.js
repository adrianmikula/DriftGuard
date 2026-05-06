"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = metricsRouter;
const express_1 = require("express");
function metricsRouter(graph) {
    const router = (0, express_1.Router)();
    router.get('/', (req, res) => {
        const metrics = graph.getMetrics();
        const timestamp = Date.now();
        // Prometheus-style text format
        const output = `# HELP driftguard_nodes_created_total Total number of graph nodes created
# TYPE driftguard_nodes_created_total counter
driftguard_nodes_created_total ${metrics.nodesCreated} ${timestamp}

# HELP driftguard_edges_created_total Total number of graph edges created
# TYPE driftguard_edges_created_total counter
driftguard_edges_created_total ${metrics.edgesCreated} ${timestamp}

# HELP driftguard_uptime_seconds Seconds since server start
# TYPE driftguard_uptime_seconds gauge
driftguard_uptime_seconds ${process.uptime()} ${timestamp}
`;
        res.setHeader('Content-Type', 'text/plain; version=0.0.4');
        res.send(output);
    });
    return router;
}
