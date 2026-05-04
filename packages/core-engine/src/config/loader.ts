import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Config, ConfigSchema } from './schema';

export class ConfigLoader {
  private workspaceRoot: string;
  private configPath?: string;
  private rawConfig: any;

  constructor(workspaceRoot: string, configPath?: string) {
    this.workspaceRoot = workspaceRoot;
    this.configPath = configPath;
  }

  load(): Config {
    // 1. Load .env from workspace root
    this.loadEnvFile();

    // 2. Load config file
    const configFilePath = this.resolveConfigPath();
    if (!configFilePath) {
      throw new Error(
        `Configuration file not found. Expected at .driftguard/config.json or driftguard.config.json. ` +
        `Run 'driftguard init' to create a default configuration.`
      );
    }

    const configContent = fs.readFileSync(configFilePath, 'utf-8');
    const parsedConfig = JSON.parse(configContent);

    // 3. Validate against schema
    const result = ConfigSchema.safeParse(parsedConfig);
    if (!result.success) {
      const errors = result.error.errors.map(e => 
        `${e.path.join('.')}: ${e.message}`
      ).join('\n');
      throw new Error(`Invalid configuration:\n${errors}`);
    }

    this.rawConfig = parsedConfig;

    // 4. Merge environment variable overrides
    const config = this.applyEnvOverrides(result.data);

    // 5. Validate required credentials
    this.validateCredentials();

    return config;
  }

  private loadEnvFile(): void {
    const envPath = path.join(this.workspaceRoot, '.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
    // Also try loading from process.env directly (for CI scenarios)
  }

  private resolveConfigPath(): string | undefined {
    // If explicit config path provided via CLI
    if (this.configPath) {
      const resolved = path.isAbsolute(this.configPath) 
        ? this.configPath 
        : path.join(this.workspaceRoot, this.configPath);
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

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return undefined;
  }

  private applyEnvOverrides(config: Config): Config {
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

  private validateCredentials(): void {
    const errors: string[] = [];

    if (!process.env.MEMGRAPH_USERNAME) {
      errors.push('MEMGRAPH_USERNAME is required (set in .env or environment)');
    }
    if (!process.env.MEMGRAPH_PASSWORD) {
      errors.push('MEMGRAPH_PASSWORD is required (set in .env or environment)');
    }

    if (errors.length > 0) {
      throw new Error(
        `Configuration validation failed:\n${errors.join('\n')}\n\n` +
        `Please create a .env file in the workspace root with these variables, ` +
        `or set them in your environment. See .env.example for reference.`
      );
    }
  }

  getDatabaseCredentials() {
    return {
      username: process.env.MEMGRAPH_USERNAME!,
      password: process.env.MEMGRAPH_PASSWORD!,
    };
  }
}
