import { readFileSync } from 'fs';
import { join } from 'path';

export class TestDataManager {
  private static instance: TestDataManager;
  private dataCache: Map<string, any> = new Map();

  static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  loadTestData(fileName: string): any {
    if (this.dataCache.has(fileName)) {
      return this.dataCache.get(fileName);
    }

    try {
      const filePath = join(process.cwd(), 'data', fileName);
      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      this.dataCache.set(fileName, data);
      return data;
    } catch (error) {
      throw new Error(`Failed to load test data from ${fileName}: ${error}`);
    }
  }

  getUser(userType: string = 'default'): any {
    const users = this.loadTestData('users.json');
    return users[userType] || users.default;
  }

  getApiEndpoints(): any {
    return this.loadTestData('api-endpoints.json');
  }

  getTestConfig(): any {
    return this.loadTestData('test-config.json');
  }
}