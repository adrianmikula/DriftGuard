// Node types
export enum NodeType {
  FILE = 'File',
  CLASS = 'Class',
  FUNCTION = 'Function',
  MODULE = 'Module',
  INTERFACE = 'Interface',
  TYPE = 'Type',
}

// Edge types
export enum EdgeType {
  IMPORTS = 'IMPORTS',
  DEPENDS_ON = 'DEPENDS_ON',
  IMPLEMENTS = 'IMPLEMENTS',
  EXTENDS = 'EXTENDS',
  CALLS = 'CALLS',
  DEFINES = 'DEFINES',
  BELONGS_TO = 'BELONGS_TO',
}

// Node properties
export interface FileNode {
  id: string;
  path: string;
  language: string;
  lastModified: number;
}

export interface ClassNode {
  id: string;
  name: string;
  file: string;
  isExported: boolean;
}

export interface FunctionNode {
  id: string;
  name: string;
  file: string;
  class?: string;
  isExported: boolean;
  isAsync: boolean;
}

export interface ModuleNode {
  id: string;
  name: string;
  path: string;
}

// Edge properties
export interface ImportEdge {
  from: string;
  to: string;
  isTypeOnly: boolean;
  line: number;
}

export interface DependsOnEdge {
  from: string;
  to: string;
  strength: number;
}

// Graph schema initialization queries
export const SCHEMA_QUERIES = [
  // Create indexes for common queries
  'CREATE INDEX file_path_index IF NOT EXISTS FOR (f:File) ON (f.path)',
  'CREATE INDEX class_name_index IF NOT EXISTS FOR (c:Class) ON (c.name)',
  'CREATE INDEX function_name_index IF NOT EXISTS FOR (f:Function) ON (f.name)',
  
  // Create uniqueness constraints
  'CREATE CONSTRAINT file_path_unique IF NOT EXISTS FOR (f:File) REQUIRE f.path IS UNIQUE',
  'CREATE CONSTRAINT class_id_unique IF NOT EXISTS FOR (c:Class) REQUIRE c.id IS UNIQUE',
  'CREATE CONSTRAINT function_id_unique IF NOT EXISTS FOR (f:Function) REQUIRE f.id IS UNIQUE',
];
