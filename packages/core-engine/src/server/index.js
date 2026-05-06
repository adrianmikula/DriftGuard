"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const scan_1 = __importDefault(require("./routes/scan"));
const status_1 = __importDefault(require("./routes/status"));
const metrics_1 = __importDefault(require("./routes/metrics"));
const graph_1 = __importDefault(require("./routes/graph"));
function createServer(orchestrator, graph, config) {
    const app = (0, express_1.default)();
    // Middleware
    app.use(express_1.default.json());
    // Request logging middleware
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
    // Mount routers
    app.use('/api/scan', (0, scan_1.default)(orchestrator, graph));
    app.use('/api/status', (0, status_1.default)());
    app.use('/api/metrics', (0, metrics_1.default)(graph));
    app.use('/api/graph', (0, graph_1.default)(graph));
    // Simple root endpoint for testing
    app.get('/', (req, res) => {
        res.json({ message: 'DriftGuard API Server', version: '0.1.0' });
    });
    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: 'Internal server error' });
    });
    return app;
}
function startServer(orchestrator, graph, config) {
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
