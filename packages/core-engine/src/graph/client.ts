import neo4j, { Driver, Session, Record } from 'neo4j-driver';

export interface GraphClientConfig {
  uri: string;
  username: string;
  password: string;
}

export class GraphClient {
  private driver: Driver;

  constructor(config: GraphClientConfig) {
    this.driver = neo4j.driver(
      config.uri,
      neo4j.auth.basic(config.username, config.password)
    );
  }

  async connect(): Promise<void> {
    await this.driver.verifyConnectivity();
  }

  async close(): Promise<void> {
    await this.driver.close();
  }

  async executeQuery(query: string, params: Record<string, any> = {}): Promise<Record[]> {
    const session: Session = this.driver.session();
    try {
      const result = await session.run(query, params);
      return result.records;
    } finally {
      await session.close();
    }
  }

  async executeWrite(query: string, params: Record<string, any> = {}): Promise<void> {
    const session: Session = this.driver.session();
    try {
      await session.run(query, params);
    } finally {
      await session.close();
    }
  }

  getDriver(): Driver {
    return this.driver;
  }
}
