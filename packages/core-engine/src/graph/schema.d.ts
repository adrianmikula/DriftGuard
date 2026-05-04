export declare enum NodeType {
    FILE = "File",
    CLASS = "Class",
    FUNCTION = "Function",
    MODULE = "Module",
    INTERFACE = "Interface",
    TYPE = "Type"
}
export declare enum EdgeType {
    IMPORTS = "IMPORTS",
    DEPENDS_ON = "DEPENDS_ON",
    IMPLEMENTS = "IMPLEMENTS",
    EXTENDS = "EXTENDS",
    CALLS = "CALLS",
    DEFINES = "DEFINES",
    BELONGS_TO = "BELONGS_TO"
}
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
export declare const SCHEMA_QUERIES: string[];
