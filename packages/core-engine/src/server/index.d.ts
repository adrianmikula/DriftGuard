import express from 'express';
import { ScannerOrchestrator } from '../scanner';
import { GraphModel } from '../graph/model';
export interface ServerConfig {
    port: number;
    host?: string;
}
export declare function createServer(orchestrator: ScannerOrchestrator, graph: GraphModel, config: ServerConfig): express.Application;
export declare function startServer(orchestrator: ScannerOrchestrator, graph: GraphModel, config: ServerConfig): void;
