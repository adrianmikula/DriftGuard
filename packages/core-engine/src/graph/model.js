"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphModel = void 0;
class GraphModel {
    client;
    nodesCreated = 0;
    edgesCreated = 0;
    constructor(client) {
        this.client = client;
    }
    getMetrics() {
        return {
            nodesCreated: this.nodesCreated,
            edgesCreated: this.edgesCreated,
        };
    }
    resetMetrics() {
        this.nodesCreated = 0;
        this.edgesCreated = 0;
    }
    async initializeSchema() {
        const { SCHEMA_QUERIES } = await Promise.resolve().then(() => __importStar(require('./schema')));
        for (const query of SCHEMA_QUERIES) {
            await this.client.executeWrite(query);
        }
    }
    // Node operations
    async createFile(node) {
        const query = `
      MERGE (f:File {path: $path})
      SET f.id = $id, f.language = $language, f.lastModified = $lastModified
    `;
        await this.client.executeWrite(query, node);
        this.nodesCreated++;
    }
    async createClass(node) {
        const query = `
      MERGE (c:Class {id: $id})
      SET c.name = $name, c.file = $file, c.isExported = $isExported
    `;
        await this.client.executeWrite(query, node);
        this.nodesCreated++;
    }
    async createFunction(node) {
        const query = `
      MERGE (f:Function {id: $id})
      SET f.name = $name, f.file = $file, f.isExported = $isExported, f.isAsync = $isAsync
      ${node.class ? ', f.class = $class' : ''}
    `;
        await this.client.executeWrite(query, node);
        this.nodesCreated++;
    }
    // Edge operations
    async createImport(edge) {
        const query = `
      MATCH (from:File {path: $from})
      MATCH (to:File {path: $to})
      MERGE (from)-[r:IMPORTS]->(to)
      SET r.isTypeOnly = $isTypeOnly, r.line = $line
    `;
        await this.client.executeWrite(query, edge);
        this.edgesCreated++;
    }
    async createDependsOn(edge) {
        const query = `
      MATCH (from {id: $from})
      MATCH (to {id: $to})
      MERGE (from)-[r:DEPENDS_ON]->(to)
      SET r.strength = $strength
    `;
        await this.client.executeWrite(query, edge);
        this.edgesCreated++;
    }
    // Query operations
    async getImportGraph() {
        const query = `
      MATCH (f1:File)-[r:IMPORTS]->(f2:File)
      RETURN f1.path as from, f2.path as to, r.isTypeOnly as isTypeOnly, r.line as line
    `;
        return await this.client.executeQuery(query);
    }
    async detectCycles() {
        const query = `
      MATCH path = (start:File)-[:IMPORTS*]->(start)
      RETURN [node IN nodes(path) | node.path] as cycle
    `;
        return await this.client.executeQuery(query);
    }
    async clearGraph() {
        const query = 'MATCH (n) DETACH DELETE n';
        await this.client.executeWrite(query);
    }
}
exports.GraphModel = GraphModel;
