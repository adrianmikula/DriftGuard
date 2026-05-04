// Mock for neo4j-driver that supports both default and named imports
// Used by GraphClient: import neo4j, { Driver, Session, Record } from 'neo4j-driver';

import { vi } from 'vitest';

// Create a single mock session instance to be reused
const mockSession = {
  run: vi.fn().mockResolvedValue({
    records: [
      { keys: () => ['name'], get: (k: string) => ({ name: 'Test Node' } as any), toJSON: () => ({ name: 'Test Node' }) },
      { keys: () => ['count'], get: (k: string) => ({ count: 5 } as any), toJSON: () => ({ count: 5 }) }
    ],
    sum: () => 2,
    consume: () => ({ stats: { counters: {} } }),
  }),
  close: vi.fn().mockResolvedValue(undefined),
};

const mockDriverInstance = {
  session: vi.fn(() => mockSession),
  close: vi.fn().mockResolvedValue(undefined),
  verifyConnectivity: vi.fn().mockResolvedValue(undefined),
};

export const driver = vi.fn().mockReturnValue(mockDriverInstance);
export const auth = {
  basic: vi.fn().mockReturnValue({}),
};

export type Driver = typeof mockDriverInstance;
export type Session = typeof mockSession;
export type Neo4jRecord = {
  keys: () => string[];
  get: (key: string) => any;
  toJSON: () => Record<string, any>
};

export default { driver, auth };

export function setMockDriver(customDriver: any) {
  Object.assign(mockDriverInstance, customDriver);
}

export function getMockDriver() {
  return mockDriverInstance;
}

export function getMockSession() {
  return mockSession;
}

export function resetMocks() {
  vi.clearAllMocks();
  // The mockSession's run/close implementations remain intact; only call counts are cleared
  driver.mockReturnValue(mockDriverInstance);
  auth.basic.mockReturnValue({});
}