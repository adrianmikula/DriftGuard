import { Router, Request, Response } from 'express';
import { ScannerOrchestrator, ScanContext } from '../../scanner';
import { GraphModel } from '../../graph/model';

export default function scanRouter(
  orchestrator: ScannerOrchestrator,
  graph: GraphModel
): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response) => {
    try {
      const { workspacePath, language, files } = req.body as {
        workspacePath: string;
        language: string;
        files: string[];
      };

      if (!workspacePath || !language || !Array.isArray(files)) {
        return res.status(400).json({
          error: 'Invalid request body. Required: workspacePath, language, files[]',
        });
      }

      // Reset metrics before scan
      graph.resetMetrics();

      const context: ScanContext = { workspacePath, language, files };
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
    } catch (error) {
      console.error('Scan error:', error);
      res.status(500).json({ error: 'Scan failed', details: (error as Error).message });
    }
  });

  return router;
}
