// Core library exports — for direct usage (CLI, tests, embedded tools)
export * from './config';
export * from './graph';
export * from './rules';
export * from './scanner';

// HTTP server exports — for running the REST API server
// Consumers who want to embed the server should import from './server' directly
export { createServer, startServer, type ServerConfig } from './server';
