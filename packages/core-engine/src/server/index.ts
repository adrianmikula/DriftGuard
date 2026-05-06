import express, { Request, Response, NextFunction } from 'express';
import { ScannerOrchestrator } from '../scanner';
import { GraphModel } from '../graph/model';
import scanRouter from './routes/scan';
import statusRouter from './routes/status';
import metricsRouter from './routes/metrics';
import graphRouter from './routes/graph';

export interface ServerConfig {
  port: number;
  host?: string;
}

export function createServer(
  orchestrator: ScannerOrchestrator,
  graph: GraphModel,
  config: ServerConfig
): express.Application {
  const app = express();

  // Middleware
  app.use(express.json());

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });

  // Mount routers
  app.use('/api/scan', scanRouter(orchestrator, graph));
  app.use('/api/status', statusRouter());
  app.use('/api/metrics', metricsRouter(graph));
  app.use('/api/graph', graphRouter(graph));

  // Simple root endpoint for testing
  app.get('/', (req, res) => {
    res.json({ message: 'DriftGuard API Server', version: '0.1.0' });
  });

  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

export function startServer(
  orchestrator: ScannerOrchestrator,
  graph: GraphModel,
  config: ServerConfig
): void {
  console.log('Creating Express server...');
  const app = createServer(orchestrator, graph, config);

  const host = config.host || 'localhost';
  console.log(`Starting server on ${host}:${config.port}...`);

  const server = app.listen(config.port, host, () => {
    console.log(`DriftGuard HTTP server listening on http://${host}:${config.port}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });
}
