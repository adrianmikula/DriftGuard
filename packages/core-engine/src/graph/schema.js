"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHEMA_QUERIES = exports.EdgeType = exports.NodeType = void 0;
// Node types
var NodeType;
(function (NodeType) {
    NodeType["FILE"] = "File";
    NodeType["CLASS"] = "Class";
    NodeType["FUNCTION"] = "Function";
    NodeType["MODULE"] = "Module";
    NodeType["INTERFACE"] = "Interface";
    NodeType["TYPE"] = "Type";
})(NodeType || (exports.NodeType = NodeType = {}));
// Edge types
var EdgeType;
(function (EdgeType) {
    EdgeType["IMPORTS"] = "IMPORTS";
    EdgeType["DEPENDS_ON"] = "DEPENDS_ON";
    EdgeType["IMPLEMENTS"] = "IMPLEMENTS";
    EdgeType["EXTENDS"] = "EXTENDS";
    EdgeType["CALLS"] = "CALLS";
    EdgeType["DEFINES"] = "DEFINES";
    EdgeType["BELONGS_TO"] = "BELONGS_TO";
})(EdgeType || (exports.EdgeType = EdgeType = {}));
// Graph schema initialization queries
exports.SCHEMA_QUERIES = [
    // Create indexes for common queries
    'CREATE INDEX file_path_index IF NOT EXISTS FOR (f:File) ON (f.path)',
    'CREATE INDEX class_name_index IF NOT EXISTS FOR (c:Class) ON (c.name)',
    'CREATE INDEX function_name_index IF NOT EXISTS FOR (f:Function) ON (f.name)',
    // Create uniqueness constraints
    'CREATE CONSTRAINT file_path_unique IF NOT EXISTS FOR (f:File) REQUIRE f.path IS UNIQUE',
    'CREATE CONSTRAINT class_id_unique IF NOT EXISTS FOR (c:Class) REQUIRE c.id IS UNIQUE',
    'CREATE CONSTRAINT function_id_unique IF NOT EXISTS FOR (f:Function) REQUIRE f.id IS UNIQUE',
];
