import { Router } from 'express';
import { ScannerOrchestrator } from '../../scanner';
import { GraphModel } from '../../graph/model';
export default function scanRouter(orchestrator: ScannerOrchestrator, graph: GraphModel): Router;
