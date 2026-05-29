import { Router, Request, Response } from 'express';
import { ScannerOrchestrator } from '../../scanner';

export default function violationsRouter(orchestrator: ScannerOrchestrator): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const results = orchestrator.getLastViolations();
    const violations = results.flatMap(r => r.violations);
    res.json({ violations });
  });

  return router;
}
