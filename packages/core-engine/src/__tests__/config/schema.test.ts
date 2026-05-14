import { describe, it, expect } from 'vitest';
import { ConfigSchema } from '../../config/schema';

describe('ConfigSchema (Smoke Test)', () => {
  it('should have schema validation', () => {
    // Verify the schema is defined and can be used
    expect(ConfigSchema).toBeDefined();
  });
});
