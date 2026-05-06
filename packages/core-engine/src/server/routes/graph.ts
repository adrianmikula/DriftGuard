import { Router, Request, Response } from 'express';
import { GraphModel } from '../../graph/model';

export default function graphRouter(graph: GraphModel): Router {
  const router = Router();

  router.get('/imports', async (req: Request, res: Response) => {
    try {
      const importGraph = await graph.getImportGraph();
      res.json({ imports: importGraph });
    } catch (error) {
      console.error('Error fetching import graph:', error);
      res.status(500).json({ error: 'Failed to fetch import graph' });
    }
  });

  router.get('/cycles', async (req: Request, res: Response) => {
    try {
      const cycles = await graph.detectCycles();
      res.json({ cycles });
    } catch (error) {
      console.error('Error detecting cycles:', error);
      res.status(500).json({ error: 'Failed to detect cycles' });
    }
  });

  return router;
}
