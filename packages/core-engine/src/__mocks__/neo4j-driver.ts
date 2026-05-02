// Mock for neo4j-driver that supports both default and named imports
// Used by GraphClient: import neo4j, { Driver, Session, Record } from 'neo4j-driver';

const mockDriverInstance = {
  session: vi.fn(() => ({
    run: vi.fn().mockResolvedValue({
      records: [
        { keys: () => ['name'], get: (k) => ({ name: 'Test Node' } as any), toJSON: () => ({ name: 'Test Node' }) },
        { keys: () => ['count'], get: (k) => ({ count: 5 } as any), toJSON: () => ({ count: 5 }) }
      ],
      sum: () => 2,
      consume: () => ({ stats: { counters: {} } }),
    }),
    close: vi.fn().mockResolvedValue(undefined),
  })),
  close: vi.fn().mockResolvedValue(undefined),
  verifyConnectivity: vi.fn().mockResolvedValue(undefined),
};

export const driver = vi.fn().mockReturnValue(mockDriverInstance);
export const auth = {
  basic: vi.fn().mockReturnValue({}),
};

export type Driver = typeof mockDriverInstance;
export type Session = ReturnType<typeof mockDriverInstance.session>;
export type Record = { 
  keys: () => string[]; 
  get: (key: string) => any; 
  toJSON: () => Record<string, any> 
};

export default { driver, auth };

export function setMockDriver(customDriver) {
  Object.assign(mockDriverInstance, customDriver);
}

export function resetMocks() {
  vi.clearAllMocks();
  driver.mockReturnValue(mockDriverInstance);
  auth.basic.mockReturnValue({});
}