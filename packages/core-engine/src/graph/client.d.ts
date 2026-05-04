import { Driver } from 'neo4j-driver';
export interface GraphClientConfig {
    uri: string;
    username: string;
    password: string;
}
export declare class GraphClient {
    private driver;
    constructor(config: GraphClientConfig);
    connect(): Promise<void>;
    close(): Promise<void>;
    executeQuery(query: string, params?: Record<string, any>): Promise<any[]>;
    executeWrite(query: string, params?: Record<string, any>): Promise<void>;
    getDriver(): Driver;
}
