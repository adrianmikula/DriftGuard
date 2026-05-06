import { Router, Request, Response } from 'express';

export default function statusRouter(): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  return router;
}
