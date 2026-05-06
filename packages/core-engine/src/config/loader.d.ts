import { Config } from './schema';
export declare class ConfigLoader {
    private workspaceRoot;
    private configPath?;
    private rawConfig;
    constructor(workspaceRoot: string, configPath?: string);
    load(): Config;
    private loadEnvFile;
    private resolveConfigPath;
    private applyEnvOverrides;
    private validateCredentials;
    getDatabaseCredentials(): {
        username: string;
        password: string;
    };
}
