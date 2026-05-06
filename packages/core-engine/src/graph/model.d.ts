import { GraphClient } from './client';
import { FileNode, ClassNode, FunctionNode, ImportEdge, DependsOnEdge } from './schema';
export declare class GraphModel {
    private client;
    private nodesCreated;
    private edgesCreated;
    constructor(client: GraphClient);
    getMetrics(): {
        nodesCreated: number;
        edgesCreated: number;
    };
    resetMetrics(): void;
    initializeSchema(): Promise<void>;
    createFile(node: FileNode): Promise<void>;
    createClass(node: ClassNode): Promise<void>;
    createFunction(node: FunctionNode): Promise<void>;
    createImport(edge: ImportEdge): Promise<void>;
    createDependsOn(edge: DependsOnEdge): Promise<void>;
    getImportGraph(): Promise<any[]>;
    detectCycles(): Promise<any[]>;
    clearGraph(): Promise<void>;
}
