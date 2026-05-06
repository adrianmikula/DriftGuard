import { ScannerOrchestrator } from '../scanner';
import { GraphModel } from '../graph/model';

// Mock GraphModel for testing without database
export class MockGraphModel {
  private nodesCreated = 0;
  private edgesCreated = 0;

  getMetrics(): { nodesCreated: number; edgesCreated: number } {
    return { nodesCreated: this.nodesCreated, edgesCreated: this.edgesCreated };
  }

  resetMetrics(): void {
    this.nodesCreated = 0;
    this.edgesCreated = 0;
  }

  async initializeSchema(): Promise<void> {
    // No-op for mock
  }

  async createFile(node: any): Promise<void> {
    this.nodesCreated++;
  }

  async createClass(node: any): Promise<void> {
    this.nodesCreated++;
  }

  async createFunction(node: any): Promise<void> {
    this.nodesCreated++;
  }

  async createImport(edge: any): Promise<void> {
    this.edgesCreated++;
  }

  async createDependsOn(edge: any): Promise<void> {
    this.edgesCreated++;
  }

  async getImportGraph(): Promise<any[]> {
    return [];
  }

  async detectCycles(): Promise<any[]> {
    return [];
  }

  async clearGraph(): Promise<void> {
    // No-op for mock
  }
}