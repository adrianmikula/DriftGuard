import { GraphClient } from './client';
import { NodeType, EdgeType, FileNode, ClassNode, FunctionNode, ImportEdge, DependsOnEdge } from './schema';

export class GraphModel {
  constructor(private client: GraphClient) {}

  async initializeSchema(): Promise<void> {
    const { SCHEMA_QUERIES } = await import('./schema');
    for (const query of SCHEMA_QUERIES) {
      await this.client.executeWrite(query);
    }
  }

  // Node operations
  async createFile(node: FileNode): Promise<void> {
    const query = `
      MERGE (f:File {path: $path})
      SET f.id = $id, f.language = $language, f.lastModified = $lastModified
    `;
    await this.client.executeWrite(query, node);
  }

  async createClass(node: ClassNode): Promise<void> {
    const query = `
      MERGE (c:Class {id: $id})
      SET c.name = $name, c.file = $file, c.isExported = $isExported
    `;
    await this.client.executeWrite(query, node);
  }

  async createFunction(node: FunctionNode): Promise<void> {
    const query = `
      MERGE (f:Function {id: $id})
      SET f.name = $name, f.file = $file, f.isExported = $isExported, f.isAsync = $isAsync
      ${node.class ? ', f.class = $class' : ''}
    `;
    await this.client.executeWrite(query, node);
  }

  // Edge operations
  async createImport(edge: ImportEdge): Promise<void> {
    const query = `
      MATCH (from:File {path: $from})
      MATCH (to:File {path: $to})
      MERGE (from)-[r:IMPORTS]->(to)
      SET r.isTypeOnly = $isTypeOnly, r.line = $line
    `;
    await this.client.executeWrite(query, edge);
  }

  async createDependsOn(edge: DependsOnEdge): Promise<void> {
    const query = `
      MATCH (from {id: $from})
      MATCH (to {id: $to})
      MERGE (from)-[r:DEPENDS_ON]->(to)
      SET r.strength = $strength
    `;
    await this.client.executeWrite(query, edge);
  }

  // Query operations
  async getImportGraph(): Promise<any[]> {
    const query = `
      MATCH (f1:File)-[r:IMPORTS]->(f2:File)
      RETURN f1.path as from, f2.path as to, r.isTypeOnly as isTypeOnly, r.line as line
    `;
    return await this.client.executeQuery(query);
  }

  async detectCycles(): Promise<any[]> {
    const query = `
      MATCH path = (start:File)-[:IMPORTS*]->(start)
      RETURN [node IN nodes(path) | node.path] as cycle
    `;
    return await this.client.executeQuery(query);
  }

  async clearGraph(): Promise<void> {
    const query = 'MATCH (n) DETACH DELETE n';
    await this.client.executeWrite(query);
  }
}
