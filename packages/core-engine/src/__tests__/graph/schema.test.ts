import { describe, it, expect } from 'vitest';
import { NodeType, EdgeType } from '../../graph/schema';

describe('GraphSchema (Smoke Test)', () => {
  it('should define node types', () => {
    expect(NodeType).toBeDefined();
    expect(NodeType.FILE).toBe('File');
    expect(NodeType.CLASS).toBe('Class');
  });

  it('should define edge types', () => {
    expect(EdgeType).toBeDefined();
    expect(EdgeType.IMPORTS).toBe('IMPORTS');
    expect(EdgeType.DEPENDS_ON).toBe('DEPENDS_ON');
  });
});
