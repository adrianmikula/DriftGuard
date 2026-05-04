import { ScanResult, RuleViolation } from '@driftguard/core-engine';
export interface ScanRequest {
    workspacePath: string;
    language: string;
    files: string[];
}
export declare class EngineClient {
    private engineUrl;
    constructor(engineUrl?: string);
    scan(request: ScanRequest): Promise<ScanResult>;
    getViolations(): Promise<RuleViolation[]>;
    getImportGraph(): Promise<any>;
}
