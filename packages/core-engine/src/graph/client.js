"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphClient = void 0;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
class GraphClient {
    driver;
    constructor(config) {
        this.driver = neo4j_driver_1.default.driver(config.uri, neo4j_driver_1.default.auth.basic(config.username, config.password));
    }
    async connect() {
        await this.driver.verifyConnectivity();
    }
    async close() {
        await this.driver.close();
    }
    async executeQuery(query, params = {}) {
        const session = this.driver.session();
        try {
            const result = await session.run(query, params);
            return result.records;
        }
        finally {
            await session.close();
        }
    }
    async executeWrite(query, params = {}) {
        const session = this.driver.session();
        try {
            await session.run(query, params);
        }
        finally {
            await session.close();
        }
    }
    getDriver() {
        return this.driver;
    }
}
exports.GraphClient = GraphClient;
