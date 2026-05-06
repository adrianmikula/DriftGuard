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
exports.ConfigLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const schema_1 = require("./schema");
class ConfigLoader {
    workspaceRoot;
    configPath;
    rawConfig;
    constructor(workspaceRoot, configPath) {
        this.workspaceRoot = workspaceRoot;
        this.configPath = configPath;
    }
    load() {
        // 1. Load .env from workspace root
        this.loadEnvFile();
        // 2. Load config file
        const configFilePath = this.resolveConfigPath();
        if (!configFilePath) {
            throw new Error(`Configuration file not found. Expected at .driftguard/config.json or driftguard.config.json. ` +
                `Run 'driftguard init' to create a default configuration.`);
        }
        const configContent = fs.readFileSync(configFilePath, 'utf-8');
        let parsedConfig;
        try {
            parsedConfig = JSON.parse(configContent);
        }
        catch (error) {
            throw new Error(`Invalid configuration: Unable to parse JSON (${error.message})`);
        }
        // 3. Validate against schema
        const result = schema_1.ConfigSchema.safeParse(parsedConfig);
        if (!result.success) {
            const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
            throw new Error(`Invalid configuration:\n${errors}`);
        }
        this.rawConfig = parsedConfig;
        // 4. Merge environment variable overrides
        const config = this.applyEnvOverrides(result.data);
        // 5. Validate required credentials
        this.validateCredentials();
        return config;
    }
    loadEnvFile() {
        const envPath = path.join(this.workspaceRoot, '.env');
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath, override: true });
        }
        // Also try loading from process.env directly (for CI scenarios)
    }
    resolveConfigPath() {
        // If explicit config path provided via CLI
        if (this.configPath) {
            const resolved = path.isAbsolute(this.configPath)
                ? this.configPath
                : path.join(this.workspaceRoot, this.configPath);
            console.log(`Looking for config at: ${resolved}`);
            if (fs.existsSync(resolved)) {
                return resolved;
            }
            throw new Error(`Specified config file not found: ${resolved}`);
        }
        // Check default locations in order
        const candidates = [
            path.join(this.workspaceRoot, '.driftguard', 'config.json'),
            path.join(this.workspaceRoot, 'driftguard.config.json'),
        ];
        console.log(`Workspace root: ${this.workspaceRoot}`);
        for (const candidate of candidates) {
            console.log(`Checking config candidate: ${candidate}`);
            if (fs.existsSync(candidate)) {
                console.log(`Found config at: ${candidate}`);
                return candidate;
            }
        }
        return undefined;
    }
    applyEnvOverrides(config) {
        // Database overrides
        if (process.env.MEMGRAPH_URI) {
            config.database.uri = process.env.MEMGRAPH_URI;
        }
        if (process.env.MEMGRAPH_USERNAME) {
            // Stored separately for credentials, not in returned config object
        }
        if (process.env.MEMGRAPH_PASSWORD) {
            // Stored separately for credentials
        }
        // Engine overrides
        if (process.env.ENGINE_URL) {
            config.engine.url = process.env.ENGINE_URL;
        }
        return config;
    }
    validateCredentials() {
        const errors = [];
        if (!process.env.MEMGRAPH_USERNAME) {
            errors.push('MEMGRAPH_USERNAME is required (set in .env or environment)');
        }
        if (!process.env.MEMGRAPH_PASSWORD) {
            errors.push('MEMGRAPH_PASSWORD is required (set in .env or environment)');
        }
        if (errors.length > 0) {
            throw new Error(`Configuration validation failed:\n${errors.join('\n')}\n\n` +
                `Please create a .env file in the workspace root with these variables, ` +
                `or set them in your environment. See .env.example for reference.`);
        }
    }
    getDatabaseCredentials() {
        return {
            username: process.env.MEMGRAPH_USERNAME,
            password: process.env.MEMGRAPH_PASSWORD,
        };
    }
}
exports.ConfigLoader = ConfigLoader;
