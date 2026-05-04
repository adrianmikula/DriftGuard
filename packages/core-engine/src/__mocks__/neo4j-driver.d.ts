declare const mockDriverInstance: {
    session: any;
    close: any;
    verifyConnectivity: any;
};
export declare const driver: any;
export declare const auth: {
    basic: any;
};
export type Driver = typeof mockDriverInstance;
export type Session = ReturnType<typeof mockDriverInstance.session>;
export type Record = {
    keys: () => string[];
    get: (key: string) => any;
    toJSON: () => Record<string, any>;
};
declare const _default: {
    driver: any;
    auth: {
        basic: any;
    };
};
export default _default;
export declare function setMockDriver(customDriver: any): void;
export declare function resetMocks(): void;
