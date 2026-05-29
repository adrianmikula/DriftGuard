import { Router, Request, Response } from 'express';
import { GraphModel } from '../../graph/model';

export default function metricsRouter(graph: GraphModel): Router {
  const router = Router();

  router.get('/json', (req: Request, res: Response) => {
    const metrics = graph.getMetrics();
    res.json({
      nodesCreated: metrics.nodesCreated,
      edgesCreated: metrics.edgesCreated,
      uptimeSeconds: process.uptime(),
    });
  });

  router.get('/', (req: Request, res: Response) => {
    const accept = req.headers['accept'] ?? '';
    const metrics = graph.getMetrics();
    const timestamp = Date.now();

    if (accept.includes('application/json')) {
      res.json({
        nodesCreated: metrics.nodesCreated,
        edgesCreated: metrics.edgesCreated,
        uptimeSeconds: process.uptime(),
      });
      return;
    }

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
