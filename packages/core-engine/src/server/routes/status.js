"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = statusRouter;
const express_1 = require("express");
function statusRouter() {
    const router = (0, express_1.Router)();
    router.get('/', (req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });
    return router;
}
