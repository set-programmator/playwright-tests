import * as fs from 'fs';
import * as path from 'path';

export class MockServer {
  private mockData: Map<string, any> = new Map();
  private interceptedRequests: Array<any> = [];
  private contractValidations: Array<ContractValidation> = [];

  constructor() {
    this.loadMockData();
  }

  private loadMockData() {
    const mockDataDir = path.join(process.cwd(), 'data', 'mock-responses');
    if (!fs.existsSync(mockDataDir)) {
      fs.mkdirSync(mockDataDir, { recursive: true });
      this.createSampleMockData();
    }

    try {
      const files = fs.readdirSync(mockDataDir);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const endpoint = file.replace('.json', '');
          const data = JSON.parse(fs.readFileSync(path.join(mockDataDir, file), 'utf8'));
          this.mockData.set(endpoint, data);
        }
      });
    } catch (error) {
      console.warn('Failed to load mock data:', error instanceof Error ? error.message : String(error));
    }
  }

  private createSampleMockData() {
    const mockDataDir = path.join(process.cwd(), 'data', 'mock-responses');
    
    // Sample user API responses
    const usersResponse = {
      "GET_users": {
        "status": 200,
        "response": [
          { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "admin" },
          { "id": 2, "name": "Jane Smith", "email": "jane@example.com", "role": "user" }
        ]
      },
      "GET_users_1": {
        "status": 200,
        "response": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "admin" }
      },
      "POST_users": {
        "status": 201,
        "response": { "id": 3, "name": "New User", "email": "new@example.com", "role": "user" }
      }
    };

    // Sample API errors
    const errorsResponse = {
      "GET_users_404": {
        "status": 404,
        "response": { "error": "User not found", "code": "USER_NOT_FOUND" }
      },
      "POST_users_400": {
        "status": 400,
        "response": { "error": "Invalid user data", "code": "VALIDATION_ERROR", "details": ["Email is required"] }
      }
    };

    fs.writeFileSync(path.join(mockDataDir, 'users.json'), JSON.stringify(usersResponse, null, 2));
    fs.writeFileSync(path.join(mockDataDir, 'errors.json'), JSON.stringify(errorsResponse, null, 2));
    
    console.log('Created sample mock data files');
  }

  async setupMockRoutes(page: any) {
    // Intercept API calls and return mock responses
    await page.route('**/api/**', async (route: any, request: any) => {
      const url = new URL(request.url());
      const method = request.method();
      const path = url.pathname.replace('/api/', '');
      
      const mockKey = `${method}_${path.replace(/\//g, '_')}`;
      
      // Log the request for analysis
      this.interceptedRequests.push({
        method,
        url: url.toString(),
        path,
        headers: request.headers(),
        body: request.postData(),
        timestamp: new Date().toISOString()
      });

      // Find matching mock response
      const mockResponse = this.findMockResponse(mockKey);
      
      if (mockResponse) {
        await route.fulfill({
          status: mockResponse.status,
          contentType: 'application/json',
          body: JSON.stringify(mockResponse.response),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Mock-Server': 'playwright-boilerplate'
          }
        });
      } else {
        // Continue with original request if no mock found
        await route.continue();
      }
    });
  }

  private findMockResponse(key: string): any {
    // First try exact match
    for (const [mockKey, mockData] of this.mockData) {
      if (mockData[key]) {
        return mockData[key];
      }
    }

    // Try pattern matching for dynamic routes (e.g., users_123 -> users_id)
    for (const [mockKey, mockData] of this.mockData) {
      Object.keys(mockData).forEach(responseKey => {
        if (this.matchesPattern(key, responseKey)) {
          return mockData[responseKey];
        }
      });
    }

    return null;
  }

  private matchesPattern(actual: string, pattern: string): boolean {
    // Convert patterns like "GET_users_id" to match "GET_users_123"
    const regex = new RegExp(pattern.replace(/id|ID/g, '\\d+'), 'i');
    return regex.test(actual);
  }

  async validateAPIContract(page: any, contractPath: string): Promise<ContractValidationResult> {
    const contract = this.loadContract(contractPath);
    const validations: ContractValidation[] = [];

    for (const endpoint of contract.endpoints) {
      const validation = await this.validateEndpoint(page, endpoint);
      validations.push(validation);
    }

    const result: ContractValidationResult = {
      contractName: contract.name,
      totalEndpoints: contract.endpoints.length,
      passedValidations: validations.filter(v => v.passed).length,
      failedValidations: validations.filter(v => !v.passed),
      validations
    };

    this.contractValidations.push(...validations);
    return result;
  }

  private loadContract(contractPath: string): APIContract {
    const fullPath = path.join(process.cwd(), 'data', 'contracts', contractPath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Contract file not found: ${contractPath}`);
    }

    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  }

  private async validateEndpoint(page: any, endpoint: APIEndpoint): Promise<ContractValidation> {
    try {
      // Make API request
      const response = await page.request[endpoint.method.toLowerCase()](endpoint.path, {
        data: endpoint.requestBody,
        headers: endpoint.headers
      });

      const responseBody = await response.json();
      
      // Validate response structure
      const schemaValid = this.validateSchema(responseBody, endpoint.responseSchema);
      const statusValid = response.status() === endpoint.expectedStatus;

      return {
        endpoint: `${endpoint.method} ${endpoint.path}`,
        passed: schemaValid && statusValid,
        actualStatus: response.status(),
        expectedStatus: endpoint.expectedStatus,
        schemaValidation: schemaValid,
        errors: schemaValid ? [] : this.getSchemaErrors(responseBody, endpoint.responseSchema),
        response: responseBody
      };
    } catch (error) {
      return {
        endpoint: `${endpoint.method} ${endpoint.path}`,
        passed: false,
        actualStatus: 0,
        expectedStatus: endpoint.expectedStatus,
        schemaValidation: false,
        errors: [error instanceof Error ? error.message : String(error)],
        response: null
      };
    }
  }

  private validateSchema(data: any, schema: any): boolean {
    // Basic JSON schema validation
    if (schema.type === 'object') {
      if (typeof data !== 'object' || data === null) return false;
      
      if (schema.required) {
        for (const field of schema.required) {
          if (!(field in data)) return false;
        }
      }

      if (schema.properties) {
        for (const [prop, propSchema] of Object.entries(schema.properties)) {
          if (prop in data && !this.validateSchema(data[prop], propSchema)) {
            return false;
          }
        }
      }
    }

    if (schema.type === 'array') {
      if (!Array.isArray(data)) return false;
      
      if (schema.items) {
        return data.every(item => this.validateSchema(item, schema.items));
      }
    }

    if (schema.type === 'string') {
      return typeof data === 'string';
    }

    if (schema.type === 'number') {
      return typeof data === 'number';
    }

    if (schema.type === 'boolean') {
      return typeof data === 'boolean';
    }

    return true;
  }

  private getSchemaErrors(data: any, schema: any): string[] {
    const errors: string[] = [];
    
    if (schema.type === 'object' && (typeof data !== 'object' || data === null)) {
      errors.push('Expected object, got ' + typeof data);
    }

    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Required field missing: ${field}`);
        }
      }
    }

    return errors;
  }

  getInterceptedRequests(): Array<any> {
    return this.interceptedRequests;
  }

  generateMockReport(): string {
    const report = {
      totalRequests: this.interceptedRequests.length,
      uniqueEndpoints: new Set(this.interceptedRequests.map(r => `${r.method} ${r.path}`)).size,
      mockResponsesCovered: this.mockData.size,
      contractValidations: this.contractValidations.length,
      interceptedRequests: this.interceptedRequests,
      timestamp: new Date().toISOString()
    };

    const reportPath = path.join(process.cwd(), 'reports', 'mock-server-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    return reportPath;
  }
}

// Types
interface APIContract {
  name: string;
  version: string;
  baseUrl: string;
  endpoints: APIEndpoint[];
}

interface APIEndpoint {
  path: string;
  method: string;
  description: string;
  requestBody?: any;
  headers?: Record<string, string>;
  expectedStatus: number;
  responseSchema: any;
}

interface ContractValidation {
  endpoint: string;
  passed: boolean;
  actualStatus: number;
  expectedStatus: number;
  schemaValidation: boolean;
  errors: string[];
  response: any;
}

interface ContractValidationResult {
  contractName: string;
  totalEndpoints: number;
  passedValidations: number;
  failedValidations: ContractValidation[];
  validations: ContractValidation[];
}

export const mockServer = new MockServer();